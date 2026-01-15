import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalTeachers,
      activeTeachers,
      pendingTeachers,
      totalStudents,
      activeStudents,
      totalAppointments,
      completedAppointments,
    ] = await Promise.all([
      this.prisma.teacher.count(),
      this.prisma.teacher.count({ where: { isApproved: true } }),
      this.prisma.teacher.count({ where: { isApproved: false } }),
      this.prisma.student.count(),
      this.prisma.student.count({ where: { user: { isActive: true } } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'COMPLETED' } }),
    ]);

    const payments = await this.prisma.appointment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { price: true },
    });

    const monthlyPayments = await this.prisma.appointment.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(new Date().setDate(1)), // Bu ayın başı
        },
      },
      _sum: { price: true },
    });

    return {
      success: true,
      data: {
        totalTeachers,
        activeTeachers,
        pendingTeachers,
        totalStudents,
        activeStudents,
        totalAppointments,
        completedAppointments,
        totalRevenue: payments._sum.price || 0,
        monthlyRevenue: monthlyPayments._sum.price || 0,
      },
      timestamp: new Date().toISOString(),
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
            isActive: true,
            createdAt: true,
          },
        },
        branch: true,
        subjects: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      branch: teacher.branch,
      subjects: teacher.subjects,
      experience: teacher.experience,
      hourlyRate: teacher.hourlyRate,
      isApproved: teacher.isApproved,
      isActive: teacher.user.isActive,
      rating: teacher.rating,
      totalLessons: teacher.totalLessons,
      createdAt: teacher.createdAt,
    }));

    return {
      success: true,
      data: formattedTeachers,
      timestamp: new Date().toISOString(),
    };
  }

  async getPendingTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      where: { isApproved: false },
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
        branch: true,
        subjects: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      branch: teacher.branch,
      subjects: teacher.subjects,
      experience: teacher.experience,
      hourlyRate: teacher.hourlyRate,
      bio: teacher.bio,
      photoUrl: teacher.photoUrl,
      videoUrl: teacher.videoUrl,
      createdAt: teacher.createdAt,
    }));

    return {
      success: true,
      data: formattedTeachers,
      timestamp: new Date().toISOString(),
    };
  }

  async approveTeacher(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    if (teacher.isApproved) {
      throw new BadRequestException('Bu öğretmen zaten onaylanmış');
    }

    // Öğretmeni onayla
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { isApproved: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        branch: true,
        subjects: true,
      },
    });

    // User'ı da aktif et
    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: true },
    });

    return {
      success: true,
      message: 'Öğretmen başarıyla onaylandı',
      data: updatedTeacher,
      timestamp: new Date().toISOString(),
    };
  }

  async rejectTeacher(teacherId: string, reason?: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    // Not: Reddetme işlemi için öğretmeni silmek veya bir "rejected" durumu eklemek gerekebilir
    // Şimdilik sadece isApproved = false yapıyoruz
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { 
        isApproved: false,
        // rejectionReason alanı varsa ekleyebilirsiniz
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // User'ı pasif et
    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Öğretmen reddedildi',
      data: updatedTeacher,
      timestamp: new Date().toISOString(),
    };
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
            isActive: true,
            createdAt: true,
          },
        },
        grade: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedStudents = students.map((student) => ({
      id: student.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      phone: student.user.phone,
      grade: student.grade,
      isActive: student.user.isActive,
      createdAt: student.createdAt,
    }));

    return {
      success: true,
      data: formattedStudents,
      timestamp: new Date().toISOString(),
    };
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
                email: true,
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
                email: true,
              },
            },
          },
        },
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: appointments,
      timestamp: new Date().toISOString(),
    };
  }

  async getAllPayments() {
    const payments = await this.prisma.appointment.findMany({
      where: {
        status: { in: ['COMPLETED', 'CONFIRMED'] },
      },
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
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: payments,
      timestamp: new Date().toISOString(),
    };
  }
}
