// ============================================================================
// APPOINTMENTS DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { PaymentMethod, AppointmentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/common.dto';

// ============================================
// CREATE APPOINTMENT
// ============================================

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Teacher UUID' })
  @IsUUID()
  teacherId: string;

  @ApiProperty({ description: 'Subject UUID' })
  @IsUUID()
  subjectId: string;

  @ApiProperty({ description: 'Scheduled date and time (ISO 8601)', example: '2026-01-15T14:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ default: 60, minimum: 30, maximum: 180 })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(180)
  durationMinutes?: number = 60;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  studentNote?: string;
}

// ============================================
// APPOINTMENT RESPONSE
// ============================================

export class AppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderCode: string;

  @ApiProperty()
  teacherName: string;

  @ApiPropertyOptional()
  teacherPhoto?: string;

  @ApiProperty()
  subjectName: string;

  @ApiProperty()
  scheduledAt: string;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  paymentAmount: number;

  @ApiProperty({ enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiPropertyOptional()
  teamsJoinUrl?: string;

  @ApiPropertyOptional()
  studentNote?: string;

  @ApiPropertyOptional()
  bankTransferDeadline?: string;
}

// ============================================
// LIST QUERY
// ============================================

export class AppointmentListQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// ============================================
// BANK TRANSFER INFO
// ============================================

export class BankTransferInfoDto {
  @ApiProperty()
  orderCode: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  iban: string;

  @ApiProperty()
  accountHolder: string;

  @ApiProperty()
  deadline: string;

  @ApiProperty()
  instructions: string;
}

// ============================================
// UPLOAD RECEIPT
// ============================================

export class UploadReceiptDto {
  @ApiProperty()
  @IsString()
  receiptUrl: string;
}

// ============================================
// MARK NO-SHOW
// ============================================

export class MarkNoShowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

// ============================================
// CANCEL APPOINTMENT
// ============================================

export class CancelAppointmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// ============================================
// TEACHER AVAILABILITY
// ============================================

export class TeacherAvailabilitySlotDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  isAvailable: boolean;
}

export class GetAvailabilityQueryDto {
  @ApiProperty({ description: 'Teacher UUID' })
  @IsUUID()
  teacherId: string;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;
}
