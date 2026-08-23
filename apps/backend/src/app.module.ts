import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { DepositsModule } from './deposits/deposits.module';
import { PaymentsModule } from './payments/payments.module';
import { EventsModule } from './websocket/events.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ImportsModule } from './imports/imports.module';
import { SeoModule } from './seo/seo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      // Ces chemins restent corrects que Nest soit lancé depuis la racine ou
      // depuis apps/backend. Le fichier backend est la source de vérité locale.
      envFilePath: [join(__dirname, '..', '.env'), join(__dirname, '../../../.env')],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requêtes par minute par défaut
    }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    AuctionsModule,
    BidsModule,
    DepositsModule,
    PaymentsModule,
    EventsModule,
    MarketplaceModule,
    MonitoringModule,
    ImportsModule,
    SeoModule,
  ],
})
export class AppModule {}
