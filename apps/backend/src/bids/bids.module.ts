import { Module, forwardRef } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { BidQueueService } from './bid-queue.service';
import { AuctionsModule } from '../auctions/auctions.module';
import { DepositsModule } from '../deposits/deposits.module';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../websocket/events.module';

@Module({
  imports: [AuctionsModule, DepositsModule, UsersModule, forwardRef(() => EventsModule)],
  providers: [BidsService, BidQueueService],
  controllers: [BidsController],
  exports: [BidsService],
})
export class BidsModule {}
