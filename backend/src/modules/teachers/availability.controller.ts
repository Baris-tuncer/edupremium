import { Controller, Get, Put, Body, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

@Controller('teachers/me')
@UseGuards(JwtAuthGuard)
export class TeacherAvailabilityController {
  constructor(private prisma: PrismaService) {}

  @Get('availability')
  async getMyAvailability(@Request() req: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id }, include: { availability: true } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    return { success: true, data: teacher.availability };
  }

  @Put('availability')
  async updateMyAvailability(@Request() req: any, @Body() body: { slots: any[] }) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    await this.prisma.$transaction(async (tx) => {
      await tx.teacherAvailability.deleteMany({ where: { teacherId: teacher.id, isRecurring: true } });
      if (body.slots?.length > 0) {
        await tx.teacherAvailability.createMany({ data: body.slots.map(slot => ({ teacherId: teacher.id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, isRecurring: true })) });
      }
    });
    return { success: true, message: 'Availability updated' };
  }

  @Get('students')
  async getMyStudents(@Request() req: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    return { success: true, data: [] };
  }

  @Get('lessons')
  async getMyLessons(@Request() req: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    const lessons = await this.prisma.appointment.findMany({ where: { teacherId: teacher.id }, include: { student: true, subject: true }, orderBy: { scheduledAt: 'desc' } });
    return { success: true, data: lessons };
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id }, include: { wallet: true } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    return { success: true, data: { teacher, stats: { upcomingLessonsCount: 0, completedLessonsCount: 0, monthlyEarnings: 0, availableBalance: 0 }, upcomingLessons: [] } };
  }
}
