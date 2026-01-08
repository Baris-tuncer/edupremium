// ============================================================================
// FEEDBACK MODULE
// ============================================================================

import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { AiReportService } from './ai-report.service';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService, AiReportService],
  exports: [FeedbackService, AiReportService],
})
export class FeedbackModule {}
