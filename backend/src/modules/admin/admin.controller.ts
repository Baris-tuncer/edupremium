// ============================================================================
// ADMIN CONTROLLER
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { InvitationsService } from './invitations.service';
import { FinanceService } from './finance.service';
import { CurrentUser, Roles, RolesGuard } from '../../common/guards/auth.guard';
import { UserRole, InvitationStatus } from '@prisma/client';

// ============================================
// DTOs
// ============================================

class CreateInvitationsDto {
  assignedEmail?: string;
  expiresInDays?: number;
  count?: number;
}

class ApproveTeacherDto {
  // No additional fields needed
}

class RejectTeacherDto {
  reason: string;
}

class ApproveBankTransferDto {
  // No additional fields needed
}

class RejectBankTransferDto {
  reason: string;
}

class ProcessPayoutDto {
  walletId: string;
  amount: number;
  reference: string;
}

class BulkPayoutDto {
  payouts: Array<{ walletId: string; amount: number }>;
  batchReference: string;
}

// ============================================
// CONTROLLER
// ============================================

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly invitationsService: InvitationsService,
    private readonly financeService: FinanceService,
  ) {}

  // ========================================
  // DASHBOARD
  // ========================================
  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ========================================
  // INVITATIONS
  // ========================================
  @Post('invitations')
  @ApiOperation({ summary: 'Create new invitation code(s)' })
  async createInvitations(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateInvitationsDto,
  ) {
    return this.invitationsService.createInvitations(adminId, dto);
  }

  @Get('invitations')
  @ApiOperation({ summary: 'List all invitation codes' })
  async listInvitations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: InvitationStatus,
  ) {
    return this.invitationsService.listInvitations(page, limit, status);
  }

  @Delete('invitations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an invitation code' })
  async revokeInvitation(@Param('id') id: string) {
    return this.invitationsService.revokeInvitation(id);
  }

  // ========================================
  // TEACHER MANAGEMENT
  // ========================================
  @Get('teachers/pending')
  @ApiOperation({ summary: 'Get pending teacher applications' })
  async getPendingTeachers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getPendingTeachers(page, limit);
  }

  @Post('teachers/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a teacher application' })
  async approveTeacher(
    @Param('id') teacherId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.approveTeacher(teacherId, adminId);
  }

  @Post('teachers/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a teacher application' })
  async rejectTeacher(
    @Param('id') teacherId: string,
    @Body() dto: RejectTeacherDto,
  ) {
    return this.adminService.rejectTeacher(teacherId, dto.reason);
  }

  // ========================================
  // BANK TRANSFERS
  // ========================================
  @Get('payments/bank-transfers/pending')
  @ApiOperation({ summary: 'Get pending bank transfer approvals' })
  async getPendingBankTransfers() {
    // Uses raw query view
    return this.adminService.getDashboardStats().then((stats) => ({
      count: stats.finance.pendingBankTransfers,
    }));
  }

  @Post('payments/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a bank transfer payment' })
  async approveBankTransfer(
    @Param('id') appointmentId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.approveBankTransfer(appointmentId, adminId);
  }

  @Post('payments/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a bank transfer payment' })
  async rejectBankTransfer(
    @Param('id') appointmentId: string,
    @Body() dto: RejectBankTransferDto,
  ) {
    return this.adminService.rejectBankTransfer(appointmentId, dto.reason);
  }

  // ========================================
  // FINANCE / HAKEDİŞ
  // ========================================
  @Get('finance/hakedis')
  @ApiOperation({ summary: 'Get monthly hakediş report' })
  async getHakedisReport(
    @Query('year') year: number = new Date().getFullYear(),
    @Query('month') month: number = new Date().getMonth() + 1,
  ) {
    return this.financeService.getMonthlyHakedisReport(year, month);
  }

  @Get('finance/pending-payouts')
  @ApiOperation({ summary: 'Get list of pending payouts' })
  async getPendingPayouts() {
    return this.financeService.getPendingPayouts();
  }

  @Post('finance/payout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a single payout' })
  async processPayout(
    @CurrentUser('id') adminId: string,
    @Body() dto: ProcessPayoutDto,
  ) {
    return this.financeService.processPayout(
      dto.walletId,
      dto.amount,
      adminId,
      dto.reference,
    );
  }

  @Post('finance/bulk-payout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process multiple payouts' })
  async processBulkPayout(
    @CurrentUser('id') adminId: string,
    @Body() dto: BulkPayoutDto,
  ) {
    return this.financeService.processBulkPayout(
      dto.payouts,
      adminId,
      dto.batchReference,
    );
  }
}
