import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
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

  // DAVET KODU İLE ÖĞRETMEN KAYDI
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
      branchId: string;
      bio?: string;
      hourlyRate: number;
      iban?: string;
      isNative?: boolean;
    },
  ) {
    return this.authService.registerTeacher(body);
  }

  // Davet kodunu doğrula (frontend için)
  @Get('invitation/check')
  async checkInvitationCode(@Body() body: { code: string }) {
    return this.authService.checkInvitationCode(body.code);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }
}
