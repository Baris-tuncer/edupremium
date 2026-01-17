import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  // Fiyat hesaplama helper fonksiyonu
  private async calculateParentPrice(teacherHourlyRate: number): Promise<number> {
    // SystemConfig'den komisyon ve KDV oranlarını al
    const commissionConfig = await this.prisma.systemConfig.findUnique({
      where: { key: 'PLATFORM_COMMISSION_RATE' },
    });
    const taxConfig = await this.prisma.systemConfig.findUnique({
      where: { key: 'TAX_RATE' },
    });

    const commissionRate = commissionConfig ? parseFloat(commissionConfig.value) : 23;
    const taxRate = taxConfig ? parseFloat(taxConfig.value) : 12;

    // Hesaplama: Öğretmen ücreti + Komisyon + KDV
    const withCommission = teacherHourlyRate * (1 + commissionRate / 100);
    const withTax = withCommission * (1 + taxRate / 100);

    // En yakın 100 TL'ye yuvarla
    const rounded = Math.round(withTax / 100) * 100;

    return rounded;
  }

  async listTeachers(params: {
    page?: number;
    limit?: number;
    search?: string;
    branchId?: string;
    subjectId?: string;
    examTypeId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'rating' | 'price' | 'experience';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      branchId,
      subjectId,
      examTypeId,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TeacherWhereInput = {
      user: {
        isActive: true,
      },
    };

    // Search by name
    if (search) {
      where.user = {
        ...where.user,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Filter by branch
    if (branchId) {
      where.branches = {
        some: { id: branchId },
      };
    }

    // Filter by subject
    if (subjectId) {
      where.subjects = {
        some: { id: subjectId },
      };
    }

    // Filter by exam type
    if (examTypeId) {
      where.examTypes = {
        some: { id: examTypeId },
      };
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.hourlyRate = {};
      if (minPrice !== undefined) {
        where.hourlyRate.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.hourlyRate.lte = maxPrice;
      }
    }

    // Build orderBy - FIX: Remove invalid fields
    let orderBy: Prisma.TeacherOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy = { hourlyRate: sortOrder };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // Get total count
    const total = await this.prisma.teacher.count({ where });

    // Get teachers
    const teachers = await this.prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        branches: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
          },
        },
        examTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Transform response with parentPrice and unique subjects
    const transformedTeachers = await Promise.all(
      teachers.map(async (teacher) => {
        const parentPrice = await this.calculateParentPrice(teacher.hourlyRate);
        
        // Get unique subjects
        const uniqueSubjects = Array.from(
          new Set(teacher.subjects.map(s => s.name))
        );

        return {
          id: teacher.id,
          firstName: teacher.user.firstName,
          lastNameInitial: teacher.user.lastName ? teacher.user.lastName.charAt(0) + '.' : '',
          profilePhotoUrl: teacher.profilePhotoUrl,
          introVideoUrl: teacher.introVideoUrl,
          bio: teacher.bio,
          hourlyRate: teacher.hourlyRate,
          parentPrice, // Veliye gösterilecek fiyat
          branches: teacher.branches.map(b => b.name),
          subjects: uniqueSubjects,
          examTypes: teacher.examTypes.map(e => e.name),
          completedLessons: teacher.completedLessons,
          averageRating: teacher.averageRating,
        };
      })
    );

    return {
      data: transformedTeachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async getTeacherById(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        branches: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
          },
        },
        examTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    const parentPrice = await this.calculateParentPrice(teacher.hourlyRate);
    
    // Get unique subjects
    const uniqueSubjects = Array.from(
      new Set(teacher.subjects.map(s => s.name))
    );

    return {
      id: teacher.id,
      firstName: teacher.user.firstName,
      lastNameInitial: teacher.user.lastName ? teacher.user.lastName.charAt(0) + '.' : '',
      profilePhotoUrl: teacher.profilePhotoUrl,
      introVideoUrl: teacher.introVideoUrl,
      bio: teacher.bio,
      hourlyRate: teacher.hourlyRate,
      parentPrice, // Veliye gösterilecek fiyat
      branches: teacher.branches.map(b => b.name),
      subjects: uniqueSubjects,
      subjectIds: teacher.subjects.map(s => s.id), // Booking için ID'ler
      examTypes: teacher.examTypes.map(e => e.name),
      completedLessons: teacher.completedLessons,
      averageRating: teacher.averageRating,
      yearsOfExperience: teacher.yearsOfExperience,
      education: teacher.education,
    };
  }

  async getTeacherAvailability(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    const availability = await this.prisma.availability.findMany({
      where: {
        teacherId,
        date: {
          gte: new Date(),
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return availability.map((slot) => ({
      date: slot.date.toISOString().split('T')[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: slot.isBooked,
    }));
  }
}
