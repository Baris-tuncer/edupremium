// ============================================================================
// APPOINTMENTS CONTROLLER
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
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
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  AppointmentResponseDto,
  AppointmentListQueryDto,
  CancelAppointmentDto,
  MarkNoShowDto,
  UploadReceiptDto,
} from './dto/appointments.dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';
import { PaginatedResponseDto } from '../../common/dto/common.dto';

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ========================================
  // CREATE APPOINTMENT (Student Only)
  // ========================================
  @Post()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, type: AppointmentResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.createAppointment(userId, dto);
  }

  // ========================================
  // LIST APPOINTMENTS
  // ========================================
  @Get()
  @ApiOperation({ summary: 'List appointments (filtered by user role)' })
  @ApiResponse({ status: 200 })
  async list(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Query() query: AppointmentListQueryDto,
  ): Promise<PaginatedResponseDto<AppointmentResponseDto>> {
    return this.appointmentsService.listAppointments(userId, userRole, query);
  }

  // ========================================
  // GET APPOINTMENT BY ID
  // ========================================
  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async getById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.getAppointmentById(id, userId, userRole);
  }

  // ========================================
  // CANCEL APPOINTMENT
  // ========================================
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CancelAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.cancelAppointment(id, userId, dto.reason);
  }

  // ========================================
  // START LESSON (Teacher Only)
  // ========================================
  @Post(':id/start')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark lesson as started' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async startLesson(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.markLessonStarted(id, userId);
  }

  // ========================================
  // MARK NO-SHOW (Teacher Only)
  // ========================================
  @Post(':id/no-show')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark student as no-show' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async markNoShow(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: MarkNoShowDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.markNoShow(id, userId, dto);
  }

  // ========================================
  // UPLOAD BANK TRANSFER RECEIPT (Student)
  // ========================================
  @Post(':id/upload-receipt')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload bank transfer receipt' })
  async uploadReceipt(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UploadReceiptDto,
  ): Promise<{ message: string }> {
    // Implementation in service
    return { message: 'Receipt uploaded successfully. Awaiting admin approval.' };
  }
}
