import { Controller, Get, Put, Body, UseGuards, Request, BadRequestException, Param } from '@nestjs/common';
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
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id }, include: { wallet: true, subjects: { include: { subject: true } } } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    const subjectIds = teacher.subjects.map(ts => ts.subjectId);
    return { success: true, data: { teacher: { ...teacher, subjectIds }, stats: { upcomingLessonsCount: 0, completedLessonsCount: 0, monthlyEarnings: 0, availableBalance: 0 }, upcomingLessons: [] } };
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    const updateData: any = {};
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.hourlyRate !== undefined) updateData.hourlyRate = body.hourlyRate;
    if (body.iban !== undefined) updateData.iban = body.iban;
    if (body.isNative !== undefined) updateData.isNative = body.isNative;
    await this.prisma.teacher.update({ where: { id: teacher.id }, data: updateData });
    if (body.subjectIds && Array.isArray(body.subjectIds)) {
      await this.prisma.teacherSubject.deleteMany({ where: { teacherId: teacher.id } });
      for (const subjectId of body.subjectIds) {
        await this.prisma.teacherSubject.create({ data: { teacherId: teacher.id, subjectId } });
      }
    }
    return { success: true, message: 'Profile updated' };
  }

  @Put('appointments/:id/approve')
  async approveAppointment(@Request() req: any, @Param('id') id: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.teacherId !== teacher.id) throw new BadRequestException('Appointment not found');
    await this.prisma.appointment.update({ where: { id }, data: { status: 'CONFIRMED' } });
    return { success: true, message: 'Appointment approved' };
  }

  @Put('appointments/:id/reject')
  async rejectAppointment(@Request() req: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.teacherId !== teacher.id) throw new BadRequestException('Appointment not found');
    await this.prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED', notes: body.reason || 'Öğretmen tarafından reddedildi' } });
    return { success: true, message: 'Appointment rejected' };
  }
}
