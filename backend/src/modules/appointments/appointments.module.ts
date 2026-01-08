// ============================================================================
// APPOINTMENTS MODULE
// ============================================================================

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsProcessor } from './appointments.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'appointments',
    }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsProcessor],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
