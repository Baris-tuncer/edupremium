// ============================================================================
// ADMIN MODULE
// ============================================================================

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { InvitationsService } from './invitations.service';
import { FinanceService } from './finance.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, InvitationsService, FinanceService],
  exports: [AdminService, InvitationsService, FinanceService],
})
export class AdminModule {}
