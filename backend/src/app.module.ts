// ============================================================================
// PREMIUM EDTECH PLATFORM - APP MODULE
// ============================================================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Configuration
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

// Core Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { StudentsModule } from './modules/students/students.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AdminModule } from './modules/admin/admin.module';
import { BranchesModule } from './modules/branches/branches.module';
import { WalletModule } from './modules/wallet/wallet.module';

// Health Check
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,
          limit: config.get<number>('THROTTLE_SHORT_LIMIT', 3),
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: config.get<number>('THROTTLE_MEDIUM_LIMIT', 20),
        },
        {
          name: 'long',
          ttl: 60000,
          limit: config.get<number>('THROTTLE_LONG_LIMIT', 100),
        },
      ],
    }),

    // Job Queue (Redis)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Event System
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),

    // Database
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    TeachersModule,
    StudentsModule,
    AppointmentsModule,
    PaymentsModule,
    NotificationsModule,
    FeedbackModule,
    AdminModule,
    WalletModule,
    BranchesModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
