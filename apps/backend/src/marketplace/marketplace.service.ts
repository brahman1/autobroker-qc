import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async watchlist(userId: string) {
    return this.prisma.watchlist.findMany({ where: { userId }, include: { vehicle: { include: { auctions: { where: { status: 'LIVE' }, take: 1 } } } }, orderBy: { createdAt: 'desc' } });
  }

  async addWatchlist(userId: string, vehicleId: string) {
    await this.assertVehicle(vehicleId);
    return this.prisma.watchlist.upsert({ where: { userId_vehicleId: { userId, vehicleId } }, create: { userId, vehicleId }, update: {} });
  }

  async removeWatchlist(userId: string, vehicleId: string) {
    return this.prisma.watchlist.delete({ where: { userId_vehicleId: { userId, vehicleId } } });
  }

  async savedSearches(userId: string) {
    return this.prisma.savedSearch.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  }

  async saveSearch(userId: string, data: { name: string; filters: Record<string, unknown> }) {
    if (!data.name?.trim()) throw new BadRequestException('Un nom de recherche est requis');
    return this.prisma.savedSearch.create({ data: { userId, name: data.name.trim(), filters: (data.filters || {}) as Prisma.InputJsonValue } });
  }

  async deleteSavedSearch(userId: string, id: string) {
    const result = await this.prisma.savedSearch.deleteMany({ where: { id, userId } });
    if (!result.count) throw new NotFoundException('Recherche enregistrée introuvable');
    return { deleted: true };
  }

  async notifications(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async communications(userId: string) {
    return this.prisma.communicationLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async markNotificationRead(userId: string, id: string) {
    const result = await this.prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
    if (!result.count) throw new NotFoundException('Notification introuvable');
    return { read: true };
  }

  async createOffer(userId: string, data: { vehicleId: string; amount: number; auctionId?: string }) {
    await this.assertEligibleBuyer(userId);
    const vehicle = await this.assertVehicle(data.vehicleId);
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new BadRequestException('Le montant de l’offre est invalide');
    const offer = await this.prisma.offer.create({ data: { userId, vehicleId: vehicle.id, auctionId: data.auctionId, amount: data.amount, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) } });
    await this.notify(userId, 'OFFER_RECEIVED', 'Offre transmise', `Votre offre de ${data.amount.toLocaleString('fr-CA')} $ CAD est en attente d’examen.`, { offerId: offer.id });
    return offer;
  }

  async myOffers(userId: string) {
    return this.prisma.offer.findMany({ where: { userId }, include: { vehicle: true, auction: true }, orderBy: { createdAt: 'desc' } });
  }

  async allOffers() {
    return this.prisma.offer.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        vehicle: true,
        auction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewOffer(id: string, status: 'ACCEPTED' | 'DECLINED', actorUserId?: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id }, include: { vehicle: true } });
    if (!offer) throw new NotFoundException('Offre introuvable');
    if (offer.status !== 'PENDING') throw new BadRequestException('Cette offre a déjà été traitée');
    const updated = await this.prisma.offer.update({ where: { id }, data: { status } });
    await this.logAudit(actorUserId, 'OFFER_REVIEWED', 'OFFER', id, { status, amount: offer.amount, vehicleId: offer.vehicleId });
    if (status === 'ACCEPTED') {
      const order = await this.createOrder(offer.userId, offer.vehicleId, offer.amount, offer.auctionId, 'OFFER_ACCEPTED');
      await this.notify(offer.userId, 'OFFER_ACCEPTED', 'Offre acceptée', `Votre offre pour ${offer.vehicle.year} ${offer.vehicle.make} ${offer.vehicle.model} est acceptée.`, { orderId: order.id });
      return { offer: updated, order };
    }
    await this.notify(offer.userId, 'OFFER_DECLINED', 'Offre non retenue', 'Vous pouvez soumettre une nouvelle offre ou surveiller les prochaines enchères.', { offerId: id });
    return { offer: updated };
  }

  async buyNow(userId: string, vehicleId: string) {
    await this.assertEligibleBuyer(userId);
    const vehicle = await this.assertVehicle(vehicleId);
    if (!vehicle.buyNowPrice) throw new BadRequestException('Ce véhicule n’est pas disponible à l’achat immédiat');
    const existing = await this.prisma.order.findFirst({ where: { userId, vehicleId, status: { notIn: ['CANCELLED', 'COMPLETED'] } } });
    if (existing) throw new BadRequestException('Une commande est déjà en cours pour ce véhicule');
    const order = await this.createOrder(userId, vehicleId, vehicle.buyNowPrice, undefined, 'BUY_NOW');
    await this.notify(userId, 'BUY_NOW_CONFIRMED', 'Achat immédiat réservé', `Votre véhicule est réservé. Paiement requis avant l’échéance indiquée.`, { orderId: order.id });
    return order;
  }

  async createAuctionWinningOrder(auction: { id: string; vehicleId: string; currentWinnerId: string | null; currentBid: number }) {
    if (!auction.currentWinnerId) return null;
    const existing = await this.prisma.order.findFirst({ where: { auctionId: auction.id } });
    if (existing) return existing;
    const order = await this.createOrder(auction.currentWinnerId, auction.vehicleId, auction.currentBid, auction.id, 'AUCTION_WON');
    await this.notify(auction.currentWinnerId, 'AUCTION_WON', 'Enchère remportée', `Votre commande ${order.orderNumber} est prête.`, { orderId: order.id });
    return order;
  }

  async myOrders(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, include: { vehicle: true, auction: true, documents: true, transportQuotes: true }, orderBy: { createdAt: 'desc' } });
  }

  async allOrders() {
    return this.prisma.order.findMany({ include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, vehicle: true, transportQuotes: true }, orderBy: { createdAt: 'desc' } });
  }

  async updateOrderStatus(id: string, status: string, actorUserId?: string) {
    const allowedStatuses = ['RESERVED', 'AWAITING_PAYMENT', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) throw new BadRequestException('Statut de commande invalide');
    const order = await this.prisma.order.update({ where: { id }, data: { status }, include: { vehicle: true } });
    await this.notify(order.userId, 'ORDER_UPDATE', 'Mise à jour de commande', `Votre commande ${order.orderNumber} est maintenant : ${status}.`, { orderId: id });
    await this.logAudit(actorUserId, 'ORDER_STATUS_UPDATED', 'ORDER', id, { orderNumber: order.orderNumber, status });
    return order;
  }

  async myDisputes(userId: string) {
    return this.prisma.dispute.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  }

  async createDispute(userId: string, data: { orderId?: string; subject: string; description: string }) {
    const subject = data.subject?.trim();
    const description = data.description?.trim();
    if (!subject || !description) throw new BadRequestException('Le sujet et la description du litige sont requis');
    if (subject.length > 160 || description.length > 5000) throw new BadRequestException('Le litige dépasse la taille autorisée');
    if (data.orderId) {
      const order = await this.prisma.order.findFirst({ where: { id: data.orderId, userId } });
      if (!order) throw new NotFoundException('Commande introuvable');
    }
    const dispute = await this.prisma.dispute.create({ data: { userId, orderId: data.orderId, subject, description } });
    await this.notify(userId, 'DISPUTE_CREATED', 'Demande envoyée', 'Votre demande a été transmise à notre équipe de soutien.', { disputeId: dispute.id });
    await this.logAudit(userId, 'DISPUTE_CREATED', 'DISPUTE', dispute.id, { orderId: data.orderId, subject });
    return dispute;
  }

  async allDisputes() {
    const disputes = await this.prisma.dispute.findMany({ orderBy: { updatedAt: 'desc' } });
    const userIds = [...new Set(disputes.map((item) => item.userId))];
    const users = userIds.length ? await this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true, email: true } }) : [];
    const byId = new Map(users.map((user) => [user.id, user]));
    return disputes.map((dispute) => ({ ...dispute, user: byId.get(dispute.userId) || null }));
  }

  async updateDispute(id: string, data: { status?: string; resolution?: string }, actorUserId: string) {
    const allowedStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];
    if (!data.status || !allowedStatuses.includes(data.status)) throw new BadRequestException('Statut de litige invalide');
    const dispute = await this.prisma.dispute.update({ where: { id }, data: { status: data.status, resolution: data.resolution?.trim() || null } });
    await this.notify(dispute.userId, 'DISPUTE_UPDATED', 'Mise à jour de votre demande', `Votre demande est maintenant : ${dispute.status}.`, { disputeId: dispute.id });
    await this.logAudit(actorUserId, 'DISPUTE_UPDATED', 'DISPUTE', id, { status: dispute.status });
    return dispute;
  }

  async auditLogs() {
    const logs = await this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 250 });
    const actorIds = [...new Set(logs.map((item) => item.actorUserId).filter((id): id is string => Boolean(id)))];
    const users = actorIds.length ? await this.prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, firstName: true, lastName: true, email: true } }) : [];
    const byId = new Map(users.map((user) => [user.id, user]));
    return logs.map((log) => ({ ...log, actor: log.actorUserId ? byId.get(log.actorUserId) || null : null }));
  }

  async documents(userId: string) {
    return this.prisma.document.findMany({ where: { userId }, include: { order: { select: { id: true, orderNumber: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async allDocuments() {
    return this.prisma.document.findMany({ include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, order: { select: { id: true, orderNumber: true } } }, orderBy: { createdAt: 'desc' }, take: 500 });
  }

  async downloadableDocument(id: string, userId: string, role?: string) {
    const document = await this.prisma.document.findUnique({ where: { id }, include: { order: { include: { vehicle: true } } } });
    if (!document) throw new NotFoundException('Document introuvable');
    const staff = ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT'].includes(role || '');
    if (!staff && document.userId !== userId) throw new NotFoundException('Document introuvable');
    return document;
  }

  async transportQuote(userId: string, data: { vehicleId: string; destinationPostalCode: string; serviceLevel?: string; orderId?: string }) {
    const vehicle = await this.assertVehicle(data.vehicleId);
    if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(data.destinationPostalCode)) throw new BadRequestException('Code postal canadien invalide');
    const level = data.serviceLevel === 'EXPRESS' ? 'EXPRESS' : 'STANDARD';
    const regionalRate = vehicle.location.toLowerCase().includes('québec') || vehicle.location.toLowerCase().includes('montreal') ? 450 : 850;
    const amount = regionalRate + (level === 'EXPRESS' ? 250 : 0);
    const quote = await this.prisma.transportQuote.create({ data: { userId, vehicleId: vehicle.id, orderId: data.orderId, destinationPostalCode: data.destinationPostalCode.toUpperCase(), serviceLevel: level, amount, estimatedPickupAt: new Date(Date.now() + 2 * 86400000), estimatedDeliveryAt: new Date(Date.now() + (level === 'EXPRESS' ? 5 : 10) * 86400000) } });
    await this.notify(userId, 'TRANSPORT_QUOTE', 'Devis de transport disponible', `Votre devis de transport est de ${amount} $ CAD.`, { quoteId: quote.id });
    return quote;
  }

  async myTransportQuotes(userId: string) {
    return this.prisma.transportQuote.findMany({ where: { userId }, include: { vehicle: true, order: true }, orderBy: { createdAt: 'desc' } });
  }

  async allTransportQuotes() {
    return this.prisma.transportQuote.findMany({ include: { vehicle: true, order: true }, orderBy: { createdAt: 'desc' }, take: 500 });
  }

  private async createOrder(userId: string, vehicleId: string, winningBid: number, auctionId: string | undefined, source: string) {
    const buyerFee = Math.max(400, Math.round(winningBid * 0.08));
    const subtotal = winningBid + buyerFee;
    const taxesAmount = Math.round(subtotal * 0.14975 * 100) / 100;
    const totalAmount = subtotal + taxesAmount;
    const orderNumber = `ABQC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const order = await this.prisma.order.create({ data: { orderNumber, userId, vehicleId, auctionId, winningBid, buyerFee, taxesAmount, totalAmount, dueAt: new Date(Date.now() + 72 * 60 * 60 * 1000), status: source === 'BUY_NOW' ? 'RESERVED' : 'AWAITING_PAYMENT' } });
    await this.prisma.document.createMany({ data: [
      { userId, orderId: order.id, type: 'INVOICE', fileName: `facture-${orderNumber}.pdf`, storageUrl: `/demo-documents/${orderNumber}/facture.pdf` },
      { userId, orderId: order.id, type: 'PURCHASE_AGREEMENT', fileName: `contrat-${orderNumber}.pdf`, storageUrl: `/demo-documents/${orderNumber}/contrat.pdf` },
    ] });
    return order;
  }

  private async assertVehicle(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Véhicule introuvable');
    return vehicle;
  }

  private async assertEligibleBuyer(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.kycStatus !== 'VERIFIED') throw new BadRequestException('Une identité vérifiée est requise');
    const deposit = await this.prisma.deposit.findFirst({ where: { userId, status: 'HOLD' } });
    if (!deposit) throw new BadRequestException('Une caution active est requise');
  }

  private async notify(userId: string, type: string, title: string, message: string, payload?: Record<string, unknown>) {
    const notification = await this.prisma.notification.create({ data: { userId, type, title, message, payload: { ...payload, delivery: { inApp: 'DELIVERED', email: 'SIMULATED', sms: 'SIMULATED' } } as Prisma.InputJsonValue } });
    const communicationRepository = this.prisma.communicationLog as any;
    if (communicationRepository?.createMany) await communicationRepository.createMany({ data: [
      { userId, channel: 'IN_APP', status: 'DELIVERED', subject: title, body: message },
      { userId, channel: 'EMAIL', status: 'SIMULATED', subject: title, body: message },
      { userId, channel: 'SMS', status: 'SIMULATED', subject: title, body: message },
    ] });
    return notification;
  }

  private logAudit(actorUserId: string | undefined, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) {
    return this.prisma.auditLog.create({ data: { actorUserId, action, entityType, entityId, metadata: metadata ? metadata as Prisma.InputJsonValue : undefined } });
  }
}
