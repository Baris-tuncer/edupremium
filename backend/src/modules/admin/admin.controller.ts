import { Controller, Get, Put, Param, UseGuards, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('teachers')
  async getAllTeachers() {
    return this.adminService.getAllTeachers();
  }

  @Get('teachers/pending')
  async getPendingTeachers() {
    return this.adminService.getPendingTeachers();
  }

  @Put('teachers/:id/approve')
  async approveTeacher(@Param('id') id: string) {
    return this.adminService.approveTeacher(id);
  }

  @Put('teachers/:id/reject')
  async rejectTeacher(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.rejectTeacher(id, reason);
  }

  @Get('students')
  async getAllStudents() {
    return this.adminService.getAllStudents();
  }

  @Get('appointments')
  async getAllAppointments() {
    return this.adminService.getAllAppointments();
  }

  @Get('payments')
  async getAllPayments() {
    return this.adminService.getAllPayments();
  }
}
