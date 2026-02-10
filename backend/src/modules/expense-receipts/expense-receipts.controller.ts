import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { ExpenseReceiptsService } from './expense-receipts.service';

// ==================== TEACHER ENDPOINTS ====================

@Controller('expense-receipts')
@UseGuards(JwtAuthGuard)
export class ExpenseReceiptsController {
  constructor(private readonly expenseReceiptsService: ExpenseReceiptsService) {}

  // Get my receipts (teacher)
  @Get('me')
  async getMyReceipts(@Request() req: any) {
    return this.expenseReceiptsService.getMyReceipts(req.user.id);
  }

  // Get single receipt (teacher)
  @Get(':id')
  async getReceipt(@Request() req: any, @Param('id') id: string) {
    return this.expenseReceiptsService.getReceiptById(req.user.id, id);
  }

  // Update receipt (teacher - only DRAFT/REJECTED)
  @Patch(':id')
  async updateReceipt(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { tcNumber?: string; address?: string; iban?: string },
  ) {
    return this.expenseReceiptsService.updateReceipt(req.user.id, id, body);
  }

  // Submit receipt for approval (teacher)
  @Post(':id/submit')
  async submitReceipt(@Request() req: any, @Param('id') id: string) {
    return this.expenseReceiptsService.submitReceipt(req.user.id, id);
  }

  // Delete receipt (teacher - only DRAFT)
  @Delete(':id')
  async deleteReceipt(@Request() req: any, @Param('id') id: string) {
    return this.expenseReceiptsService.deleteReceipt(req.user.id, id);
  }
}

// ==================== ADMIN ENDPOINTS ====================

@Controller('admin/expense-receipts')
@UseGuards(JwtAuthGuard)
export class AdminExpenseReceiptsController {
  constructor(private readonly expenseReceiptsService: ExpenseReceiptsService) {}

  // Get all receipts (admin)
  @Get()
  async getAllReceipts(
    @Query('status') status?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.expenseReceiptsService.getAllReceipts({ status, teacherId });
  }

  // Get statistics (admin)
  @Get('statistics')
  async getStatistics() {
    return this.expenseReceiptsService.getStatistics();
  }

  // Generate missing receipts (admin)
  @Post('generate-missing')
  async generateMissingReceipts() {
    return this.expenseReceiptsService.generateMissingReceipts();
  }

  // Get single receipt (admin)
  @Get(':id')
  async getReceipt(@Param('id') id: string) {
    return this.expenseReceiptsService.getReceiptByIdAdmin(id);
  }

  // Approve receipt (admin)
  @Post(':id/approve')
  async approveReceipt(
    @Param('id') id: string,
    @Body() body: { adminNotes?: string },
  ) {
    return this.expenseReceiptsService.approveReceipt(id, body.adminNotes);
  }

  // Reject receipt (admin)
  @Post(':id/reject')
  async rejectReceipt(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.expenseReceiptsService.rejectReceipt(id, body.rejectionReason);
  }

  // Mark as paid (admin)
  @Post(':id/mark-paid')
  async markAsPaid(@Param('id') id: string) {
    return this.expenseReceiptsService.markAsPaid(id);
  }
}
