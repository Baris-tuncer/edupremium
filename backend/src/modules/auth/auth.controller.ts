import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // Öğrenci kaydı
  @Post('register/student')
  async registerStudent(
    @Body()
    body: {
      email: string;
      phone?: string;
      password: string;
      firstName: string;
      lastName: string;
      gradeLevel?: number;
      schoolName?: string;
      parentName?: string;
      parentEmail?: string;
      parentPhone?: string;
    },
  ) {
    return this.authService.registerStudent(body);
  }

  // Öğretmen kaydı
  @Post('register/teacher')
  async registerTeacher(
    @Body()
    body: {
      invitationCode: string;
      email: string;
      phone?: string;
      password: string;
      firstName: string;
      lastName: string;
      branchIds: string[];
      subjectIds?: string[];
      examTypeIds?: string[];
      bio?: string;
      hourlyRate: number;
      iban?: string;
      isNative?: boolean;
      profilePhotoUrl?: string;
      introVideoUrl?: string;
      diplomaUrl?: string;
    },
  ) {
    return this.authService.registerTeacher(body);
  }

  // Davet kodunu doğrula (frontend için)
  // DÜZELTİLDİ: @Body() yerine @Query() kullanılıyor (HTTP GET standardına uygun)
  @Get('invitation/check')
  async checkInvitationCode(@Query('code') code: string) {
    return this.authService.checkInvitationCode(code);
  }

  // ============================================
  // GET ME - KRİTİK ENDPOINT
  // ============================================
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    // DEBUG LOG - Sorun çözülünce silinebilir
    console.log('🎯 AuthController.getMe() called');
    console.log('🎯 req.user:', req.user);
    console.log('🎯 req.user.id:', req.user?.id);

    // ÖNEMLİ: req.user.id kullanılıyor (userId değil!)
    return this.authService.getMe(req.user.id);
  }
}
