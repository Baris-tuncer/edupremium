// ============================================================================
// FEEDBACK SERVICE
// ============================================================================

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.module';
import { AiReportService, FeedbackData } from './ai-report.service';
import { CreateFeedbackDto, FeedbackResponseDto } from './dto/feedback.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private aiReportService: AiReportService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ========================================
  // CREATE FEEDBACK (Teacher Only)
  // ========================================
  async createFeedback(
    teacherUserId: string,
    dto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    // Get teacher
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });

    if (!teacher) {
      throw new ForbiddenException('Teacher not found');
    }

    // Get appointment
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: {
        student: true,
        subject: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.teacherId !== teacher.id) {
      throw new ForbiddenException('Not your appointment');
    }

    if (appointment.status !== AppointmentStatus.COMPLETED && 
        appointment.status !== AppointmentStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot add feedback to this appointment');
    }

    // Check if feedback already exists
    const existingFeedback = await this.prisma.feedback.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existingFeedback) {
      throw new BadRequestException('Feedback already submitted for this appointment');
    }

    // Create feedback
    const feedback = await this.prisma.feedback.create({
      data: {
        appointmentId: dto.appointmentId,
        teacherId: teacher.id,
        studentId: appointment.studentId,
        comprehensionLevel: dto.comprehensionLevel,
        engagementLevel: dto.engagementLevel,
        participationLevel: dto.participationLevel,
        homeworkStatus: dto.homeworkStatus,
        teacherNotes: dto.teacherNotes,
        topicsCovered: dto.topicsCovered,
        areasForImprovement: dto.areasForImprovement,
      },
    });

    // Mark appointment as completed if not already
    if (appointment.status !== AppointmentStatus.COMPLETED) {
      await this.prisma.appointment.update({
        where: { id: dto.appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });

      // Emit event for wallet credit
      this.eventEmitter.emit('appointment.completed', {
        appointmentId: dto.appointmentId,
        teacherId: teacher.id,
        studentId: appointment.studentId,
        teacherEarning: appointment.teacherEarning,
      });
    }

    // Generate AI report if student has parent contact
    if (appointment.student.parentEmail || appointment.student.parentPhone) {
      await this.generateAndSendAiReport(feedback.id);
    }

    return this.mapToResponseDto(feedback);
  }

  // ========================================
  // GENERATE AI REPORT
  // ========================================
  async generateAndSendAiReport(feedbackId: string): Promise<void> {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        appointment: {
          include: { subject: true },
        },
        student: true,
        teacher: true,
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Prepare data for AI
    const feedbackData: FeedbackData = {
      studentName: `${feedback.student.firstName} ${feedback.student.lastName}`,
      gradeLevel: feedback.student.gradeLevel || 0,
      subjectName: feedback.appointment.subject.name,
      lessonDate: feedback.appointment.scheduledAt.toLocaleDateString('tr-TR'),
      teacherName: `${feedback.teacher.firstName} ${feedback.teacher.lastName}`,
      comprehensionLevel: feedback.comprehensionLevel,
      engagementLevel: feedback.engagementLevel,
      participationLevel: feedback.participationLevel,
      homeworkStatus: feedback.homeworkStatus,
      topicsCovered: feedback.topicsCovered,
      teacherNotes: feedback.teacherNotes || undefined,
      areasForImprovement: feedback.areasForImprovement,
    };

    // Generate AI report
    const aiReport = await this.aiReportService.generateParentReport(feedbackData);

    // Update feedback with AI report
    await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        aiGeneratedReport: aiReport,
        aiReportGeneratedAt: new Date(),
        aiModelUsed: 'claude-3-opus',
      },
    });

    // Emit event to send report to parent
    if (feedback.student.parentEmail || feedback.student.parentPhone) {
      this.eventEmitter.emit('feedback.report-ready', {
        feedbackId,
        studentId: feedback.studentId,
        parentEmail: feedback.student.parentEmail,
        parentPhone: feedback.student.parentPhone,
        report: aiReport,
      });
    }
  }

  // ========================================
  // GET FEEDBACK BY ID
  // ========================================
  async getFeedbackById(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<FeedbackResponseDto> {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        teacher: { select: { userId: true, firstName: true, lastName: true } },
        student: { select: { userId: true, firstName: true, lastName: true } },
        appointment: { select: { scheduledAt: true, subject: { select: { name: true } } } },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Check access
    if (userRole !== 'ADMIN') {
      if (feedback.teacher.userId !== userId && feedback.student.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return this.mapToResponseDto(feedback);
  }

  // ========================================
  // LIST FEEDBACKS FOR STUDENT
  // ========================================
  async listStudentFeedbacks(
    studentUserId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: FeedbackResponseDto[]; total: number }> {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [feedbacks, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where: { studentId: student.id },
        include: {
          teacher: { select: { firstName: true, lastName: true } },
          appointment: { select: { scheduledAt: true, subject: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.feedback.count({ where: { studentId: student.id } }),
    ]);

    return {
      data: feedbacks.map((f) => this.mapToResponseDto(f)),
      total,
    };
  }

  // ========================================
  // RESEND REPORT TO PARENT
  // ========================================
  async resendReportToParent(feedbackId: string): Promise<{ message: string }> {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: { student: true },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    if (!feedback.aiGeneratedReport) {
      throw new BadRequestException('No AI report generated for this feedback');
    }

    this.eventEmitter.emit('feedback.resend-report', {
      feedbackId,
      parentEmail: feedback.student.parentEmail,
      parentPhone: feedback.student.parentPhone,
      report: feedback.aiGeneratedReport,
    });

    return { message: 'Report resend initiated' };
  }

  // ========================================
  // HELPER
  // ========================================
  private mapToResponseDto(feedback: any): FeedbackResponseDto {
    return {
      id: feedback.id,
      appointmentId: feedback.appointmentId,
      teacherName: feedback.teacher 
        ? `${feedback.teacher.firstName} ${feedback.teacher.lastName}` 
        : undefined,
      studentName: feedback.student 
        ? `${feedback.student.firstName} ${feedback.student.lastName}` 
        : undefined,
      subjectName: feedback.appointment?.subject?.name,
      lessonDate: feedback.appointment?.scheduledAt?.toISOString(),
      comprehensionLevel: feedback.comprehensionLevel,
      engagementLevel: feedback.engagementLevel,
      participationLevel: feedback.participationLevel,
      homeworkStatus: feedback.homeworkStatus,
      topicsCovered: feedback.topicsCovered,
      teacherNotes: feedback.teacherNotes,
      areasForImprovement: feedback.areasForImprovement,
      aiGeneratedReport: feedback.aiGeneratedReport,
      reportSentToParent: feedback.reportSentToParent,
      createdAt: feedback.createdAt?.toISOString(),
    };
  }
}
