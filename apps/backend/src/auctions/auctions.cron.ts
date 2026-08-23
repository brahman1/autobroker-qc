import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';
import { DepositsService } from '../deposits/deposits.service';
import { PrismaService } from '../prisma/prisma.service';
import { MarketplaceService } from '../marketplace/marketplace.service';

@Injectable()
export class AuctionsCron {
  private readonly logger = new Logger(AuctionsCron.name);

  constructor(
    private auctionsService: AuctionsService,
    private depositsService: DepositsService,
    private prisma: PrismaService,
    private marketplaceService: MarketplaceService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const activeAuctions = await this.auctionsService.findActive();
    const now = new Date().getTime();

    for (const auction of activeAuctions) {
      if (new Date(auction.scheduledEndAt).getTime() <= now) {
        this.logger.debug(`Ench�re termin�e: ${auction.id}`);
        await this.auctionsService.update(auction.id, { status: 'ENDED' });
        await this.marketplaceService.createAuctionWinningOrder(auction);
        
        // --- Processus de capture et de remboursement ---
        
        // 1. Trouver tous les utilisateurs ayant mis�
        const bids = await this.prisma.bid.findMany({
          where: { auctionId: auction.id },
          select: { userId: true },
          distinct: ['userId']
        });
        
        const participantIds = bids.map(b => b.userId);
        
        for (const userId of participantIds) {
          // Trouver le d�p�t actif de l'utilisateur
          const deposit = await this.prisma.deposit.findFirst({
            where: { userId, status: 'HOLD' }
          });
          
          if (deposit) {
            if (userId === auction.currentWinnerId) {
              // C'est le gagnant, on capture la caution
              try {
                await this.depositsService.capture(deposit.id);
                this.logger.debug(`Caution captur�e pour le gagnant ${userId}`);
              } catch (e) {
                this.logger.error(`Erreur lors de la capture de la caution du gagnant ${userId}: ${e.message}`);
              }
            } else {
              // C'est un perdant, on rel�che la caution
              try {
                await this.depositsService.release(deposit.id);
                this.logger.debug(`Caution lib�r�e pour le perdant ${userId}`);
              } catch (e) {
                this.logger.error(`Erreur lors de la lib�ration de la caution du perdant ${userId}: ${e.message}`);
              }
            }
          }
        }
      }
    }
  }
}

