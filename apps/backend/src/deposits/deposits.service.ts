import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class DepositsService {
  private stripe: Stripe;
  private useMock: boolean;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.useMock = this.configService.get('stripe.useMock') === true;
    if (!this.useMock) {
      this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createDepositIntent(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.kycStatus !== 'VERIFIED') {
      throw new BadRequestException('Une identité vérifiée est requise pour activer la caution');
    }
    const activeHold = await this.hasActiveHold(userId);
    if (activeHold) {
      throw new BadRequestException('Vous avez déjà un dépôt actif');
    }

    const amount = this.configService.get<number>('stripe.depositAmountCents') || 60000;
    
    let clientSecret = 'mock_client_secret';
    let intentId = 'pi_mock_' + Date.now();

    if (!this.useMock && this.stripe) {
      let customerId = user?.stripeCustomerId || undefined;
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user?.email,
          name: user ? `${user.firstName} ${user.lastName}` : undefined,
          metadata: { autobrokerUserId: userId },
        });
        customerId = customer.id;
        await this.prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
      }
      const intent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'cad',
        capture_method: 'manual', // Holding funds
        customer: customerId,
        payment_method_types: ['card'],
        metadata: { autobrokerUserId: userId, purpose: 'bid_deposit' },
      });
      clientSecret = intent.client_secret;
      intentId = intent.id;
    }

    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        amount,
        currency: 'cad',
        status: this.useMock ? 'HOLD' : 'PENDING',
        stripePaymentIntentId: intentId,
      },
    });
    await this.record(deposit.userId, deposit.id, 'DEPOSIT_AUTHORIZATION', this.useMock ? 'HOLD' : 'PENDING', deposit.amount, deposit.currency, deposit.stripePaymentIntentId);

    return { clientSecret, depositId: deposit.id, isMock: this.useMock };
  }

  async hasActiveHold(userId: string): Promise<boolean> {
    const deposits = await this.prisma.deposit.findMany({
      where: { userId, status: 'HOLD' },
    });
    return deposits.length > 0;
  }

  async confirmHold(depositId: string) {
    const deposit = await this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: 'HOLD' },
    });
    await this.record(deposit.userId, deposit.id, 'DEPOSIT_AUTHORIZATION', 'HOLD', deposit.amount, deposit.currency, deposit.stripePaymentIntentId);
    return deposit;
  }

  async confirmDepositForUser(userId: string, depositId: string) {
    const deposit = await this.prisma.deposit.findFirst({ where: { id: depositId, userId } });
    if (!deposit) throw new BadRequestException('Caution introuvable');
    if (deposit.status === 'HOLD') return deposit;

    if (this.useMock) return this.confirmHold(deposit.id);
    const intent = await this.stripe.paymentIntents.retrieve(deposit.stripePaymentIntentId);
    if (!['requires_capture', 'succeeded'].includes(intent.status)) {
      throw new BadRequestException('La préautorisation Stripe n’est pas encore confirmée');
    }
    if (intent.amount !== Math.round(deposit.amount) || intent.currency !== deposit.currency.toLowerCase()) {
      throw new BadRequestException('Les détails de la préautorisation sont invalides');
    }
    return this.confirmHold(deposit.id);
  }

  async release(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit || deposit.status !== 'HOLD') {
      throw new BadRequestException('Dépôt introuvable ou non actif');
    }

    if (!this.useMock && this.stripe) {
      await this.stripe.paymentIntents.cancel(deposit.stripePaymentIntentId);
    }
    
    const updated = await this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: 'RELEASED' },
    });
    await this.record(updated.userId, updated.id, 'DEPOSIT_RELEASE', 'RELEASED', updated.amount, updated.currency, updated.stripePaymentIntentId);
    return updated;
  }

  async capture(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit || deposit.status !== 'HOLD') {
      throw new BadRequestException('Dépôt introuvable ou non actif');
    }

    if (!this.useMock && this.stripe) {
      if (!deposit.stripePaymentIntentId.startsWith('pi_mock')) {
         try {
           await this.stripe.paymentIntents.capture(deposit.stripePaymentIntentId);
         } catch (e) {
           console.error('Erreur Stripe lors de la capture', e);
         }
      }
    }
    
    const updated = await this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: 'CAPTURED' },
    });
    await this.record(updated.userId, updated.id, 'DEPOSIT_CAPTURE', 'CAPTURED', updated.amount, updated.currency, updated.stripePaymentIntentId);
    return updated;
  }

  async findByUser(userId: string) {
    return this.prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.deposit.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async refund(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit || deposit.status !== 'CAPTURED') throw new BadRequestException('Seule une caution capturée peut être remboursée');
    if (!this.useMock && this.stripe && !deposit.stripePaymentIntentId.startsWith('pi_mock')) {
      await this.stripe.refunds.create({ payment_intent: deposit.stripePaymentIntentId });
    }
    const updated = await this.prisma.deposit.update({ where: { id: depositId }, data: { status: 'REFUNDED' } });
    await this.record(updated.userId, updated.id, 'DEPOSIT_REFUND', 'REFUNDED', updated.amount, updated.currency, updated.stripePaymentIntentId);
    return updated;
  }

  private record(userId: string, depositId: string, type: string, status: string, amount: number, currency: string, reference: string) {
    return this.prisma.paymentEvent.create({ data: { userId, depositId, type, status, amount, currency: currency.toUpperCase(), reference } });
  }
}
