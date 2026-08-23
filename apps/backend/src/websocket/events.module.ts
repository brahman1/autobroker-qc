import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';
import { AuctionsModule } from '../auctions/auctions.module';
import { BidsModule } from '../bids/bids.module';

@Module({
  imports: [
    AuctionsModule,
    forwardRef(() => BidsModule),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
    }),
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
