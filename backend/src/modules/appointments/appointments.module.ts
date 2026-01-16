import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsProcessor } from './appointments.processor';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    JwtModule, 
    BullModule.registerQueue({
      name: 'appointments',
    }),
    EmailModule, // ✅ Email modülü eklendi
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsProcessor],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
