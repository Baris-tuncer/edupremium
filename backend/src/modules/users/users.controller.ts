// ============================================================================
// USERS CONTROLLER
// ============================================================================

import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/guards/auth.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getCurrentUser(userId);
  }

  @Put('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Put('me/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update email address' })
  async updateEmail(
    @CurrentUser('id') userId: string,
    @Body() dto: { email: string },
  ) {
    return this.usersService.updateEmail(userId, dto.email);
  }

  @Put('me/phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update phone number' })
  async updatePhone(
    @CurrentUser('id') userId: string,
    @Body() dto: { phone: string },
  ) {
    return this.usersService.updatePhone(userId, dto.phone);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete account (soft delete)' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAccount(userId);
  }

  @Get('me/data-export')
  @ApiOperation({ summary: 'Export all user data (KVKK compliance)' })
  async exportData(@CurrentUser('id') userId: string) {
    return this.usersService.exportUserData(userId);
  }
}
