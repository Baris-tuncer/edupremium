import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  // Fiyat hesaplama helper fonksiyonu
  private async calculateParentPrice(teacherHourlyRate: number): Promise<number> {
    const commissionConfig = await this.prisma.systemConfig.findUnique({
      where: { key: 'PLATFORM_COMMISSION_RATE' },
    });
    const taxConfig = await this.prisma.systemConfig.findUnique({
      where: { key: 'TAX_RATE' },
    });

    const commissionRate = commissionConfig ? parseFloat(commissionConfig.value) : 23;
    const taxRate = taxConfig ? parseFloat(taxConfig.value) : 12;

    const withCommission = teacherHourlyRate * (1 + commissionRate / 100);
    const withTax = withCommission * (1 + taxRate / 100);
    const rounded = Math.round(withTax / 100) * 100;

    return rounded;
  }

  // ========== YENİ: TEACHER SELF-SERVICE FONKSİYONLARI ==========
  
  // userId'den teacher'ı bul (helper)
  private async findTeacherByUserId(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        branches: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        examTypes: {
          include: {
            examType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen profili bulunamadı');
    }

    return teacher;
  }

  // Öğretmenin kendi profilini getir
  async getMyProfile(userId: string) {
    const teacher = await this.findTeacherByUserId(userId);
    
    // Get unique subjects
    const uniqueSubjects = Array.from(
      new Set(teacher.subjects.map(ts => ts.subject.name))
    );

    const parentPrice = await this.calculateParentPrice(teacher.hourlyRate.toNumber());

    return {
      id: teacher.id,
      userId: teacher.userId,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      email: teacher.user.email,
      profilePhotoUrl: teacher.profilePhotoUrl,
      introVideoUrl: teacher.introVideoUrl,
      bio: teacher.bio,
      hourlyRate: teacher.hourlyRate.toNumber(),
      parentPrice,
      iban: teacher.iban,
      branches: teacher.branches.map(tb => ({
        id: tb.branch.id,
        name: tb.branch.name,
      })),
      subjects: teacher.subjects.map(ts => ({
        id: ts.subject.id,
        name: ts.subject.name,
      })),
      examTypes: teacher.examTypes.map(te => ({
        id: te.examType.id,
        name: te.examType.name,
      })),
    };
  }

  // Profil bilgilerini güncelle (bio, hourlyRate, iban)
  async updateMyProfile(userId: string, updateData: {
    bio?: string;
    hourlyRate?: number;
    iban?: string;
  }) {
    const teacher = await this.findTeacherByUserId(userId);

    const updated = await this.prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        bio: updateData.bio !== undefined ? updateData.bio : teacher.bio,
        hourlyRate: updateData.hourlyRate !== undefined ? updateData.hourlyRate : teacher.hourlyRate,
        iban: updateData.iban !== undefined ? updateData.iban : teacher.iban,
      },
    });

    return this.getMyProfile(userId);
  }

  // Subject'leri güncelle
  async updateMySubjects(userId: string, subjectIds: string[]) {
    const teacher = await this.findTeacherByUserId(userId);

    // Önce mevcut subject'leri sil
    await this.prisma.teacherSubject.deleteMany({
      where: { teacherId: teacher.id },
    });

    // Yeni subject'leri ekle
    if (subjectIds.length > 0) {
      await this.prisma.teacherSubject.createMany({
        data: subjectIds.map(subjectId => ({
          teacherId: teacher.id,
          subjectId,
        })),
        skipDuplicates: true,
      });
    }

    return this.getMyProfile(userId);
  }

  // Branch'leri güncelle
  async updateMyBranches(userId: string, branchIds: string[]) {
    const teacher = await this.findTeacherByUserId(userId);

    // Önce mevcut branch'leri sil
    await this.prisma.teacherBranch.deleteMany({
      where: { teacherId: teacher.id },
    });

    // Yeni branch'leri ekle
    if (branchIds.length > 0) {
      await this.prisma.teacherBranch.createMany({
        data: branchIds.map(branchId => ({
          teacherId: teacher.id,
          branchId,
        })),
        skipDuplicates: true,
      });
    }

    return this.getMyProfile(userId);
  }

  // ExamType'ları güncelle
  async updateMyExamTypes(userId: string, examTypeIds: string[]) {
    const teacher = await this.findTeacherByUserId(userId);

    // Önce mevcut exam type'ları sil
    await this.prisma.teacherExamType.deleteMany({
      where: { teacherId: teacher.id },
    });

    // Yeni exam type'ları ekle
    if (examTypeIds.length > 0) {
      await this.prisma.teacherExamType.createMany({
        data: examTypeIds.map(examTypeId => ({
          teacherId: teacher.id,
          examTypeId,
        })),
        skipDuplicates: true,
      });
    }

    return this.getMyProfile(userId);
  }

  // ========== MEVCUT FONKSİYONLAR ==========

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

    // Filter by branch
    if (branchId) {
      where.branches = {
        some: { branchId },
      };
    }

    // Filter by subject
    if (subjectId) {
      where.subjects = {
        some: { subjectId },
      };
    }

    // Filter by exam type
    if (examTypeId) {
      where.examTypes = {
        some: { examTypeId },
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

    // Search by name
    if (search) {
      where.OR = [
        {
          user: {
            firstName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          user: {
            lastName: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Build orderBy
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
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        examTypes: {
          include: {
            examType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    // Get teacher IDs for ratings
    const teacherIds = teachers.map((t) => t.id);

    // Get average ratings
    const ratings = await this.prisma.feedback.groupBy({
      by: ['teacherId'],
      where: { teacherId: { in: teacherIds } },
      _avg: {
        comprehensionLevel: true,
        engagementLevel: true,
        participationLevel: true,
      },
    });

    const ratingsMap = new Map(
      ratings.map((r) => [
        r.teacherId,
        ((r._avg.comprehensionLevel || 0) +
          (r._avg.engagementLevel || 0) +
          (r._avg.participationLevel || 0)) / 3,
      ]),
    );

    // Transform response
    const transformedTeachers = await Promise.all(
      teachers.map(async (teacher) => {
        const parentPrice = await this.calculateParentPrice(teacher.hourlyRate.toNumber());
        
        // Get unique subjects
        const uniqueSubjects = Array.from(
          new Set(teacher.subjects.map(ts => ts.subject.name))
        );

        return {
          id: teacher.id,
          firstName: teacher.user.firstName,
          lastNameInitial: teacher.user.lastName ? teacher.user.lastName.charAt(0) + '.' : '',
          profilePhotoUrl: teacher.profilePhotoUrl,
          introVideoUrl: teacher.introVideoUrl,
          bio: teacher.bio,
          hourlyRate: teacher.hourlyRate.toNumber(),
          parentPrice,
          branches: teacher.branches.map(tb => tb.branch.name),
          subjects: uniqueSubjects,
          examTypes: teacher.examTypes.map(te => te.examType.name),
          completedLessons: teacher._count.appointments,
          averageRating: ratingsMap.get(teacher.id) || null,
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

  async getTeacherProfile(id: string) {
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
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        examTypes: {
          include: {
            examType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    // Get average rating
    const rating = await this.prisma.feedback.aggregate({
      where: { teacherId: id },
      _avg: {
        comprehensionLevel: true,
        engagementLevel: true,
        participationLevel: true,
      },
    });

    const avgRating =
      rating._avg.comprehensionLevel !== null
        ? ((rating._avg.comprehensionLevel || 0) +
            (rating._avg.engagementLevel || 0) +
            (rating._avg.participationLevel || 0)) / 3
        : null;

    const parentPrice = await this.calculateParentPrice(teacher.hourlyRate.toNumber());
    
    // Get unique subjects
    const uniqueSubjects = Array.from(
      new Set(teacher.subjects.map(ts => ts.subject.name))
    );

    return {
      id: teacher.id,
      firstName: teacher.user.firstName,
      lastNameInitial: teacher.user.lastName ? teacher.user.lastName.charAt(0) + '.' : '',
      profilePhotoUrl: teacher.profilePhotoUrl,
      introVideoUrl: teacher.introVideoUrl,
      bio: teacher.bio,
      hourlyRate: teacher.hourlyRate.toNumber(),
      parentPrice,
      branches: teacher.branches.map(tb => tb.branch.name),
      subjects: uniqueSubjects,
      subjectIds: teacher.subjects.map(ts => ts.subject.id),
      examTypes: teacher.examTypes.map(te => te.examType.name),
      completedLessons: teacher._count.appointments,
      averageRating: avgRating,
    };
  }

  async getTeacherAvailability(
    teacherId: string,
    startDate: string,
    endDate: string,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Öğretmen bulunamadı');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const availability = await this.prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        OR: [
          {
            isRecurring: true,
          },
          {
            isRecurring: false,
            specificDate: {
              gte: start,
              lte: end,
            },
          },
        ],
      },
      orderBy: [{ specificDate: 'asc' }, { startTime: 'asc' }],
    });

    return availability.map((slot) => ({
      date: slot.specificDate ? slot.specificDate.toISOString().split('T')[0] : null,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isRecurring: slot.isRecurring,
    }));
  }
}
