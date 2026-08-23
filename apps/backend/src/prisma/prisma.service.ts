import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    this.logger.log('Connecting to PostgreSQL database via Prisma...');
    try {
      await this.$connect();
      this.logger.log('PostgreSQL connection established.');
    } catch (error) {
      this.logger.error(
        'PostgreSQL is unreachable. Start the project database (Docker port 5433) and verify apps/backend/.env.',
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
