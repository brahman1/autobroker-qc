import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import './bootstrap-env';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Sécurité
  app.use(helmet());
  
  // Configuration CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS || 'http://localhost:5173',
    credentials: true,
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Intercepteurs et Filtres
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.getHttpAdapter().get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.getHttpAdapter().get('/', (_req, res) => {
    res.status(200).json({
      name: 'AutoBroker QC API',
      status: 'online',
      documentation: '/api/docs',
      health: '/health',
      version: '1.0.0',
    });
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('AutoBroker QC API')
    .setDescription('API de gestion des enchères de véhicules au Québec')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT || 3001;
  await app.listen(port);
  console.log(`L'application tourne sur le port: ${port}`);
}
bootstrap();
