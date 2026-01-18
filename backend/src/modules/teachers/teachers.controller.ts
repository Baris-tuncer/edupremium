import { Controller, Get, Param, Query, UseGuards, Put, Body, Request } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // ========================================
  // TEACHER SELF-SERVICE: KENDI PROFİLİNİ YÖNET
  // ========================================
  
  // GET /teachers/me - Öğretmenin kendi profilini getir
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async getMyProfile(@Request() req) {
    return this.teachersService.getMyProfile(req.user.id);
  }

  // PUT /teachers/me - Profil bilgilerini güncelle (bio, hourlyRate, iban)
  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateMyProfile(
    @Request() req,
    @Body() updateData: {
      bio?: string;
      hourlyRate?: number;
      iban?: string;
    },
  ) {
    return this.teachersService.updateMyProfile(req.user.id, updateData);
  }

  // PUT /teachers/me/subjects - Subject'leri güncelle
  @Put('me/subjects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateMySubjects(
    @Request() req,
    @Body() body: { subjectIds: string[] },
  ) {
    return this.teachersService.updateMySubjects(req.user.id, body.subjectIds);
  }

  // PUT /teachers/me/branches - Branch'leri güncelle
  @Put('me/branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateMyBranches(
    @Request() req,
    @Body() body: { branchIds: string[] },
  ) {
    return this.teachersService.updateMyBranches(req.user.id, body.branchIds);
  }

  // PUT /teachers/me/exam-types - ExamType'ları güncelle
  @Put('me/exam-types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateMyExamTypes(
    @Request() req,
    @Body() body: { examTypeIds: string[] },
  ) {
    return this.teachersService.updateMyExamTypes(req.user.id, body.examTypeIds);
  }

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
    return this.teachersService.getTeacherProfile(id);
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
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.teachersService.getTeacherAvailability(id, start, end);
  }
}
