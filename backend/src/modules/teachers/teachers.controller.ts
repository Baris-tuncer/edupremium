// ============================================================================
// TEACHERS CONTROLLER - Profil ve Medya Yönetimi
// ============================================================================

import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadPath = process.env.UPLOAD_PATH || './uploads';

@Controller('teachers')
export class TeachersController {
  constructor(private prisma: PrismaService) {}

  // Tüm öğretmenleri listele (public)
  @Get()
  async listTeachers(@Query() query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      isApproved: true,
    };

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        include: {
          branch: true,
          subjects: { include: { subject: true } },
          user: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: teachers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Tek öğretmen detayı (public)
  @Get(':id')
  async getTeacher(@Param('id') id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        branch: true,
        subjects: { include: { subject: true } },
        availability: true,
        feedbacks: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            student: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    return {
      success: true,
      data: teacher,
    };
  }

  // Öğretmen müsaitliği (public)
  @Get(':id/availability')
  async getTeacherAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        availability: true,
        appointments: {
          where: {
            scheduledAt: {
              gte: startDate ? new Date(startDate) : new Date(),
              lte: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
          },
        },
      },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    // Müsait slotları ve dolu slotları döndür
    const bookedSlots = teacher.appointments.map((apt) => ({
      date: apt.scheduledAt,
      status: apt.status,
    }));

    return {
      success: true,
      data: {
        recurringSlots: teacher.availability.filter((s) => s.isRecurring),
        bookedSlots,
      },
    };
  }

  // Öğretmen profilini güncelle (authenticated)
  @Put('me/profile')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(@Request() req: any, @Body() body: any) {
    const userId = req.user.sub;

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    const updateData: any = {};
    
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.hourlyRate !== undefined) updateData.hourlyRate = body.hourlyRate;
    if (body.isNative !== undefined) updateData.isNative = body.isNative;
    if (body.iban !== undefined) updateData.iban = body.iban;

    const updated = await this.prisma.teacher.update({
      where: { id: teacher.id },
      data: updateData,
      include: {
        branch: true,
        subjects: { include: { subject: true } },
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  // Profil fotoğrafı yükle
  @Post('me/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(uploadPath, 'photos'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    const photoUrl = `/uploads/photos/${file.filename}`;

    await this.prisma.teacher.update({
      where: { id: teacher.id },
      data: { profilePhotoUrl: photoUrl },
    });

    return {
      success: true,
      data: { url: photoUrl },
    };
  }

  // Tanıtım videosu yükle
  @Post('me/video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(uploadPath, 'videos'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^video\/(mp4|webm|ogg|quicktime)$/)) {
          cb(new BadRequestException('Only video files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadVideo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    const videoUrl = `/uploads/videos/${file.filename}`;

    await this.prisma.teacher.update({
      where: { id: teacher.id },
      data: { introVideoUrl: videoUrl },
    });

    return {
      success: true,
      data: { url: videoUrl },
    };
  }

  // Öğretmen dashboard
  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard)
  async getMyDashboard(@Request() req: any) {
    const userId = req.user.sub;

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        wallet: true,
        appointments: {
          where: {
            scheduledAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Son 30 gün
            },
          },
          include: {
            student: true,
            subject: true,
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    const now = new Date();
    const upcomingLessons = teacher.appointments.filter(
      (a) => new Date(a.scheduledAt) > now && a.status === 'CONFIRMED',
    );
    const completedLessons = teacher.appointments.filter(
      (a) => a.status === 'COMPLETED',
    );

    // Bu ayki kazanç
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEarnings = completedLessons
      .filter((a) => new Date(a.scheduledAt) >= thisMonth)
      .reduce((sum, a) => sum + (parseFloat(a.teacherEarning?.toString() || '0')), 0);

    return {
      success: true,
      data: {
        teacher,
        stats: {
          upcomingLessonsCount: upcomingLessons.length,
          completedLessonsCount: completedLessons.length,
          monthlyEarnings,
          availableBalance: teacher.wallet?.availableBalance || 0,
        },
        upcomingLessons: upcomingLessons.slice(0, 5),
        recentLessons: completedLessons.slice(0, 5),
      },
    };
  }
}
