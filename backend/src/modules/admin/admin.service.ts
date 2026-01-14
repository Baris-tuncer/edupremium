import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { DashboardStatsDto, ApproveTeacherDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    // Öğretmen istatistikleri
    const totalTeachers = await this.prisma.teacher.count();
    const activeTeachers = await this.prisma.teacher.count({
      where: { isApproved: true },
    });
    const pendingTeachers = await this.prisma.teacher.count({
      where: { isApproved: false },
    });

    // Öğrenci istatistikleri
    const totalStudents = await this.prisma.student.count();
    const activeStudents = await this.prisma.user.count({
      where: {
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });

    // Randevu istatistikleri
    const totalAppointments = await this.prisma.appointment.count();
    const completedAppointments = await this.prisma.appointment.count({
      where: { status: 'COMPLETED' },
    });

    // Gelir hesaplama
    const revenueData = await this.prisma.appointment.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        price: true,
      },
    });
    const totalRevenue = Number(revenueData._sum.price || 0);

    // Bu ay geliri
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueData = await this.prisma.appointment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        price: true,
      },
    });
    const monthlyRevenue = Number(monthlyRevenueData._sum.price || 0);

    return {
      totalTeachers,
      activeTeachers,
      pendingTeachers,
      totalStudents,
      activeStudents,
      totalAppointments,
      completedAppointments,
      totalRevenue,
      monthlyRevenue,
    };
  }

  async getAllTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            createdAt: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      branch: teacher.branch,
      subjects: teacher.subjects.map((ts) => ts.subject),
      experience: teacher.experience,
      hourlyRate: Number(teacher.hourlyRate),
      isApproved: teacher.isApproved,
      rating: teacher.rating,
      totalLessons: teacher.totalLessons,
      createdAt: teacher.user.createdAt,
      photoUrl: teacher.photoUrl,
    }));
  }

  async getTeacherById(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            createdAt: true,
            status: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        appointments: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            scheduledAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    return {
      id: teacher.id,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      status: teacher.user.status,
      branch: teacher.branch,
      subjects: teacher.subjects.map((ts) => ts.subject),
      bio: teacher.bio,
      experience: teacher.experience,
      hourlyRate: Number(teacher.hourlyRate),
      isApproved: teacher.isApproved,
      rating: teacher.rating,
      totalLessons: teacher.totalLessons,
      photoUrl: teacher.photoUrl,
      videoUrl: teacher.videoUrl,
      createdAt: teacher.user.createdAt,
      recentAppointments: teacher.appointments.map((apt) => ({
        id: apt.id,
        studentName: `${apt.student.user.firstName} ${apt.student.user.lastName}`,
        scheduledAt: apt.scheduledAt,
        status: apt.status,
        price: Number(apt.price),
      })),
    };
  }

  async approveTeacher(teacherId: string, dto: ApproveTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    return this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        isApproved: dto.isApproved,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getAllStudents() {
    const students = await this.prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            createdAt: true,
          },
        },
        appointments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return students.map((student) => ({
      id: student.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      phone: student.user.phone,
      grade: student.grade,
      school: student.school,
      parentPhone: student.parentPhone,
      totalLessons: student.appointments.length,
      createdAt: student.user.createdAt,
    }));
  }

  async getAllAppointments() {
    const appointments = await this.prisma.appointment.findMany({
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });

    return appointments.map((apt) => ({
      id: apt.id,
      teacher: {
        id: apt.teacher.id,
        firstName: apt.teacher.user.firstName,
        lastName: apt.teacher.user.lastName,
      },
      student: {
        id: apt.student.id,
        firstName: apt.student.user.firstName,
        lastName: apt.student.user.lastName,
      },
      scheduledAt: apt.scheduledAt,
      duration: apt.duration,
      status: apt.status,
      price: Number(apt.price),
      createdAt: apt.createdAt,
    }));
  }
}
