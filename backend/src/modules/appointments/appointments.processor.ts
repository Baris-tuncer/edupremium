// ============================================================================
// APPOINTMENTS PROCESSOR (Bull Queue)
// ============================================================================

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.module';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';

@Processor('appointments')
export class AppointmentsProcessor {
  private readonly logger = new Logger(AppointmentsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ========================================
  // CHECK BANK TRANSFER EXPIRATION
  // ========================================
  @Process('check-bank-transfer-expiration')
  async handleBankTransferExpiration(job: Job<{ appointmentId: string }>) {
    this.logger.log(`Checking bank transfer expiration for appointment: ${job.data.appointmentId}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: job.data.appointmentId },
    });

    if (!appointment) {
      this.logger.warn(`Appointment not found: ${job.data.appointmentId}`);
      return;
    }

    // Check if still pending
    if (
      appointment.paymentStatus === PaymentStatus.PENDING &&
      appointment.status === AppointmentStatus.PENDING_PAYMENT
    ) {
      // Check if deadline passed
      if (appointment.bankTransferDeadline && new Date() > appointment.bankTransferDeadline) {
        await this.prisma.appointment.update({
          where: { id: job.data.appointmentId },
          data: {
            status: AppointmentStatus.EXPIRED,
            paymentStatus: PaymentStatus.CANCELLED,
          },
        });

        this.logger.log(`Appointment expired: ${job.data.appointmentId}`);

        // Emit event for notifications
        this.eventEmitter.emit('appointment.expired', {
          appointmentId: job.data.appointmentId,
        });
      }
    }
  }

  // ========================================
  // SEND REMINDER
  // ========================================
  @Process('send-reminder')
  async handleReminder(job: Job<{ appointmentId: string; type: string }>) {
    this.logger.log(`Sending ${job.data.type} reminder for appointment: ${job.data.appointmentId}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: job.data.appointmentId },
      include: {
        teacher: {
          include: { user: { select: { email: true, phone: true } } },
        },
        student: {
          include: { user: { select: { email: true, phone: true } } },
        },
        subject: true,
      },
    });

    if (!appointment) {
      this.logger.warn(`Appointment not found: ${job.data.appointmentId}`);
      return;
    }

    // Only send reminders for confirmed appointments
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      this.logger.log(`Skipping reminder - appointment not confirmed: ${job.data.appointmentId}`);
      return;
    }

    // Emit event for notification service
    this.eventEmitter.emit('notification.send-reminder', {
      appointmentId: job.data.appointmentId,
      type: job.data.type,
      teacherEmail: appointment.teacher.user.email,
      teacherPhone: appointment.teacher.user.phone,
      studentEmail: appointment.student.user.email,
      studentPhone: appointment.student.user.phone,
      scheduledAt: appointment.scheduledAt,
      subjectName: appointment.subject.name,
      teamsJoinUrl: appointment.teamsJoinUrl,
    });
  }

  // ========================================
  // AUTO-COMPLETE LESSONS
  // ========================================
  @Process('auto-complete-lesson')
  async handleAutoComplete(job: Job<{ appointmentId: string }>) {
    this.logger.log(`Auto-completing lesson: ${job.data.appointmentId}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: job.data.appointmentId },
    });

    if (!appointment) {
      return;
    }

    // Only auto-complete if in progress
    if (appointment.status === AppointmentStatus.IN_PROGRESS) {
      await this.prisma.appointment.update({
        where: { id: job.data.appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });

      this.eventEmitter.emit('appointment.completed', {
        appointmentId: job.data.appointmentId,
        teacherId: appointment.teacherId,
        studentId: appointment.studentId,
        teacherEarning: appointment.teacherEarning,
      });
    }
  }
}
