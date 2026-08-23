import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionsCron } from './auctions.cron';
import { DepositsModule } from '../deposits/deposits.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  imports: [DepositsModule, MarketplaceModule],
  providers: [AuctionsService, AuctionsCron],
  controllers: [AuctionsController],
  exports: [AuctionsService],
})
export class AuctionsModule {}
