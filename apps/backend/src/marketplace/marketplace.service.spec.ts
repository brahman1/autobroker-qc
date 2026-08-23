import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1', kycStatus: 'VERIFIED' }) },
      deposit: { findFirst: jest.fn().mockResolvedValue({ id: 'd1', status: 'HOLD' }) },
      vehicle: { findUnique: jest.fn().mockResolvedValue({ id: 'v1', make: 'Honda', model: 'Civic', year: 2022, buyNowPrice: 12000, location: 'Montréal, QC' }) },
      order: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'o1', orderNumber: 'ABQC-2026-123456' }) },
      document: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'n1' }) },
    };
    const module = await Test.createTestingModule({ providers: [MarketplaceService, { provide: PrismaService, useValue: prisma }] }).compile();
    service = module.get(MarketplaceService);
  });

  it('crée une commande et des documents pour un achat immédiat éligible', async () => {
    const order = await service.buyNow('u1', 'v1');
    expect(order.id).toBe('o1');
    expect(prisma.order.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'u1', vehicleId: 'v1', winningBid: 12000 }) }));
    expect(prisma.document.createMany).toHaveBeenCalled();
  });

  it('refuse une offre si la caution est absente', async () => {
    prisma.deposit.findFirst.mockResolvedValue(null);
    await expect(service.createOffer('u1', { vehicleId: 'v1', amount: 5000 })).rejects.toBeInstanceOf(BadRequestException);
  });
});
