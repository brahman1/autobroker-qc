process.env.SEED_DEMO_DATA = 'true';

import '../bootstrap-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.close();
}

bootstrap();
