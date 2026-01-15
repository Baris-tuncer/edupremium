import { Controller, Post, Body, Get, Req, Res, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);
    
    response.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 999 * 365 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      data: { user: result.user },
    };
  }

  @Post('register')
  async register(@Body() body: any) {
    const user = await this.authService.register(body);
    return { success: true, data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const user = await this.authService.getMe(req.user.sub);
    return { success: true, data: user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token');
    return { success: true };
  }
}
