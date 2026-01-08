// ============================================================================
// STUDENTS SERVICE
// ============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // GET STUDENT DASHBOARD
  // ========================================
  async getStudentDashboard(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [upcomingLessons, recentLessons, monthlyStats] = await Promise.all([
      // Upcoming lessons
      this.prisma.appointment.findMany({
        where: {
          studentId: student.id,
          status: 'CONFIRMED',
          scheduledAt: { gte: now },
        },
        include: {
          teacher: {
            select: { firstName: true, lastName: true, profilePhotoUrl: true },
          },
          subject: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),

      // Recent completed lessons
      this.prisma.appointment.findMany({
        where: {
          studentId: student.id,
          status: 'COMPLETED',
        },
        include: {
          teacher: { select: { firstName: true, lastName: true } },
          subject: { select: { name: true } },
          feedback: {
            select: {
              comprehensionLevel: true,
              aiGeneratedReport: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 5,
      }),

      // Monthly stats
      this.prisma.appointment.aggregate({
        where: {
          studentId: student.id,
          status: 'COMPLETED',
          scheduledAt: { gte: startOfMonth },
        },
        _count: { id: true },
        _sum: { paymentAmount: true },
      }),
    ]);

    return {
      profile: {
        firstName: student.firstName,
        lastName: student.lastName,
        gradeLevel: student.gradeLevel,
        schoolName: student.schoolName,
      },
      upcomingLessons: upcomingLessons.map((l) => ({
        id: l.id,
        teacherName: `${l.teacher.firstName} ${l.teacher.lastName.charAt(0)}.`,
        teacherPhoto: l.teacher.profilePhotoUrl,
        subject: l.subject.name,
        scheduledAt: l.scheduledAt,
        teamsJoinUrl: l.teamsJoinUrl,
      })),
      recentLessons: recentLessons.map((l) => ({
        id: l.id,
        teacherName: `${l.teacher.firstName} ${l.teacher.lastName.charAt(0)}.`,
        subject: l.subject.name,
        scheduledAt: l.scheduledAt,
        feedback: l.feedback
          ? {
              comprehensionLevel: l.feedback.comprehensionLevel,
              hasReport: !!l.feedback.aiGeneratedReport,
            }
          : null,
      })),
      monthlyStats: {
        completedLessons: monthlyStats._count.id,
        totalSpent: monthlyStats._sum.paymentAmount || 0,
      },
    };
  }

  // ========================================
  // UPDATE STUDENT PROFILE
  // ========================================
  async updateProfile(
    userId: string,
    data: {
      gradeLevel?: number;
      schoolName?: string;
      parentName?: string;
      parentEmail?: string;
      parentPhone?: string;
    },
  ) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return this.prisma.student.update({
      where: { id: student.id },
      data,
    });
  }

  // ========================================
  // GET LESSON HISTORY
  // ========================================
  async getLessonHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const skip = (page - 1) * limit;

    const [lessons, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { studentId: student.id },
        include: {
          teacher: { select: { firstName: true, lastName: true } },
          subject: { select: { name: true } },
          feedback: {
            select: {
              comprehensionLevel: true,
              engagementLevel: true,
              participationLevel: true,
              aiGeneratedReport: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where: { studentId: student.id } }),
    ]);

    return {
      data: lessons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ========================================
  // GET AI REPORT FOR LESSON
  // ========================================
  async getLessonReport(userId: string, appointmentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        feedback: true,
        teacher: { select: { firstName: true, lastName: true } },
        subject: { select: { name: true } },
      },
    });

    if (!appointment || appointment.studentId !== student.id) {
      throw new NotFoundException('Lesson not found');
    }

    if (!appointment.feedback?.aiGeneratedReport) {
      throw new NotFoundException('Report not available yet');
    }

    return {
      lessonDate: appointment.scheduledAt,
      teacherName: `${appointment.teacher.firstName} ${appointment.teacher.lastName}`,
      subject: appointment.subject.name,
      feedback: {
        comprehensionLevel: appointment.feedback.comprehensionLevel,
        engagementLevel: appointment.feedback.engagementLevel,
        participationLevel: appointment.feedback.participationLevel,
        homeworkStatus: appointment.feedback.homeworkStatus,
        topicsCovered: appointment.feedback.topicsCovered,
      },
      aiReport: appointment.feedback.aiGeneratedReport,
    };
  }
}
