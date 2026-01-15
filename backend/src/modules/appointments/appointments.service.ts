// ============================================================================
// APPOINTMENTS SERVICE
// ============================================================================

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.module';
import { AppointmentStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import {
  CreateAppointmentDto,
  AppointmentResponseDto,
  AppointmentListQueryDto,
  MarkNoShowDto,
} from './dto/appointments.dto';
import { PaginatedResponseDto } from '../../common/dto/common.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    @InjectQueue('appointments') private appointmentsQueue: Queue,
  ) {}

  // ========================================
  // CREATE APPOINTMENT
  // ========================================
  async createAppointment(
    studentUserId: string,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    // Get student record
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    // Validate teacher exists and is approved
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId },
      include: { branch: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Validate subject
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });

    if (!subject || subject.branchId !== teacher.branchId) {
      throw new BadRequestException('Invalid subject for this teacher');
    }

    // Validate scheduled time
    const scheduledAt = new Date(dto.scheduledAt);
    const now = new Date();
    const minBookingHours = this.configService.get<number>('platform.minBookingHoursAdvance', 2);
    const maxBookingDays = this.configService.get<number>('platform.maxBookingDaysAdvance', 30);

    const minBookingTime = new Date(now.getTime() + minBookingHours * 60 * 60 * 1000);
    const maxBookingTime = new Date(now.getTime() + maxBookingDays * 24 * 60 * 60 * 1000);

    if (scheduledAt < minBookingTime) {
      throw new BadRequestException(`Appointments must be booked at least ${minBookingHours} hours in advance`);
    }

    if (scheduledAt > maxBookingTime) {
      throw new BadRequestException(`Appointments cannot be booked more than ${maxBookingDays} days in advance`);
    }

    // Check teacher availability
    const isAvailable = await this.checkTeacherAvailability(
      dto.teacherId,
      scheduledAt,
      dto.durationMinutes || 60,
    );

    if (!isAvailable) {
      throw new BadRequestException('Selected time slot is not available');
    }

    // Check for conflicting appointments
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        teacherId: dto.teacherId,
        scheduledAt: scheduledAt,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.EXPIRED],
        },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('This time slot is already booked');
    }

    // Calculate fees
    const paymentAmount = teacher.hourlyRate.toNumber();
    const commissionRate = teacher.commissionRate.toNumber();
    const platformFee = paymentAmount * (commissionRate / 100);
    const teacherEarning = paymentAmount - platformFee;

    // Generate order code
    const orderCode = this.generateOrderCode();

    // Set bank transfer deadline if applicable
    let bankTransferDeadline: Date | null = null;
    if (dto.paymentMethod === PaymentMethod.BANK_TRANSFER) {
      const deadlineHours = this.configService.get<number>('platform.bankTransferDeadlineHours', 24);
      bankTransferDeadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);
    }

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        orderCode,
        studentId: student.id,
        teacherId: dto.teacherId,
        subjectId: dto.subjectId,
        scheduledAt,
        durationMinutes: dto.durationMinutes || 60,
        paymentMethod: dto.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        paymentAmount,
        platformFee,
        teacherEarning,
        status: AppointmentStatus.PENDING_PAYMENT,
        bankTransferDeadline,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });

    // Emit event for notifications
    this.eventEmitter.emit('appointment.created', {
      appointmentId: appointment.id,
      studentId: student.id,
      teacherId: dto.teacherId,
      paymentMethod: dto.paymentMethod,
    });

    // If bank transfer, schedule expiration check
    if (dto.paymentMethod === PaymentMethod.BANK_TRANSFER) {
      await this.appointmentsQueue.add(
        'check-bank-transfer-expiration',
        { appointmentId: appointment.id },
        {
          delay: (this.configService.get<number>('platform.bankTransferDeadlineHours', 24) + 1) * 60 * 60 * 1000,
        },
      );
    }

    return this.mapToResponseDto(appointment);
  }

  // ========================================
  // GET APPOINTMENT BY ID
  // ========================================
  async getAppointmentById(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        student: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check access permission
    if (userRole !== 'ADMIN') {
      const hasAccess =
        appointment.student.userId === userId ||
        appointment.teacher.userId === userId;

      if (!hasAccess) {
        throw new ForbiddenException('Access denied to this appointment');
      }
    }

    return this.mapToResponseDto(appointment);
  }

  // ========================================
  // LIST APPOINTMENTS
  // ========================================
  async listAppointments(
    userId: string,
    userRole: string,
    query: AppointmentListQueryDto,
  ): Promise<PaginatedResponseDto<AppointmentResponseDto>> {
    const { page = 1, limit = 20, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    // Build where clause based on role
    let whereClause: any = {};

    if (userRole === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });
      whereClause.studentId = student?.id;
    } else if (userRole === 'TEACHER') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });
      whereClause.teacherId = teacher?.id;
    }
    // Admin sees all

    if (status) {
      whereClause.status = status;
    }

    if (startDate) {
      whereClause.scheduledAt = {
        ...whereClause.scheduledAt,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      whereClause.scheduledAt = {
        ...whereClause.scheduledAt,
        lte: new Date(endDate),
      };
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: whereClause,
        include: {
          teacher: {
            select: {
              firstName: true,
              lastName: true,
              profilePhotoUrl: true,
            },
          },
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          subject: {
            select: { name: true },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where: whereClause }),
    ]);

    const data = appointments.map((apt) => this.mapToResponseDto(apt));

    return new PaginatedResponseDto(data, total, page, limit);
  }

  // ========================================
  // CONFIRM APPOINTMENT (After Payment)
  // ========================================
  async confirmAppointment(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        teacher: true,
        student: true,
        subject: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Appointment is not pending payment');
    }

    // Update status
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });

    // Emit event for Teams meeting creation and notifications
    this.eventEmitter.emit('appointment.confirmed', {
      appointmentId: id,
      teacherId: appointment.teacherId,
      studentId: appointment.studentId,
      scheduledAt: appointment.scheduledAt,
      subjectName: appointment.subject.name,
    });

    // Schedule reminder notifications
    await this.scheduleReminders(id, appointment.scheduledAt);

    return this.mapToResponseDto(updated);
  }

  // ========================================
  // CANCEL APPOINTMENT
  // ========================================
  async cancelAppointment(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        teacher: { select: { userId: true } },
        student: { select: { userId: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check if user can cancel
    const isOwner =
      appointment.teacher.userId === userId ||
      appointment.student.userId === userId;

    if (!isOwner) {
      throw new ForbiddenException('Cannot cancel this appointment');
    }

    // Check cancellation deadline
    const cancellationDeadlineHours = this.configService.get<number>(
      'platform.cancellationDeadlineHours',
      24,
    );
    const deadline = new Date(
      appointment.scheduledAt.getTime() - cancellationDeadlineHours * 60 * 60 * 1000,
    );

    if (new Date() > deadline) {
      throw new BadRequestException(
        `Appointments must be cancelled at least ${cancellationDeadlineHours} hours before`,
      );
    }

    // Check if already cancelled or completed
    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException('Cannot cancel this appointment');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledById: userId,
        cancelReason: reason,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });

    // Emit event for refund processing and notifications
    this.eventEmitter.emit('appointment.cancelled', {
      appointmentId: id,
      cancelledBy: userId,
      paymentStatus: appointment.paymentStatus,
      paymentAmount: appointment.paymentAmount,
    });

    return this.mapToResponseDto(updated);
  }

  // ========================================
  // MARK LESSON STARTED (Teacher)
  // ========================================
  async markLessonStarted(
    id: string,
    teacherUserId: string,
  ): Promise<AppointmentResponseDto> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });

    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.teacherId !== teacher?.id) {
      throw new ForbiddenException('Access denied');
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('Appointment is not confirmed');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.IN_PROGRESS,
        teacherStartedAt: new Date(),
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });

    return this.mapToResponseDto(updated);
  }

  // ========================================
  // MARK NO-SHOW
  // ========================================
  async markNoShow(
    id: string,
    teacherUserId: string,
    dto: MarkNoShowDto,
  ): Promise<AppointmentResponseDto> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });

    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.teacherId !== teacher?.id) {
      throw new ForbiddenException('Access denied');
    }

    // Can only mark no-show after scheduled time
    if (new Date() < appointment.scheduledAt) {
      throw new BadRequestException('Cannot mark no-show before scheduled time');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.NO_SHOW,
        markedNoShow: true,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });

    // Teacher still gets paid for no-show
    this.eventEmitter.emit('appointment.no-show', {
      appointmentId: id,
      teacherId: appointment.teacherId,
      teacherEarning: appointment.teacherEarning,
    });

    return this.mapToResponseDto(updated);
  }

  // ========================================
  // COMPLETE APPOINTMENT
  // ========================================
  async completeAppointment(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });

    // Emit event for wallet credit and feedback prompt
    this.eventEmitter.emit('appointment.completed', {
      appointmentId: id,
      teacherId: appointment.teacherId,
      studentId: appointment.studentId,
      teacherEarning: appointment.teacherEarning,
    });

    return this.mapToResponseDto(updated);
  }

  // ========================================
  // HELPERS
  // ========================================

  private async checkTeacherAvailability(
    teacherId: string,
    scheduledAt: Date,
    durationMinutes: number,
  ): Promise<boolean> {
    const dayOfWeek = scheduledAt.getDay() === 0 ? 6 : scheduledAt.getDay() - 1; // Convert to 0=Monday
    const time = scheduledAt.toTimeString().slice(0, 8);

    const availability = await this.prisma.teacherAvailability.findFirst({
      where: {
        teacherId,
        OR: [
          {
            isRecurring: true,
            dayOfWeek,
            startTime: { lte: time },
            endTime: { gte: time },
          },
          {
            isRecurring: false,
            specificDate: scheduledAt,
            startTime: { lte: time },
            endTime: { gte: time },
          },
        ],
      },
    });

    return !!availability;
  }

  private generateOrderCode(): string {
    const date = new Date();
    const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
  }

  private async scheduleReminders(appointmentId: string, scheduledAt: Date): Promise<void> {
    const now = new Date();

    // Morning of the lesson
    const morningReminder = new Date(scheduledAt);
    morningReminder.setHours(9, 0, 0, 0);

    if (morningReminder > now) {
      await this.appointmentsQueue.add(
        'send-reminder',
        { appointmentId, type: 'morning' },
        { delay: morningReminder.getTime() - now.getTime() },
      );
    }

    // 1 hour before
    const hourBefore = new Date(scheduledAt.getTime() - 60 * 60 * 1000);

    if (hourBefore > now) {
      await this.appointmentsQueue.add(
        'send-reminder',
        { appointmentId, type: 'hour-before' },
        { delay: hourBefore.getTime() - now.getTime() },
      );
    }
  }

  private mapToResponseDto(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      orderCode: appointment.orderCode,
      teacherName: `${appointment.teacher.firstName} ${appointment.teacher.lastName}`,
      teacherPhoto: appointment.teacher.profilePhotoUrl,
      subjectName: appointment.subject.name,
      scheduledAt: appointment.scheduledAt.toISOString(),
      durationMinutes: appointment.durationMinutes,
      paymentMethod: appointment.paymentMethod,
      paymentStatus: appointment.paymentStatus,
      paymentAmount: appointment.paymentAmount.toNumber(),
      status: appointment.status,
      teamsJoinUrl: appointment.teamsJoinUrl,
      bankTransferDeadline: appointment.bankTransferDeadline?.toISOString(),
    };
  }
}
