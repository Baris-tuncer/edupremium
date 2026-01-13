import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { PrismaService } from '../../prisma/prisma.module';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Controller('teachers/me')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private prisma: PrismaService) {}

  @Post('photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'edupremium/photos', resource_type: 'image', transformation: [{ width: 400, height: 400, crop: 'fill' }] },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });

    await this.prisma.teacher.update({ where: { id: teacher.id }, data: { profilePhotoUrl: result.secure_url } });
    return { success: true, data: { url: result.secure_url } };
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'edupremium/videos', resource_type: 'video' },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });

    await this.prisma.teacher.update({ where: { id: teacher.id }, data: { introVideoUrl: result.secure_url } });
    return { success: true, data: { url: result.secure_url } };
  }
}
