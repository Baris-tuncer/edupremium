import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiatePayment(@Body() data: any) {
    return { message: 'Payment initiated', data };
  }

  @Get(':id')
  async getPayment(@Param('id') id: string) {
    return { paymentId: id };
  }
}
