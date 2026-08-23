import { Test, TestingModule } from '@nestjs/testing';
import { BidsService } from './bids.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';
import { BadRequestException } from '@nestjs/common';

describe('BidsService', () => {
  let service: BidsService;
  let prisma: any;
  let gateway: any;

  beforeEach(async () => {
    prisma = {
      auction: { findUnique: jest.fn(), update: jest.fn() },
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1', kycStatus: 'VERIFIED' }) },
      deposit: { findFirst: jest.fn() },
      bid: { create: jest.fn(), updateMany: jest.fn(), findFirst: jest.fn() },
    };

    gateway = {
      server: { to: jest.fn().mockReturnThis(), emit: jest.fn() },
      updateAuctionCache: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventsGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get<BidsService>(BidsService);
  });

  it('devrait accepter une mise manuelle simple', async () => {
    prisma.auction.findUnique.mockResolvedValue({
      id: '1',
      status: 'LIVE',
      scheduledEndAt: new Date(Date.now() + 10000),
      currentBid: 0,
      startingBid: 100
    });
    prisma.deposit.findFirst.mockResolvedValue({ id: 'd1', status: 'HOLD' });
    prisma.bid.findFirst.mockResolvedValue(null); // Pas de gagnant actuel
    
    prisma.bid.create.mockResolvedValue({ id: 'b1' });
    prisma.auction.update.mockResolvedValue({ id: '1', currentBid: 100, currentWinnerId: 'u1' });

    const result = await service.create({ auctionId: '1', userId: 'u1', amount: 100 });
    expect(result).toBeDefined();
    // Verification proxy
    expect(prisma.bid.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ maxBidAmount: 100, actualBidAmount: 100, status: 'WINNING' })
    }));
  });

  it('devrait surench�rir automatiquement (Proxy Bidding)', async () => {
    prisma.auction.findUnique.mockResolvedValue({
      id: '1',
      status: 'LIVE',
      scheduledEndAt: new Date(Date.now() + 10000),
      currentBid: 100,
      startingBid: 100
    });
    prisma.deposit.findFirst.mockResolvedValue({ id: 'd2', status: 'HOLD' });
    // Gagnant actuel (u1) a un maxBid de 5000
    prisma.bid.findFirst.mockResolvedValue({
      id: 'b1', userId: 'u1', maxBidAmount: 5000, actualBidAmount: 100, status: 'WINNING'
    });
    
    prisma.bid.create.mockResolvedValue({ id: 'b2' });
    prisma.auction.update.mockResolvedValue({ id: '1', currentBid: 2100, currentWinnerId: 'u1' });

    // Nouvel utilisateur (u2) mise 2000
    try {
       await service.create({ auctionId: '1', userId: 'u2', amount: 2000 });
    } catch (e) {
       // C'est normal, u2 se fait auto-bid et recoit une BadRequestException ("Surench�re automatique")
       expect(e).toBeInstanceOf(BadRequestException);
    }
    
    // Le systeme devrait avoir cr�� 2 mises: une OUTBID pour u2 (� 2000), et une WINNING pour u1 (� 2100)
    expect(prisma.bid.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 'u2', status: 'OUTBID', actualBidAmount: 2000 })
    }));
    expect(prisma.bid.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 'u1', status: 'WINNING', actualBidAmount: 2100 })
    }));
    
    // Notification de surench�re devrait �tre envoy�e � u2
    expect(gateway.server.emit).toHaveBeenCalledWith('notification:outbid', expect.objectContaining({ userId: 'u2' }));
  });
});

