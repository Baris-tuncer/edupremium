// ============================================================================
// AUTH DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsNumber,
  Matches,
  IsIBAN,
} from 'class-validator';

// ============================================
// REGISTER STUDENT
// ============================================

export class RegisterStudentDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message: 'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @ApiProperty({ example: 'Ali' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Yılmaz' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: '+905551234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 9, minimum: 5, maximum: 12 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(12)
  gradeLevel?: number;

  @ApiPropertyOptional({ example: 'Atatürk Lisesi' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  schoolName?: string;

  @ApiPropertyOptional({ example: 'Ayşe Yılmaz' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  parentName?: string;

  @ApiPropertyOptional({ example: 'parent@example.com' })
  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @ApiPropertyOptional({ example: '+905559876543' })
  @IsOptional()
  @IsString()
  parentPhone?: string;
}

// ============================================
// REGISTER TEACHER
// ============================================

export class RegisterTeacherDto {
  @ApiProperty({ example: 'teacher@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message: 'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @ApiProperty({ example: 'INV-2024-ABC123', description: 'Invitation code from admin' })
  @IsString()
  invitationCode: string;

  @ApiProperty({ example: 'Mehmet' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Öztürk' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: '+905551234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Branch UUID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=xxx', description: 'Required intro video URL' })
  @IsString()
  introVideoUrl: string;

  @ApiPropertyOptional({ maxLength: 2500 })
  @IsOptional()
  @IsString()
  @MaxLength(2500)
  bio?: string;

  @ApiProperty({ example: 450, description: 'Hourly rate in TRY' })
  @IsNumber()
  @Min(100)
  hourlyRate: number;

  @ApiPropertyOptional({ example: 'TR330006100519786457841326' })
  @IsOptional()
  @IsString()
  iban?: string;
}

// ============================================
// LOGIN
// ============================================

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;
}

// ============================================
// TOKEN RESPONSE
// ============================================

export class TokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ example: 900, description: 'Access token expiry in seconds' })
  expiresIn: number;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;
}

// ============================================
// REFRESH TOKEN
// ============================================

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

// ============================================
// FORGOT PASSWORD
// ============================================

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

// ============================================
// RESET PASSWORD
// ============================================

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message: 'Password must contain uppercase, lowercase, number and special character',
    },
  )
  newPassword: string;
}

// ============================================
// CHANGE PASSWORD
// ============================================

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message: 'Password must contain uppercase, lowercase, number and special character',
    },
  )
  newPassword: string;
}
