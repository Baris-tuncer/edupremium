// ============================================================================
// STUDENTS CONTROLLER
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CurrentUser, Roles, RolesGuard } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
@UseGuards(RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Get student dashboard' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.studentsService.getStudentDashboard(userId);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update student profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.studentsService.updateProfile(userId, data);
  }

  @Get('me/lessons')
  @ApiOperation({ summary: 'Get lesson history' })
  async getLessonHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.studentsService.getLessonHistory(userId, page, limit);
  }

  @Get('me/lessons/:id/report')
  @ApiOperation({ summary: 'Get AI report for a lesson' })
  async getLessonReport(
    @CurrentUser('id') userId: string,
    @Param('id') appointmentId: string,
  ) {
    return this.studentsService.getLessonReport(userId, appointmentId);
  }
}
