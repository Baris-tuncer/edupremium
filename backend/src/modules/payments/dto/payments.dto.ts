// ============================================================================
// PAYMENTS DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethodDto {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class InitiatePaymentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({ enum: PaymentMethodDto })
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cardToken?: string;
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({ enum: PaymentMethodDto })
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;
}

export class PaymentCallbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  conversationId?: string;
}

export class BankTransferApprovalDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RefundRequestDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  amount?: number;
}

export class PaymentResponseDto {
  id: string;
  appointmentId: string;
  amount: number;
  platformFee: number;
  teacherEarning: number;
  status: string;
  method: string;
  iyzicoPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
