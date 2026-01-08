// ============================================================================
// TEACHERS CONTROLLER
// ============================================================================

import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CurrentUser, Public, Roles, RolesGuard } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // ========================================
  // LIST TEACHERS (Public)
  // ========================================
  @Get()
  @Public()
  @ApiOperation({ summary: 'List approved teachers with filters' })
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('branchId') branchId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
  ) {
    return this.teachersService.listTeachers({
      page,
      limit,
      branchId,
      subjectId,
      minPrice,
      maxPrice,
      search,
    });
  }

  // ========================================
  // GET TEACHER PROFILE (Public)
  // ========================================
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get teacher public profile' })
  async getProfile(@Param('id') id: string) {
    return this.teachersService.getTeacherProfile(id);
  }

  // ========================================
  // GET TEACHER AVAILABILITY (Public)
  // ========================================
  @Get(':id/availability')
  @Public()
  @ApiOperation({ summary: 'Get teacher availability slots' })
  async getAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.teachersService.getTeacherAvailability(id, startDate, endDate);
  }

  // ========================================
  // GET OWN DASHBOARD (Teacher)
  // ========================================
  @Get('me/dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get teacher dashboard (own)' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.teachersService.getTeacherDashboard(userId);
  }

  // ========================================
  // UPDATE OWN PROFILE (Teacher)
  // ========================================
  @Put('me/profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.teachersService.updateProfile(userId, data);
  }

  // ========================================
  // UPDATE AVAILABILITY (Teacher)
  // ========================================
  @Put('me/availability')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update availability slots' })
  async updateAvailability(
    @CurrentUser('id') userId: string,
    @Body() data: { slots: any[] },
  ) {
    return this.teachersService.updateAvailability(userId, data.slots);
  }
}
