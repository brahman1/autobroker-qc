import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DepositsService } from '../deposits/deposits.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private webhookSecret: string;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private depositsService: DepositsService,
  ) {
    if (this.configService.get('stripe.useMock') !== true) {
      this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
        apiVersion: '2023-10-16',
      });
      this.webhookSecret = this.configService.get('stripe.webhookSecret');
    }
  }

  getPublicConfig() {
    const isMock = this.configService.get<boolean>('stripe.useMock') === true;
    return {
      mode: isMock ? 'demo' : 'test',
      isMock,
      publishableKey: isMock ? null : this.configService.get<string>('stripe.publishableKey') || null,
    };
  }

  async handleWebhook(sig: string, payload: Buffer) {
    if (!this.stripe) {
      this.logger.debug('Mock webhook received');
      return { received: true };
    }

    let event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, this.webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw err;
    }

    switch (event.type) {
      case 'payment_intent.amount_capturable_updated': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const deposit = await this.prisma.deposit.findUnique({
          where: { stripePaymentIntentId: paymentIntent.id },
        });
        if (deposit) {
          await this.depositsService.confirmHold(deposit.id);
        }
        break;
      }
      default:
        this.logger.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  async capture(paymentId: string) {
    if (!this.stripe) {
      return { success: true, mock: true };
    }
    const intent = await this.stripe.paymentIntents.capture(paymentId);
    return intent;
  }

  async createOrderPaymentIntent(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.paymentStatus === 'PAID') throw new BadRequestException('Cette commande est déjà réglée');
    if (this.configService.get<boolean>('stripe.useMock') === true) {
      const reference = `pi_order_mock_${Date.now()}`;
      await this.prisma.order.update({ where: { id: orderId }, data: { paymentReference: reference } });
      await this.prisma.paymentEvent.create({ data: { userId, orderId, type: 'ORDER_PAYMENT_INTENT', status: 'PENDING', amount: order.totalAmount, currency: 'CAD', reference } });
      return { clientSecret: null, paymentReference: reference, isMock: true, amount: Math.round(order.totalAmount * 100) };
    }
    const intent = await this.stripe.paymentIntents.create({ amount: Math.round(order.totalAmount * 100), currency: 'cad', payment_method_types: ['card'], metadata: { autobrokerOrderId: order.id, autobrokerUserId: userId, purpose: 'order_payment' } });
    await this.prisma.order.update({ where: { id: orderId }, data: { paymentReference: intent.id } });
    await this.prisma.paymentEvent.create({ data: { userId, orderId, type: 'ORDER_PAYMENT_INTENT', status: 'PENDING', amount: order.totalAmount, currency: 'CAD', reference: intent.id } });
    return { clientSecret: intent.client_secret, paymentReference: intent.id, isMock: false, amount: intent.amount };
  }

  async confirmOrderPayment(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order?.paymentReference) throw new BadRequestException('Initialisez le paiement avant de le confirmer');
    const isMock = this.configService.get<boolean>('stripe.useMock') === true;
    if (!isMock) {
      const intent = await this.stripe.paymentIntents.retrieve(order.paymentReference);
      if (intent.status !== 'succeeded') throw new BadRequestException('Le paiement Stripe n’est pas encore confirmé');
    }
    const updated = await this.prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID', status: 'PROCESSING' } });
    await this.prisma.paymentEvent.create({ data: { userId, orderId, type: 'ORDER_PAYMENT', status: 'PAID', amount: updated.totalAmount, currency: 'CAD', reference: updated.paymentReference } });
    await this.prisma.notification.create({ data: { userId, type: 'ORDER_PAYMENT_CONFIRMED', title: 'Paiement confirmé', message: `Le paiement de la commande ${updated.orderNumber} est confirmé.`, payload: { orderId, paymentReference: updated.paymentReference } } });
    return updated;
  }

  async paymentHistory(userId: string) {
    return this.prisma.paymentEvent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 200 });
  }
}
