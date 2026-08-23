import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    if (process.env.SEED_DEMO_DATA !== 'true') {
      this.logger.log('Données de démonstration désactivées.');
      return;
    }
    await this.seed();
  }

  private async seed() {
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      this.logger.log('Base de données existante détectée. Ajout des données Marketplace manquantes.');
      await this.seedMarketplaceForExistingData();
      return;
    }

    this.logger.log('Peuplement de la base de données PostgreSQL...');
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const clientHash = await bcrypt.hash('Client123!', 10);

    const admin = await this.prisma.user.create({
      data: {
        email: 'admin@autobrokerqc.ca',
        password: passwordHash,
        firstName: 'Jean',
        lastName: 'Labrosse',
        phone: '514-555-0001',
        role: 'ADMIN',
        kycStatus: 'VERIFIED',
      },
    });

    const client1 = await this.prisma.user.create({
      data: {
        email: 'client@example.com',
        password: clientHash,
        firstName: 'Marc',
        lastName: 'Tremblay',
        phone: '514-555-0002',
        role: 'CLIENT',
        kycStatus: 'VERIFIED',
        stripeCustomerId: 'cus_mock_001',
      },
    });

    const client2 = await this.prisma.user.create({
      data: {
        email: 'newclient@example.com',
        password: clientHash,
        firstName: 'Sophie',
        lastName: 'Gagnon',
        phone: '450-555-0003',
        role: 'CLIENT',
        kycStatus: 'PENDING',
      },
    });

    // --- Dépôt ---
    await this.prisma.deposit.create({
      data: {
        userId: client1.id,
        amount: 60000,
        currency: 'cad',
        status: 'HOLD',
        stripePaymentIntentId: 'pi_3mock_test_hold_001',
      },
    });

    // --- Véhicules ---
    const vehicleData = [
      { make: 'Honda', model: 'Civic', year: 2021, saaqStatus: 'CLEAN', mileage: 32000, condition: 'RUNS_AND_DRIVES', fuelType: 'ESSENCE', primaryDamage: 'Minor Dents', images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'], estimatedRetailValue: 22000, location: 'Montreal, QC' },
      { make: 'Toyota', model: 'RAV4', year: 2019, saaqStatus: 'VGA', mileage: 78000, condition: 'STARTS_BUT_DAMAGED', fuelType: 'ESSENCE', primaryDamage: 'Front End', images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'], estimatedRetailValue: 28000, location: 'Laval, QC' },
      { make: 'Ford', model: 'F-150', year: 2017, saaqStatus: 'SCRAP', mileage: 145000, condition: 'STATIONARY', fuelType: 'ESSENCE', primaryDamage: 'Water/Flood', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], estimatedRetailValue: 18000, location: 'Quebec, QC' },
      { make: 'Tesla', model: 'Model 3', year: 2022, saaqStatus: 'CLEAN', mileage: 18000, condition: 'RUNS_AND_DRIVES', fuelType: 'ELECTRIQUE', primaryDamage: 'Minor Dents', images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800'], estimatedRetailValue: 52000, location: 'Montreal, QC' },
    ];

    const vehicles = [];
    for (const v of vehicleData) {
      const created = await this.prisma.vehicle.create({
        data: {
          ...v,
          vin: uuidv4().replace(/-/g, '').substring(0, 17).toUpperCase(),
        },
      });
      vehicles.push(created);
    }

    const marketplaceMetadata = [
      { category: 'CAR', lotNumber: 'ABQC-10001', titleType: 'CLEAN', buyNowPrice: 9800, runAndDrive: true, description: 'Compacte économique, inspection visuelle disponible.' },
      { category: 'SUV', lotNumber: 'ABQC-10002', titleType: 'VGA', buyNowPrice: 11200, secondaryDamage: 'Suspension', hasKeys: true, description: 'VGA, inspection requise avant remise en circulation.' },
      { category: 'TRUCK', lotNumber: 'ABQC-10003', titleType: 'SCRAP', buyNowPrice: undefined, hasKeys: false, description: 'Vendu pour pièces ou projet de restauration.' },
      { category: 'ELECTRIC', lotNumber: 'ABQC-10004', titleType: 'CLEAN', buyNowPrice: 31800, runAndDrive: true, description: 'Véhicule électrique avec dossier d’inspection simulé.' },
    ];
    for (const [index, metadata] of marketplaceMetadata.entries()) {
      vehicles[index] = await this.prisma.vehicle.update({ where: { id: vehicles[index].id }, data: metadata });
    }

    const now = new Date();

    // --- Enchères ---
    const auc1 = await this.prisma.auction.create({
      data: {
        vehicleId: vehicles[0].id,
        status: 'LIVE',
        startingBid: 5000,
        currentBid: 6200,
        scheduledStartAt: new Date(now.getTime() - 1000 * 60 * 60),
        scheduledEndAt: new Date(now.getTime() + 1000 * 60 * 60 * 2),
        bidCount: 2,
        currentWinnerId: client1.id,
      },
    });

    const auc2 = await this.prisma.auction.create({
      data: {
        vehicleId: vehicles[1].id,
        status: 'LIVE',
        startingBid: 2000,
        currentBid: 3100,
        scheduledStartAt: new Date(now.getTime() - 1000 * 60 * 120),
        scheduledEndAt: new Date(now.getTime() + 1000 * 60 * 28),
        bidCount: 1,
        currentWinnerId: client1.id,
      },
    });

    const bidsData = [
      { auctionId: auc1.id, userId: client1.id, maxBidAmount: 8000, actualBidAmount: 6200, status: 'WINNING' },
      { auctionId: auc1.id, userId: client2.id, maxBidAmount: 6000, actualBidAmount: 6000, status: 'OUTBID' },
      { auctionId: auc2.id, userId: client1.id, maxBidAmount: 4500, actualBidAmount: 3100, status: 'WINNING' },
    ];
    for (const b of bidsData) {
      await this.prisma.bid.create({ data: b });
    }

    await this.prisma.watchlist.create({ data: { userId: client1.id, vehicleId: vehicles[3].id } });
    await this.prisma.savedSearch.create({ data: { userId: client1.id, name: 'VUS fiables au Québec', filters: { category: 'SUV', saaqStatus: 'CLEAN', maxPrice: 25000 } } });
    await this.prisma.notification.createMany({ data: [
      { userId: client1.id, type: 'OUTBID', title: 'Mise surveillée', message: 'Une activité récente a été détectée sur un véhicule de votre liste.' },
      { userId: client2.id, type: 'KYC_PENDING', title: 'Vérification en cours', message: 'Votre identité doit être approuvée avant de pouvoir enchérir.' },
    ] });
    const demoOrder = await this.prisma.order.create({ data: { orderNumber: 'ABQC-2026-100001', userId: client1.id, vehicleId: vehicles[0].id, auctionId: auc1.id, winningBid: 6200, buyerFee: 496, taxesAmount: 1003.23, totalAmount: 7699.23, paymentStatus: 'PENDING', status: 'AWAITING_PAYMENT', dueAt: new Date(now.getTime() + 72 * 60 * 60 * 1000) } });
    await this.prisma.document.createMany({ data: [
      { userId: client1.id, orderId: demoOrder.id, type: 'INVOICE', fileName: 'facture-ABQC-2026-100001.pdf', storageUrl: '/demo-documents/ABQC-2026-100001/facture.pdf' },
      { userId: client1.id, orderId: demoOrder.id, type: 'PURCHASE_AGREEMENT', fileName: 'contrat-ABQC-2026-100001.pdf', storageUrl: '/demo-documents/ABQC-2026-100001/contrat.pdf' },
    ] });
    await this.prisma.transportQuote.create({ data: { userId: client1.id, vehicleId: vehicles[0].id, orderId: demoOrder.id, destinationPostalCode: 'H2X 1Y4', serviceLevel: 'STANDARD', amount: 450, estimatedPickupAt: new Date(now.getTime() + 2 * 86400000), estimatedDeliveryAt: new Date(now.getTime() + 8 * 86400000) } });

    this.logger.log('Seed PostgreSQL terminé !');
  }

  private async seedMarketplaceForExistingData() {
    const vehicles = await this.prisma.vehicle.findMany({ orderBy: { createdAt: 'asc' }, take: 4 });
    const client = await this.prisma.user.findFirst({
      where: { role: 'CLIENT', kycStatus: 'VERIFIED' },
      orderBy: { createdAt: 'asc' },
    });

    if (!client || vehicles.length === 0) {
      this.logger.warn('Données Marketplace non ajoutées : un client vérifié et un véhicule sont requis.');
      return;
    }

    const metadata = [
      { category: 'CAR', lotNumber: 'ABQC-10001', titleType: 'CLEAN', buyNowPrice: 9800, runAndDrive: true, description: 'Compacte économique, inspection visuelle disponible.' },
      { category: 'SUV', lotNumber: 'ABQC-10002', titleType: 'VGA', buyNowPrice: 11200, secondaryDamage: 'Suspension', hasKeys: true, description: 'VGA, inspection requise avant remise en circulation.' },
      { category: 'TRUCK', lotNumber: 'ABQC-10003', titleType: 'SCRAP', buyNowPrice: null, hasKeys: false, description: 'Vendu pour pièces ou projet de restauration.' },
      { category: 'ELECTRIC', lotNumber: 'ABQC-10004', titleType: 'CLEAN', buyNowPrice: 31800, runAndDrive: true, description: 'Véhicule électrique avec dossier d’inspection simulé.' },
    ];
    await Promise.all(vehicles.map((vehicle, index) => this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: metadata[index],
    })));

    const primaryVehicle = vehicles[0];
    const deposit = await this.prisma.deposit.findFirst({ where: { userId: client.id, status: 'HOLD' } });
    if (!deposit) {
      await this.prisma.deposit.create({
        data: { userId: client.id, amount: 60000, currency: 'cad', status: 'HOLD', stripePaymentIntentId: `pi_mock_hold_${client.id}` },
      });
    }

    const lastVehicle = vehicles[vehicles.length - 1];
    await this.prisma.watchlist.upsert({
      where: { userId_vehicleId: { userId: client.id, vehicleId: lastVehicle.id } },
      update: {},
      create: { userId: client.id, vehicleId: lastVehicle.id },
    });

    const savedSearch = await this.prisma.savedSearch.findFirst({ where: { userId: client.id, name: 'VUS fiables au Québec' } });
    if (!savedSearch) {
      await this.prisma.savedSearch.create({
        data: { userId: client.id, name: 'VUS fiables au Québec', filters: { category: 'SUV', saaqStatus: 'CLEAN', maxPrice: 25000 } },
      });
    }

    const notice = await this.prisma.notification.findFirst({ where: { userId: client.id, type: 'OUTBID' } });
    if (!notice) {
      await this.prisma.notification.create({
        data: { userId: client.id, type: 'OUTBID', title: 'Mise surveillée', message: 'Une activité récente a été détectée sur un véhicule de votre liste.' },
      });
    }

    const auction = await this.prisma.auction.findFirst({ where: { vehicleId: primaryVehicle.id }, orderBy: { createdAt: 'asc' } });
    const now = new Date();
    const demoOrder = await this.prisma.order.upsert({
      where: { orderNumber: 'ABQC-2026-100001' },
      update: {},
      create: {
        orderNumber: 'ABQC-2026-100001', userId: client.id, vehicleId: primaryVehicle.id, auctionId: auction?.id,
        winningBid: auction?.currentBid || 6200, buyerFee: 496, taxesAmount: 1003.23, totalAmount: 7699.23,
        paymentStatus: 'PENDING', status: 'AWAITING_PAYMENT', dueAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
      },
    });

    const documentCount = await this.prisma.document.count({ where: { orderId: demoOrder.id } });
    if (documentCount === 0) {
      await this.prisma.document.createMany({ data: [
        { userId: client.id, orderId: demoOrder.id, type: 'INVOICE', fileName: 'facture-ABQC-2026-100001.pdf', storageUrl: '/demo-documents/ABQC-2026-100001/facture.pdf' },
        { userId: client.id, orderId: demoOrder.id, type: 'PURCHASE_AGREEMENT', fileName: 'contrat-ABQC-2026-100001.pdf', storageUrl: '/demo-documents/ABQC-2026-100001/contrat.pdf' },
      ] });
    }

    const quote = await this.prisma.transportQuote.findFirst({ where: { orderId: demoOrder.id } });
    if (!quote) {
      await this.prisma.transportQuote.create({
        data: { userId: client.id, vehicleId: primaryVehicle.id, orderId: demoOrder.id, destinationPostalCode: 'H2X 1Y4', serviceLevel: 'STANDARD', amount: 450, estimatedPickupAt: new Date(now.getTime() + 2 * 86400000), estimatedDeliveryAt: new Date(now.getTime() + 8 * 86400000) },
      });
    }

    this.logger.log('Données Marketplace simulées prêtes.');
  }
}
