import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  Request, 
  BadRequestException, 
  UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teachers/me')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    console.log('Cloudinary config yapıldı:', this.configService.get<string>('CLOUDINARY_CLOUD_NAME'));
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    console.log('FOTO UPLOAD:', req.user.email);
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'edupremium/photos', resource_type: 'image' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        Readable.from(file.buffer).pipe(uploadStream);
      });
      await this.prisma.teacher.update({ where: { id: teacher.id }, data: { profilePhotoUrl: result.secure_url } });
      console.log('FOTO OK:', result.secure_url);
      return { success: true, url: result.secure_url };
    } catch (error) {
      console.error('FOTO ERROR:', error);
      throw new BadRequestException('Upload failed: ' + error.message);
    }
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    console.log('VIDEO UPLOAD:', req.user.email);
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.id } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'edupremium/videos', resource_type: 'video' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        Readable.from(file.buffer).pipe(uploadStream);
      });
      await this.prisma.teacher.update({ where: { id: teacher.id }, data: { introVideoUrl: result.secure_url } });
      console.log('VIDEO OK:', result.secure_url);
      return { success: true, url: result.secure_url };
    } catch (error) {
      console.error('VIDEO ERROR:', error);
      throw new BadRequestException('Video upload failed: ' + error.message);
    }
  }
}
