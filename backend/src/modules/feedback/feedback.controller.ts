import { Controller, Post, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private prisma: PrismaService) {}

  @Post(':appointmentId')
  async createFeedback(@Param('appointmentId') appointmentId: string, @Body() dto: any, @Request() req: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    return { success: true, data: dto };
  }

  @Post(':appointmentId/generate-report')
  async generateAIReport(@Param('appointmentId') appointmentId: string, @Request() req: any) {
    return { success: true, data: { report: 'AI Report generated' } };
  }
}
