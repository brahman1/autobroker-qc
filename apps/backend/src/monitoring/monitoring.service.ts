import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}
  async summary() {
    const startedAt = Date.now();
    const [users, vehicles, liveAuctions, openDisputes] = await Promise.all([
      this.prisma.user.count(), this.prisma.vehicle.count(), this.prisma.auction.count({ where: { status: 'LIVE' } }), this.prisma.dispute.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
    ]);
    return { status: 'ok', checkedAt: new Date().toISOString(), databaseLatencyMs: Date.now() - startedAt, counters: { users, vehicles, liveAuctions, openDisputes } };
  }
}
