// ============================================================================
// NOTIFICATIONS LISTENER (Event Handlers)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { TeamsService } from './teams.service';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private teamsService: TeamsService,
    private prisma: PrismaService,
  ) {}

  // ========================================
  // APPOINTMENT CREATED
  // ========================================
  @OnEvent('appointment.created')
  async handleAppointmentCreated(payload: {
    appointmentId: string;
    studentId: string;
    teacherId: string;
    paymentMethod: string;
  }) {
    this.logger.log(`Appointment created: ${payload.appointmentId}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: payload.appointmentId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
      },
    });

    if (!appointment) return;

    if (payload.paymentMethod === 'BANK_TRANSFER') {
      // Send bank transfer instructions
      await this.emailService.sendBankTransferInstructions(
        appointment.student.user.email,
        {
          studentName: appointment.student.firstName,
          orderCode: appointment.orderCode,
          amount: appointment.paymentAmount.toNumber(),
          deadline: appointment.bankTransferDeadline!,
        },
      );
    }
  }

  // ========================================
  // APPOINTMENT CONFIRMED
  // ========================================
  @OnEvent('appointment.confirmed')
  async handleAppointmentConfirmed(payload: {
    appointmentId: string;
    teacherId: string;
    studentId: string;
    scheduledAt: Date;
    subjectName?: string;
  }) {
    this.logger.log(`Appointment confirmed: ${payload.appointmentId}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: payload.appointmentId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
      },
    });

    if (!appointment) return;

    // Create Teams meeting
    try {
      const meeting = await this.teamsService.createMeeting(
        payload.appointmentId,
        `${appointment.subject.name} Dersi - ${appointment.student.firstName}`,
        appointment.scheduledAt,
        appointment.durationMinutes,
      );

      this.logger.log(`Teams meeting created: ${meeting.joinUrl}`);
    } catch (error) {
      this.logger.error('Failed to create Teams meeting:', error);
    }

    // Send confirmation emails
    await Promise.all([
      this.emailService.sendAppointmentConfirmation(
        appointment.student.user.email,
        {
          recipientName: appointment.student.firstName,
          teacherName: `${appointment.teacher.firstName} ${appointment.teacher.lastName}`,
          subject: appointment.subject.name,
          scheduledAt: appointment.scheduledAt,
          teamsJoinUrl: appointment.teamsJoinUrl || '',
        },
      ),
      this.emailService.sendAppointmentConfirmation(
        appointment.teacher.user.email,
        {
          recipientName: appointment.teacher.firstName,
          teacherName: `${appointment.student.firstName}`,
          subject: appointment.subject.name,
          scheduledAt: appointment.scheduledAt,
          teamsJoinUrl: appointment.teamsJoinUrl || '',
        },
      ),
    ]);

    // Send SMS notifications
    if (appointment.student.user.phone) {
      await this.smsService.sendLessonReminder(
        appointment.student.user.phone,
        {
          name: appointment.student.firstName,
          subject: appointment.subject.name,
          date: appointment.scheduledAt,
        },
      );
    }
  }

  // ========================================
  // APPOINTMENT CANCELLED
  // ========================================
  @OnEvent('appointment.cancelled')
  async handleAppointmentCancelled(payload: {
    appointmentId: string;
    cancelledBy: string;
    paymentStatus: string;
    paymentAmount: any;
  }) {
    this.logger.log(`Appointment cancelled: ${payload.appointmentId}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: payload.appointmentId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
      },
    });

    if (!appointment) return;

    // Delete Teams meeting if exists
    if (appointment.teamsMeetingId) {
      await this.teamsService.deleteMeeting(appointment.teamsMeetingId);
    }

    // Send cancellation notifications
    await Promise.all([
      this.emailService.sendAppointmentCancellation(
        appointment.student.user.email,
        {
          name: appointment.student.firstName,
          subject: appointment.subject.name,
          scheduledAt: appointment.scheduledAt,
        },
      ),
      this.emailService.sendAppointmentCancellation(
        appointment.teacher.user.email,
        {
          name: appointment.teacher.firstName,
          subject: appointment.subject.name,
          scheduledAt: appointment.scheduledAt,
        },
      ),
    ]);
  }

  // ========================================
  // APPOINTMENT COMPLETED
  // ========================================
  @OnEvent('appointment.completed')
  async handleAppointmentCompleted(payload: {
    appointmentId: string;
    teacherId: string;
    studentId: string;
    teacherEarning: any;
  }) {
    this.logger.log(`Appointment completed: ${payload.appointmentId}`);

    // Credit teacher wallet (handled by FinanceService via event)
    // Send feedback request to student
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: payload.appointmentId },
      include: {
        student: { include: { user: true } },
        teacher: true,
        subject: true,
      },
    });

    if (!appointment) return;

    // Prompt teacher to submit feedback
    await this.emailService.sendFeedbackRequest(
      appointment.teacher.user?.email || '',
      {
        teacherName: appointment.teacher.firstName,
        studentName: appointment.student.firstName,
        subject: appointment.subject.name,
        appointmentId: payload.appointmentId,
      },
    );
  }

  // ========================================
  // TEACHER APPROVED
  // ========================================
  @OnEvent('teacher.approved')
  async handleTeacherApproved(payload: {
    teacherId: string;
    email: string;
    firstName: string;
  }) {
    this.logger.log(`Teacher approved: ${payload.teacherId}`);

    await this.emailService.sendTeacherApproval(payload.email, {
      name: payload.firstName,
    });
  }

  // ========================================
  // SEND REMINDER
  // ========================================
  @OnEvent('notification.send-reminder')
  async handleSendReminder(payload: {
    appointmentId: string;
    type: string;
    teacherEmail: string;
    teacherPhone?: string;
    studentEmail: string;
    studentPhone?: string;
    scheduledAt: Date;
    subjectName: string;
    teamsJoinUrl?: string;
  }) {
    this.logger.log(`Sending ${payload.type} reminder for ${payload.appointmentId}`);

    const reminderText =
      payload.type === 'morning'
        ? `Bugün ${payload.subjectName} dersiniz var!`
        : `${payload.subjectName} dersinize 1 saat kaldı!`;

    // Send to student
    await this.emailService.sendLessonReminder(payload.studentEmail, {
      message: reminderText,
      scheduledAt: payload.scheduledAt,
      teamsJoinUrl: payload.teamsJoinUrl,
    });

    if (payload.studentPhone) {
      await this.smsService.sendText(
        payload.studentPhone,
        `${reminderText} Ders linki: ${payload.teamsJoinUrl}`,
      );
    }

    // Send to teacher
    await this.emailService.sendLessonReminder(payload.teacherEmail, {
      message: reminderText,
      scheduledAt: payload.scheduledAt,
      teamsJoinUrl: payload.teamsJoinUrl,
    });

    if (payload.teacherPhone) {
      await this.smsService.sendText(
        payload.teacherPhone,
        `${reminderText} Ders linki: ${payload.teamsJoinUrl}`,
      );
    }
  }
}
