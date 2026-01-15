import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalTeachers, activeTeachers, pendingTeachers, totalStudents, activeStudents, totalAppointments, completedAppointments] = await Promise.all([
      this.prisma.teacher.count(),
      this.prisma.teacher.count({ where: { isApproved: true } }),
      this.prisma.teacher.count({ where: { isApproved: false } }),
      this.prisma.student.count(),
      this.prisma.student.count({ where: { user: { status: 'ACTIVE' } } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'COMPLETED' } }),
    ]);

    const payments = await this.prisma.appointment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { paymentAmount: true },
    });

    const monthlyPayments = await this.prisma.appointment.aggregate({
      where: { status: 'COMPLETED', completedAt: { gte: new Date(new Date().setDate(1)) } },
      _sum: { paymentAmount: true },
    });

    return {
      success: true,
      data: {
        totalTeachers, activeTeachers, pendingTeachers, totalStudents, activeStudents,
        totalAppointments, completedAppointments,
        totalRevenue: payments._sum.paymentAmount?.toNumber() || 0,
        monthlyRevenue: monthlyPayments._sum.paymentAmount?.toNumber() || 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getAllTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true, createdAt: true } },
        branch: true,
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: teachers.map((t) => ({
        id: t.id, firstName: t.firstName, lastName: t.lastName, email: t.user.email,
        phone: t.user.phone, branch: t.branch, subjects: t.subjects.map(ts => ts.subject),
        hourlyRate: t.hourlyRate.toNumber(), isApproved: t.isApproved,
        isActive: t.user.status === 'ACTIVE', createdAt: t.createdAt,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async getPendingTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true } },
        branch: true,
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: teachers.map((t) => ({
        id: t.id, firstName: t.firstName, lastName: t.lastName, email: t.user.email,
        phone: t.user.phone, branch: t.branch, subjects: t.subjects.map(ts => ts.subject),
        hourlyRate: t.hourlyRate.toNumber(), bio: t.bio,
        photoUrl: t.profilePhotoUrl, videoUrl: t.introVideoUrl, createdAt: t.createdAt,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async approveTeacher(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } });
    if (!teacher) throw new NotFoundException('Öğretmen bulunamadı');
    if (teacher.isApproved) throw new BadRequestException('Bu öğretmen zaten onaylanmış');

    const updated = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { isApproved: true, approvedAt: new Date() },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        branch: true,
        subjects: { include: { subject: true } },
      },
    });

    await this.prisma.user.update({ where: { id: teacher.userId }, data: { status: 'ACTIVE', isActive: true } });

    return { success: true, message: 'Öğretmen başarıyla onaylandı', data: updated, timestamp: new Date().toISOString() };
  }

  async rejectTeacher(teacherId: string, reason?: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } });
    if (!teacher) throw new NotFoundException('Öğretmen bulunamadı');

    const updated = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { isApproved: false, approvedAt: null },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });

    await this.prisma.user.update({ where: { id: teacher.userId }, data: { status: 'INACTIVE', isActive: false } });

    return { success: true, message: 'Öğretmen reddedildi', data: updated, timestamp: new Date().toISOString() };
  }

  async getAllStudents() {
    const students = await this.prisma.student.findMany({
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: students.map((s) => ({
        id: s.id, firstName: s.firstName, lastName: s.lastName, email: s.user.email,
        phone: s.user.phone, gradeLevel: s.gradeLevel, isActive: s.user.status === 'ACTIVE', createdAt: s.createdAt,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async getAllAppointments() {
    const appointments = await this.prisma.appointment.findMany({
      include: {
        teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: appointments, timestamp: new Date().toISOString() };
  }

  async getAllPayments() {
    const payments = await this.prisma.appointment.findMany({
      where: { paymentStatus: { in: ['COMPLETED', 'PAID'] } },
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        student: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: payments, timestamp: new Date().toISOString() };
  }
}
