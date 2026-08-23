import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(vehicleId?: string) {
    return this.prisma.auction.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: true },
    });
  }

  async findActive() {
    return this.prisma.auction.findMany({
      where: { status: 'LIVE' },
      include: { vehicle: true },
    });
  }

  async findOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!auction) {
      throw new NotFoundException('Enchère introuvable');
    }
    return auction;
  }

  async create(data: any) {
    return this.prisma.auction.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.auction.update({
      where: { id },
      data,
    });
  }
}
