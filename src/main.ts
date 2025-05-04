/**
 * @file Application entry point for Payments Microservice (Hybrid: HTTP + NATS).
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { envs } from './config';
import { AllExceptionsFilter as AllRpcExceptionsFilter } from './shared/infrastructure/filters/rpc-exception.filter';
import { AllHttpExceptionsFilter } from './shared/infrastructure/filters/http-exception.filter';
import { ResponseSanitizerInterceptor } from './shared/infrastructure/interceptors/response-sanitizer.interceptor';

async function bootstrap() {
  const logger = new Logger('Main-PaymentsMS');

  const app: INestApplication = await NestFactory.create(AppModule, {
      rawBody: true, // Enable raw body for Stripe webhook verification
  });

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Connect NATS microservice transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: { servers: envs.natsServers },
  });

  // Global setup (applies to both HTTP and NATS via connectMicroservice)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Apply HTTP filter for HTTP requests, RPC filter for NATS requests
  app.useGlobalFilters(new AllHttpExceptionsFilter(), new AllRpcExceptionsFilter());
  logger.log('Applied global HTTP and RPC exception filters.');

  app.useGlobalInterceptors(new ResponseSanitizerInterceptor());
  logger.log('Applied global response sanitizer interceptor.');

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Payments Management API')
    .setDescription('API para gestión de pagos en el sistema de microservicios')
    .setVersion('1.0')
    .addTag('payments')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  logger.log('Swagger documentation available at /api');

  // Start microservice listener first
  await app.startAllMicroservices();
  logger.log(`Connected to NATS servers: ${envs.natsServers.join(', ')}`);

  // Start HTTP server
  await app.listen(envs.port);
  const url = `http://localhost:${envs.port}`;
  const natsUrl = `nats://localhost:${envs.natsServers[0].split(':')[1]}`;
  const natsServers = envs.natsServers.map(server => `nats://${server.split(':')[0]}`);
  logger.log(`Payments Microservice (HTTP + NATS) running on port ${envs.port}`);
  logger.log(`NATS server available at ${natsUrl}`);
  logger.log(`NATS servers available at ${natsServers.join(', ')}`);
  logger.log(`Webhook endpoint available at ${url}/v1/payments/webhook`);
  logger.log(`Health check available at ${url}/`);
  logger.log(`API documentation available at ${url}/api`);
}
bootstrap();