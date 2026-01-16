import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // ========================================
  // PUBLIC: LIST TEACHERS
  // ========================================
  @Get()
  async listTeachers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
  ) {
    const query = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      branchId,
      subjectId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
    };

    return this.teachersService.listTeachers(query);
  }

  // ========================================
  // PUBLIC: GET TEACHER BY ID
  // ========================================
  @Get(':id')
  async getTeacher(@Param('id') id: string) {
    return this.teachersService.getTeacherById(id);
  }

  // ========================================
  // PUBLIC: GET TEACHER AVAILABILITY
  // ========================================
  @Get(':id/availability')
  async getTeacherAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return this.teachersService.getTeacherAvailability(id, start, end);
  }
}
