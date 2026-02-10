import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ExpenseReceiptsController, AdminExpenseReceiptsController } from './expense-receipts.controller';
import { ExpenseReceiptsService } from './expense-receipts.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [ExpenseReceiptsController, AdminExpenseReceiptsController],
  providers: [ExpenseReceiptsService, JwtAuthGuard],
  exports: [ExpenseReceiptsService],
})
export class ExpenseReceiptsModule {}
