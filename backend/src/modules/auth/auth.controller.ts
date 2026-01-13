// ============================================================================
// AUTH CONTROLLER
// ============================================================================

import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterStudentDto,
  RegisterTeacherDto,
  LoginDto,
  TokenResponseDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { Public } from '../../common/guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ========================================
  // STUDENT REGISTRATION
  // ========================================
  @Post('register/student')
  @Public()
  @ApiOperation({ summary: 'Register a new student' })
  @ApiResponse({ status: 201, description: 'Student registered successfully', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async registerStudent(@Body() dto: RegisterStudentDto): Promise<TokenResponseDto> {
    return this.authService.registerStudent(dto);
  }

  // ========================================
  // TEACHER REGISTRATION
  // ========================================
  @Post('register/teacher')
  @Public()
  @ApiOperation({ summary: 'Register a new teacher (requires invitation code)' })
  @ApiResponse({ status: 201, description: 'Teacher registered successfully', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid invitation code or validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async registerTeacher(@Body() dto: RegisterTeacherDto): Promise<TokenResponseDto> {
    return this.authService.registerTeacher(dto);
  }

  // ========================================
  // LOGIN
  // ========================================
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(dto);
  }

  // ========================================
  // REFRESH TOKEN
  // ========================================
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshToken(dto);
  }

  // ========================================
  // LOGOUT
  // ========================================
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    return this.authService.logout(dto.refreshToken);
  }

  // ========================================
  // FORGOT PASSWORD
  // ========================================
  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent (if account exists)' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  // ========================================
  // RESET PASSWORD
  // ========================================
  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  // ========================================
  // GET CURRENT USER
  // ========================================
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info' })
  async getMe(@Req() req: any) {
    return { success: true, data: req.user };
  }
}
