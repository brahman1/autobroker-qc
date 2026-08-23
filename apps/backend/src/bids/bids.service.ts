import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {}

  async create(data: any) {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new BadRequestException('Montant d\'enchère invalide');
    }

    const auction = await this.prisma.auction.findUnique({ where: { id: data.auctionId } });
    if (!auction || auction.status !== 'LIVE') {
      throw new BadRequestException('Ench�re invalide ou termin�e');
    }

    if (auction.scheduledEndAt.getTime() <= Date.now()) {
      throw new BadRequestException('Ench�re termin�e');
    }

    const bidder = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!bidder || bidder.kycStatus !== 'VERIFIED') {
      throw new BadRequestException('Une identité vérifiée est requise pour enchérir');
    }

    const activeDeposit = await this.prisma.deposit.findFirst({
      where: { userId: data.userId, status: 'HOLD' },
    });
    if (!activeDeposit) {
      throw new BadRequestException('Un d�p�t actif est requis pour ench�rir');
    }

    const bidRepository = this.prisma.bid as any;
    const recentBids = bidRepository.count ? await bidRepository.count({ where: { userId: data.userId, timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) } } }) : 0;
    if (recentBids >= 12) {
      await this.prisma.auditLog.create({ data: { actorUserId: data.userId, action: 'FRAUD_RISK_EXCESSIVE_BIDDING', entityType: 'USER', entityId: data.userId, metadata: { auctionId: data.auctionId, recentBids } } });
      await this.flag(data.userId, data.auctionId, 'EXCESSIVE_BIDDING', 'HIGH', { recentBids, ...data.riskContext });
      throw new BadRequestException('Trop de tentatives de mise rapprochées. Réessayez dans quelques minutes.');
    }
    if (auction.currentBid > 0 && data.amount > auction.currentBid * 100) {
      await this.prisma.auditLog.create({ data: { actorUserId: data.userId, action: 'FRAUD_RISK_UNUSUAL_BID', entityType: 'BID', entityId: data.auctionId, metadata: { amount: data.amount, currentBid: auction.currentBid } } });
      await this.flag(data.userId, data.auctionId, 'UNUSUAL_BID_AMOUNT', 'MEDIUM', { amount: data.amount, currentBid: auction.currentBid, ...data.riskContext });
      throw new BadRequestException('Montant de mise inhabituel détecté. Contactez le soutien si cette mise est intentionnelle.');
    }
    if (bidder.phone) {
      const linkedAccounts = await this.prisma.user.findMany({ where: { phone: bidder.phone }, select: { id: true } });
      if (linkedAccounts.length > 2) await this.flag(data.userId, data.auctionId, 'SHARED_PHONE_MULTIPLE_ACCOUNTS', 'MEDIUM', { accountCount: linkedAccounts.length });
    }

    const incomingMaxBid = data.amount;
    const bidIncrement = 100; // Pas d'ench�re de 100$

    if (auction.currentBid === 0 && incomingMaxBid < auction.startingBid) {
      throw new BadRequestException('Le montant doit �tre sup�rieur ou �gal � la mise de d�part');
    }

    if (incomingMaxBid <= auction.currentBid) {
      throw new BadRequestException('Le montant doit �tre sup�rieur � la mise actuelle');
    }

    // Proxy Bidding Logic
    const currentWinningBid = await this.prisma.bid.findFirst({
      where: { auctionId: data.auctionId, status: 'WINNING' }
    });

    let newActualBid = auction.currentBid;
    let finalWinnerId = data.userId;

    if (!currentWinningBid) {
      // First bid on the auction
      newActualBid = auction.startingBid;
    } else {
      if (data.userId === currentWinningBid.userId) {
        // L'utilisateur augmente juste son max bid, l'ench�re actuelle ne bouge pas
        newActualBid = auction.currentBid;
      } else if (incomingMaxBid <= currentWinningBid.maxBidAmount) {
        // Le gagnant actuel a un max plus �lev�, il contre-attaque automatiquement !
        newActualBid = Math.min(incomingMaxBid + bidIncrement, currentWinningBid.maxBidAmount);
        finalWinnerId = currentWinningBid.userId;
      } else {
        // Le nouveau bat l'ancien
        newActualBid = Math.min(currentWinningBid.maxBidAmount + bidIncrement, incomingMaxBid);
      }
    }

    // Marquer toutes les anciennes mises comme OUTBID
    await this.prisma.bid.updateMany({
      where: { auctionId: data.auctionId, status: 'WINNING' },
      data: { status: 'OUTBID' },
    });

    // Enregistrer la mise de l'utilisateur entrant (qu'elle soit gagnante ou perdante)
    const incomingBidStatus = (finalWinnerId === data.userId) ? 'WINNING' : 'OUTBID';
    const userBid = await this.prisma.bid.create({
      data: {
        auctionId: data.auctionId,
        userId: data.userId,
        maxBidAmount: incomingMaxBid,
        actualBidAmount: (incomingBidStatus === 'WINNING') ? newActualBid : incomingMaxBid,
        status: incomingBidStatus,
      },
    });

    // S'il y a eu une contre-attaque automatique de l'ancien gagnant, enregistrer sa nouvelle mise gagnante
    if (finalWinnerId !== data.userId && currentWinningBid) {
      await this.prisma.bid.create({
        data: {
          auctionId: data.auctionId,
          userId: currentWinningBid.userId,
          maxBidAmount: currentWinningBid.maxBidAmount,
          actualBidAmount: newActualBid,
          status: 'WINNING',
        },
      });
    }

    // Mettre � jour l'ench�re
    const remainingMs = auction.scheduledEndAt.getTime() - Date.now();
    let newEndAt = auction.scheduledEndAt;
    
    // ANTI-SNIPING: R�gle des 15 secondes
    if (remainingMs < 15000) {
      newEndAt = new Date(Date.now() + 15000);
      this.eventsGateway.updateAuctionCache(auction.id, newEndAt);
      this.eventsGateway.server.to(`auction_${data.auctionId}`).emit('auction:extended', { newEndAt });
    }

    const updatedAuction = await this.prisma.auction.update({
      where: { id: data.auctionId },
      data: {
        currentBid: newActualBid,
        currentWinnerId: finalWinnerId,
        bidCount: { increment: (finalWinnerId !== data.userId) ? 2 : 1 },
        scheduledEndAt: newEndAt,
      },
    });

    // Diffuser via WebSocket
    this.eventsGateway.server.to(`auction_${data.auctionId}`).emit('bid:new', {
      auctionId: data.auctionId,
      currentBid: updatedAuction.currentBid,
      winnerId: updatedAuction.currentWinnerId,
    });
    
    // Emettre une alerte de surench�re cibl�e � l'ancien gagnant
    if (currentWinningBid && finalWinnerId === data.userId && currentWinningBid.userId !== data.userId) {
      this.eventsGateway.server.emit('notification:outbid', {
        userId: currentWinningBid.userId,
        auctionId: data.auctionId,
        vehicleName: "ce v�hicule"
      });
    } else if (finalWinnerId !== data.userId) {
       // L'utilisateur entrant vient de se faire auto-bid directement
       this.eventsGateway.server.emit('notification:outbid', {
        userId: data.userId,
        auctionId: data.auctionId,
        vehicleName: "ce v�hicule"
      });
    }

    if (finalWinnerId !== data.userId) {
      throw new BadRequestException(`Surench�re automatique ! Un autre joueur a une mise maximum sup�rieure � ${incomingMaxBid}$`);
    }

    return userBid;
  }

  async findByAuction(auctionId: string) {
    return this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: { user: { select: { id: true, firstName: true } } },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.bid.findMany({
      where: { userId },
      include: { auction: { include: { vehicle: true } } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async fraudFlags() {
    return this.prisma.fraudFlag.findMany({ orderBy: { createdAt: 'desc' }, take: 250 });
  }

  async reviewFraudFlag(id: string, reviewerId: string, status: string) {
    if (!['REVIEWED', 'DISMISSED', 'ESCALATED'].includes(status)) throw new BadRequestException('Statut de revue invalide');
    return this.prisma.fraudFlag.update({ where: { id }, data: { status, reviewedBy: reviewerId, reviewedAt: new Date() } });
  }

  private flag(userId: string, auctionId: string, type: string, severity: string, details: Record<string, unknown>) {
    const flags = this.prisma.fraudFlag as any;
    return flags?.create ? flags.create({ data: { userId, auctionId, type, severity, details } }) : Promise.resolve();
  }
}

