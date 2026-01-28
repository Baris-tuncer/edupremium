import { Controller, Get, Put, Body, Request, UseGuards, Patch } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('me')
  getMe(@Request() req) {
    return this.teachersService.findOne(req.user.id);
  }

  @Patch('me') 
  updateMePatch(@Request() req, @Body() body: any) {
    return this.teachersService.update(req.user.id, body);
  }

  @Put('me') 
  updateMePut(@Request() req, @Body() body: any) {
    return this.teachersService.update(req.user.id, body);
  }

  @Get('me/availability')
  getAvailability(@Request() req) {
    return this.teachersService.getAvailability(req.user.id);
  }

  @Put('me/availability')
  updateAvailability(@Request() req, @Body() body: any) {
    return this.teachersService.updateAvailability(req.user.id, body);
  }

  // Yeni: Güvenli Öğrenci Listesi
  @Get('me/students')
  getMyStudents(@Request() req) {
    return this.teachersService.getMyStudents(req.user.id);
  }

  // Yeni: Güvenli Ders Takvimi
  @Get('me/appointments')
  getMyAppointments(@Request() req) {
    return this.teachersService.getMyAppointments(req.user.id);
  }
}
