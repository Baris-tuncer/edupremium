import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApproveTeacherDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Admin guard - tüm endpoint'lerde kontrol
  private checkAdminRole(req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Bu işlem için admin yetkisi gereklidir');
    }
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    this.checkAdminRole(req);
    return this.adminService.getDashboardStats();
  }

  @Get('teachers')
  async getAllTeachers(@Request() req) {
    this.checkAdminRole(req);
    return this.adminService.getAllTeachers();
  }

  @Get('teachers/:id')
  async getTeacherById(@Request() req, @Param('id') id: string) {
    this.checkAdminRole(req);
    return this.adminService.getTeacherById(id);
  }

  @Put('teachers/:id/approve')
  async approveTeacher(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ApproveTeacherDto,
  ) {
    this.checkAdminRole(req);
    return this.adminService.approveTeacher(id, dto);
  }

  @Get('students')
  async getAllStudents(@Request() req) {
    this.checkAdminRole(req);
    return this.adminService.getAllStudents();
  }

  @Get('appointments')
  async getAllAppointments(@Request() req) {
    this.checkAdminRole(req);
    return this.adminService.getAllAppointments();
  }
}
