// ============================================================================
// NOTIFICATIONS MODULE
// ============================================================================

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { TeamsService } from './teams.service';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsEventHandler } from './notifications.event-handler';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    TeamsService,
    NotificationsProcessor,
    NotificationsEventHandler,
  ],
  exports: [NotificationsService, EmailService, SmsService, TeamsService],
})
export class NotificationsModule {}
