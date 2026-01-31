import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateEnvironment } from './common/env.validator';
import * as helmet from 'helmet';

async function bootstrap() {
  // Validate environment variables before starting
  validateEnvironment();

  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Request logging middleware
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });
  }

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('FlowForge API')
    .setDescription('WhatsApp Automation & Smart Invoicing API - Comprehensive business management solution with AI-powered features')
    .setVersion('1.1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Business', 'Business profile management')
    .addTag('Customers', 'Customer relationship management')
    .addTag('Leads', 'Lead tracking and conversion')
    .addTag('Bookings', 'Appointment and booking management')
    .addTag('Invoices', 'Invoice generation and payment tracking')
    .addTag('Analytics', 'Business analytics and insights')
    .addTag('WhatsApp', 'WhatsApp messaging integration')
    .addTag('AI', 'AI-powered code completion and refactoring')
    .addTag('Health', 'Service health and monitoring')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 FlowForge API v1.1.0 running on http://localhost:${port}`);
  console.log(`📚 API Docs available at http://localhost:${port}/api`);
  console.log(`💚 Health Check: http://localhost:${port}/api/health`);
}

bootstrap();
