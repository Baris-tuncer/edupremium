// ============================================================================
// PREMIUM EDTECH PLATFORM - MAIN ENTRY POINT
// ============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Global Prefix
  app.setGlobalPrefix('api', {
    exclude: ['health', 'docs'],
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Filters & Interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger Documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Premium EdTech Platform API')
      .setDescription('Enterprise-grade online tutoring platform API documentation')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication & Authorization')
      .addTag('Users', 'User management')
      .addTag('Teachers', 'Teacher profiles & availability')
      .addTag('Students', 'Student profiles')
      .addTag('Appointments', 'Lesson scheduling')
      .addTag('Payments', 'Payment processing')
      .addTag('Notifications', 'Email & SMS notifications')
      .addTag('Feedback', 'Lesson feedback & AI reports')
      .addTag('Admin', 'Administrative operations')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Start Server
  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           PREMIUM EDTECH PLATFORM - API SERVER                ║
╠═══════════════════════════════════════════════════════════════╣
║  Status:      RUNNING                                         ║
║  Port:        ${port}                                            ║
║  Environment: ${configService.get<string>('NODE_ENV', 'development').padEnd(43)}║
║  API Docs:    http://localhost:${port}/docs                      ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
