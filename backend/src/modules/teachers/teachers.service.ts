// ============================================================================
// TEACHERS SERVICE
// ============================================================================

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { PaginatedResponseDto } from '../../common/dto/common.dto';

interface TeacherListQuery {
  page?: number;
  limit?: number;
  branchId?: string;
  subjectId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

interface TeacherPublicProfile {
  id: string;
  firstName: string;
  lastNameInitial: string;
  profilePhotoUrl: string | null;
  introVideoUrl: string;
  bio: string | null;
  hourlyRate: number;
  branches: string[];
  subjects: string[];
  completedLessons: number;
  averageRating: number | null;
}

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // LIST TEACHERS (Public)
  // ========================================
  async listTeachers(
    query: TeacherListQuery,
  ): Promise<PaginatedResponseDto<TeacherPublicProfile>> {
    const { page = 1, limit = 20, branchId, subjectId, minPrice, maxPrice, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      
      user: { status: 'ACTIVE', deletedAt: null },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (subjectId) {
      where.subjects = {
        some: { subjectId },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.hourlyRate = {};
      if (minPrice !== undefined) where.hourlyRate.gte = minPrice;
      if (maxPrice !== undefined) where.hourlyRate.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        include: {
          branches: { include: { branch: { select: { name: true } } } },
          subjects: {
            include: { subject: { select: { name: true } } },
          },
          _count: {
            select: {
              appointments: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.teacher.count({ where }),
    ]);

    // Get average ratings
    const teacherIds = teachers.map((t) => t.id);
    const ratings = await this.prisma.feedback.groupBy({
      by: ['teacherId'],
      where: { teacherId: { in: teacherIds } },
      _avg: {
        comprehensionLevel: true,
        engagementLevel: true,
        participationLevel: true,
      },
    });

    const ratingsMap = new Map(
      ratings.map((r) => [
        r.teacherId,
        ((r._avg.comprehensionLevel || 0) +
          (r._avg.engagementLevel || 0) +
          (r._avg.participationLevel || 0)) /
          3,
      ]),
    );

    const data: TeacherPublicProfile[] = teachers.map((t) => ({
      id: t.id,
      firstName: t.firstName,
      lastNameInitial: t.lastName.charAt(0) + '.',
      profilePhotoUrl: t.profilePhotoUrl,
      introVideoUrl: t.introVideoUrl,
      bio: t.bio,
      hourlyRate: t.hourlyRate.toNumber(),
      branches: t.branches.map(tb => tb.branch.name),
      subjects: t.subjects.map((s) => s.subject.name),
      completedLessons: t._count.appointments,
      averageRating: ratingsMap.get(t.id) || null,
    }));

    return new PaginatedResponseDto(data, total, page, limit);
  }

  // ========================================
  // GET TEACHER PROFILE (Public)
  // ========================================
  async getTeacherProfile(id: string): Promise<TeacherPublicProfile> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        branches: { include: { branch: { select: { name: true } } } },
        subjects: {
          include: { subject: { select: { name: true } } },
        },
        _count: {
          select: {
            appointments: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get average rating
    const rating = await this.prisma.feedback.aggregate({
      where: { teacherId: id },
      _avg: {
        comprehensionLevel: true,
        engagementLevel: true,
        participationLevel: true,
      },
    });

    const avgRating =
      ((rating._avg.comprehensionLevel || 0) +
        (rating._avg.engagementLevel || 0) +
        (rating._avg.participationLevel || 0)) /
      3;

    return {
      id: teacher.id,
      firstName: teacher.firstName,
      lastNameInitial: teacher.lastName.charAt(0) + '.',
      profilePhotoUrl: teacher.profilePhotoUrl,
      introVideoUrl: teacher.introVideoUrl,
      bio: teacher.bio,
      hourlyRate: teacher.hourlyRate.toNumber(),
      branches: teacher.branches.map(tb => tb.branch.name),
      subjects: teacher.subjects.map((s) => s.subject.name),
      completedLessons: teacher._count.appointments,
      averageRating: avgRating || null,
    };
  }

  // ========================================
  // GET TEACHER AVAILABILITY
  // ========================================
  async getTeacherAvailability(
    teacherId: string,
    startDate: string,
    endDate: string,
  ): Promise<AvailabilitySlot[]> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots: AvailabilitySlot[] = [];

    // Get recurring availability
    const recurringAvailability = await this.prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        isRecurring: true,
      },
    });

    // Get specific date availability
    const specificAvailability = await this.prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        isRecurring: false,
        specificDate: {
          gte: start,
          lte: end,
        },
      },
    });

    // Get existing appointments
    const appointments = await this.prisma.appointment.findMany({
      where: {
        teacherId,
        scheduledAt: {
          gte: start,
          lte: end,
        },
        status: {
          notIn: ['CANCELLED', 'EXPIRED'],
        },
      },
      select: { scheduledAt: true, durationMinutes: true },
    });

    const bookedSlots = new Set(
      appointments.map((a) => a.scheduledAt.toISOString()),
    );

    // Generate slots for each day
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
      const dateStr = currentDate.toISOString().split('T')[0];

      // Check specific availability first
      const specificSlots = specificAvailability.filter(
        (a) => a.specificDate?.toISOString().split('T')[0] === dateStr,
      );

      // Use specific if exists, otherwise use recurring
      const daySlots =
        specificSlots.length > 0
          ? specificSlots
          : recurringAvailability.filter((a) => a.dayOfWeek === dayOfWeek);

      for (const slot of daySlots) {
        const slotDateTime = new Date(
          `${dateStr}T${slot.startTime}`,
        );

        slots.push({
          date: dateStr,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: bookedSlots.has(slotDateTime.toISOString()),
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  // ========================================
  // UPDATE OWN PROFILE (Teacher)
  // ========================================
  async updateProfile(
    userId: string,
    data: {
      bio?: string;
      introVideoUrl?: string;
      profilePhotoUrl?: string;
      hourlyRate?: number;
      iban?: string;
    },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return this.prisma.teacher.update({
      where: { id: teacher.id },
      data,
    });
  }

  // ========================================
  // UPDATE AVAILABILITY (Teacher)
  // ========================================
  async updateAvailability(
    userId: string,
    slots: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isRecurring: boolean;
      specificDate?: string;
    }>,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    // Delete existing recurring availability
    await this.prisma.teacherAvailability.deleteMany({
      where: {
        teacherId: teacher.id,
        isRecurring: true,
      },
    });

    // Create new slots
    const createdSlots = await this.prisma.teacherAvailability.createMany({
      data: slots.map((slot) => ({
        teacherId: teacher.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring,
        specificDate: slot.specificDate ? new Date(slot.specificDate) : null,
      })),
    });

    return { created: createdSlots.count };
  }

  // ========================================
  // GET OWN DASHBOARD (Teacher)
  // ========================================
  async getTeacherDashboard(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: { wallet: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [upcomingLessons, monthlyStats, recentFeedback] = await Promise.all([
      // Upcoming lessons
      this.prisma.appointment.findMany({
        where: {
          teacherId: teacher.id,
          status: 'CONFIRMED',
          scheduledAt: { gte: now },
        },
        include: {
          student: { select: { firstName: true, lastName: true } },
          subject: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),

      // Monthly stats
      this.prisma.appointment.aggregate({
        where: {
          teacherId: teacher.id,
          status: 'COMPLETED',
          scheduledAt: { gte: startOfMonth },
        },
        _count: { id: true },
        _sum: { teacherEarning: true },
      }),

      // Recent feedback
      this.prisma.feedback.findMany({
        where: { teacherId: teacher.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          student: { select: { firstName: true } },
          appointment: {
            select: { subject: { select: { name: true } } },
          },
        },
      }),
    ]);

    return {
      profile: {
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        hourlyRate: teacher.hourlyRate,
      },
      wallet: teacher.wallet
        ? {
            availableBalance: teacher.wallet.availableBalance,
            pendingBalance: teacher.wallet.pendingBalance,
            totalEarned: teacher.wallet.totalEarned,
          }
        : null,
      upcomingLessons: upcomingLessons.map((l) => ({
        id: l.id,
        studentName: `${l.student.firstName} ${l.student.lastName.charAt(0)}.`,
        subject: l.subject.name,
        scheduledAt: l.scheduledAt,
        teamsJoinUrl: l.teamsJoinUrl,
      })),
      monthlyStats: {
        completedLessons: monthlyStats._count.id,
        earnings: monthlyStats._sum.teacherEarning || 0,
      },
      recentFeedback: recentFeedback.map((f) => ({
        studentName: f.student.firstName,
        subject: f.appointment.subject.name,
        rating:
          (f.comprehensionLevel + f.engagementLevel + f.participationLevel) / 3,
        date: f.createdAt,
      })),
    };
  }
}

