// ============================================================================
// AVAILABILITY CONTROLLER - Öğretmen Müsaitlik Yönetimi
// ============================================================================

import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
}

@Controller('teachers/me')
@UseGuards(JwtAuthGuard)
export class TeacherAvailabilityController {
  constructor(private prisma: PrismaService) {}

  // Öğretmenin müsaitlik slotlarını getir
  @Get('availability')
  async getMyAvailability(@Request() req: any) {
    const userId = req.user.sub;
    
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        availability: true,
      },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    return {
      success: true,
      data: teacher.availability,
    };
  }

  // Öğretmenin müsaitlik slotlarını güncelle
  @Put('availability')
  async updateMyAvailability(
    @Request() req: any,
    @Body() body: { slots: AvailabilitySlot[] },
  ) {
    const userId = req.user.sub;
    
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    // Mevcut slotları sil ve yenilerini ekle
    await this.prisma.$transaction(async (tx) => {
      // Önce mevcut recurring slotları sil
      await tx.teacherAvailability.deleteMany({
        where: {
          teacherId: teacher.id,
          isRecurring: true,
        },
      });

      // Yeni slotları ekle
      if (body.slots && body.slots.length > 0) {
        await tx.teacherAvailability.createMany({
          data: body.slots.map((slot) => ({
            teacherId: teacher.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isRecurring: slot.isRecurring ?? true,
            specificDate: slot.specificDate ? new Date(slot.specificDate) : null,
          })),
        });
      }
    });

    return {
      success: true,
      message: 'Availability updated successfully',
    };
  }

  // Öğretmenin öğrencilerini getir (rezervasyonlardan)
  @Get('students')
  async getMyStudents(@Request() req: any) {
    const userId = req.user.sub;
    
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    // Öğretmenin tüm randevularını al ve öğrencilere göre grupla
    const appointments = await this.prisma.appointment.findMany({
      where: { teacherId: teacher.id },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    // Öğrencileri grupla ve istatistik hesapla
    const studentMap = new Map<string, any>();
    const now = new Date();

    appointments.forEach((apt) => {
      const studentId = apt.studentId;
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: apt.student.id,
          firstName: apt.student.firstName,
          lastName: apt.student.lastName,
          email: apt.student.user.email,
          phone: apt.student.user.phone,
          gradeLevel: apt.student.gradeLevel,
          schoolName: apt.student.schoolName,
          totalLessons: 0,
          completedLessons: 0,
          upcomingLessons: 0,
          lastLessonDate: null,
          nextLessonDate: null,
        });
      }

      const student = studentMap.get(studentId);
      student.totalLessons++;

      if (apt.status === 'COMPLETED') {
        student.completedLessons++;
        if (!student.lastLessonDate || new Date(apt.scheduledAt) > new Date(student.lastLessonDate)) {
          student.lastLessonDate = apt.scheduledAt;
        }
      }

      if (apt.status === 'CONFIRMED' && new Date(apt.scheduledAt) > now) {
        student.upcomingLessons++;
        if (!student.nextLessonDate || new Date(apt.scheduledAt) < new Date(student.nextLessonDate)) {
          student.nextLessonDate = apt.scheduledAt;
        }
      }
    });

    return {
      success: true,
      data: Array.from(studentMap.values()),
    };
  }

  // Öğretmenin derslerini getir
  @Get('lessons')
  async getMyLessons(@Request() req: any) {
    const userId = req.user.sub;
    const status = req.query?.status;
    
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    const whereClause: any = { teacherId: teacher.id };
    if (status) {
      whereClause.status = status;
    }

    const lessons = await this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        student: true,
        subject: true,
        feedback: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return {
      success: true,
      data: lessons,
    };
  }

  // Öğretmenin kazançlarını getir
  @Get('earnings')
  async getMyEarnings(@Request() req: any) {
    const userId = req.user.sub;
    
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        wallet: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    return {
      success: true,
      data: {
        wallet: teacher.wallet,
        transactions: teacher.wallet?.transactions || [],
      },
    };
  }
}
