import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { IyzicoService } from './iyzico.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule], // ✅ Email modülü eklendi
  controllers: [PaymentsController],
  providers: [PaymentsService, IyzicoService],
  exports: [PaymentsService, IyzicoService],
})
export class PaymentsModule {}
