// ============================================================================
// FEEDBACK SERVICE - Matches FeedbackController exactly
// ============================================================================

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Controller: create(@Body() dto, @Request() req) => create(dto, req.user?.userId)
  async create(dto: any, userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new ForbiddenException('Teacher not found');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { student: true, subject: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.teacherId !== teacher.id) {
      throw new ForbiddenException('Not authorized');
    }

    const existingFeedback = await this.prisma.feedback.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existingFeedback) {
      throw new BadRequestException('Feedback already exists');
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        appointmentId: dto.appointmentId,
        teacherId: teacher.id,
        studentId: appointment.studentId,
        comprehensionLevel: dto.comprehensionLevel,
        engagementLevel: dto.engagementLevel,
        participationLevel: dto.participationLevel,
        homeworkStatus: dto.homeworkStatus || null,
        topicsCovered: dto.topicsCovered || [],
        improvementAreas: dto.improvementAreas || [],
        areasForImprovement: dto.areasForImprovement || [],
        teacherNotes: dto.teacherNotes || null,
      },
    });

    return feedback;
  }

  // Controller: findOne(@Param("id") id, @Request() req) => findById(id, req.user?.userId)
  async findById(id: string, userId?: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        appointment: { include: { subject: true } },
        teacher: true,
        student: true,
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  // Controller: generateReport(@Param("id") id) => generateAIReport(id)
  async generateAIReport(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            student: true,
            teacher: { include: { branch: true } },
            subject: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    const avgLevel = (
      (feedback.comprehensionLevel +
        feedback.engagementLevel +
        feedback.participationLevel) /
      3
    ).toFixed(1);

    const report = `
# Ders Değerlendirme Raporu

## Öğrenci Performansı
- Anlama Seviyesi: ${feedback.comprehensionLevel}/5
- Katılım Seviyesi: ${feedback.engagementLevel}/5
- Aktiflik Seviyesi: ${feedback.participationLevel}/5
- **Ortalama:** ${avgLevel}/5

## İşlenen Konular
${feedback.topicsCovered?.join(', ') || 'Belirtilmedi'}

## Gelişim Alanları
${feedback.areasForImprovement?.join(', ') || 'Belirtilmedi'}

## Öğretmen Notları
${feedback.teacherNotes || 'Not eklenmedi'}
    `.trim();

    const updatedFeedback = await this.prisma.feedback.update({
      where: { id },
      data: {
        aiGeneratedReport: report,
        aiReportGeneratedAt: new Date(),
      },
    });

    return updatedFeedback;
  }

  // Additional methods that might be used elsewhere
  async findByAppointmentId(appointmentId: string) {
    return this.prisma.feedback.findUnique({
      where: { appointmentId },
    });
  }

  async findByStudentId(studentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where: { studentId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feedback.count({ where: { studentId } }),
    ]);
    return { data: feedbacks, total, page, limit };
  }
}
