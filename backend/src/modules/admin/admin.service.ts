import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveTeacherDto } from './dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalTeachers = await this.prisma.teacher.count();
    const approvedTeachers = await this.prisma.teacher.count({
      where: { isApproved: true },
    });
    const pendingTeachers = await this.prisma.teacher.count({
      where: { isApproved: false },
    });
    const totalStudents = await this.prisma.student.count();
    const totalLessons = await this.prisma.appointment.count();
    const activeLessons = await this.prisma.user.count({
      where: { role: 'TEACHER', status: 'ACTIVE' },
    });
    const totalAppointments = await this.prisma.appointment.count();
    const completedAppointments = await this.prisma.appointment.count({
      where: { status: 'COMPLETED' },
    });
    const totalRevenue = await this.prisma.appointment.aggregate({
      _sum: { paymentAmount: true },
      where: { status: 'COMPLETED' },
    });
    const monthlyRevenue = await this.prisma.appointment.aggregate({
      _sum: { paymentAmount: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      },
    });

    return {
      totalTeachers,
      approvedTeachers,
      pendingTeachers,
      totalStudents,
      totalLessons,
      activeLessons,
      totalAppointments,
      completedAppointments,
      totalRevenue: totalRevenue._sum.paymentAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.paymentAmount || 0,
    };
  }

  async getAllTeachers() {
    return this.prisma.teacher.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        branch: true,
        subjects: { include: { subject: true } },
      },
    });
  }

  async getTeacherById(teacherId: string) {
    return this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        branch: true,
        subjects: { include: { subject: true } },
      },
    });
  }

  async approveTeacher(teacherId: string, dto: ApproveTeacherDto) {
    console.log('🔍 approveTeacher called with:', { teacherId, dto });
    
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      console.log('❌ Teacher not found:', teacherId);
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    console.log('✅ Teacher found:', teacher);
    console.log('📝 Updating with:', { isApproved: dto.isApproved, approvedAt: dto.isApproved ? new Date() : null });

    const updated = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        isApproved: dto.isApproved,
        approvedAt: dto.isApproved ? new Date() : null,
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

    console.log('✅ Update successful:', updated);
    return updated;
  }

  async getAllStudents() {
    const students = await this.prisma.student.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    return students;
  }

  async getAllAppointments() {
    const appointments = await this.prisma.appointment.findMany({
      include: {
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
        subject: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return appointments;
  }
}
