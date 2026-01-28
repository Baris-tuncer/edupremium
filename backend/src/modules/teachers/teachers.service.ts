import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(private prisma: PrismaService) {}

  // 1. ÖĞRETMEN PROFİLİ
  async findOne(userId: string) {
    return this.prisma.teacher.findUnique({
      where: { userId },
      include: { 
        user: true, 
        branches: { include: { branch: true } },
        subjects: { include: { subject: true } },
        examTypes: { include: { examType: true } }
      }
    });
  }

  // ID Ayıklama Yardımcısı
  private extractIds(items: any): string[] {
    if (!items || !Array.isArray(items)) return [];
    
    const ids = items.map(item => {
        if (!item) return null;
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
            if (item.id && typeof item.id === 'string') return item.id;
            if (item.subjectId && typeof item.subjectId === 'string') return item.subjectId;
            if (item.subject && item.subject.id) return item.subject.id;
            if (item.branch && item.branch.id) return item.branch.id;
            if (item.value && typeof item.value === 'string') return item.value;
        }
        return null;
    }).filter(id => id !== null);

    return [...new Set(ids)];
  }

  // 2. PROFİL GÜNCELLEME
  async update(userId: string, data: any) {
    this.logger.log(`Gelen Veri: ${JSON.stringify(data)}`);

    try {
        const { firstName, lastName, email, phone, ...teacherData } = data;

        if (firstName || lastName || email || phone) {
           await this.prisma.user.update({
             where: { id: userId }, 
             data: { firstName, lastName, email, phone }
           });
        }

        const updateData: any = {};
        
        if (teacherData.bio !== undefined) updateData.bio = teacherData.bio;
        if (teacherData.iban !== undefined) updateData.iban = teacherData.iban;
        if (teacherData.profilePhotoUrl !== undefined) updateData.profilePhotoUrl = teacherData.profilePhotoUrl;
        if (teacherData.introVideoUrl !== undefined) updateData.introVideoUrl = teacherData.introVideoUrl;
        
        if (teacherData.hourlyRate) {
            updateData.hourlyRate = Number(teacherData.hourlyRate.toString().replace(',', '.'));
        }

        if (teacherData.branches) {
            const branchIds = this.extractIds(teacherData.branches);
            updateData.branches = { deleteMany: {}, create: branchIds.map(id => ({ branchId: id })) };
        }
        if (teacherData.subjects) {
            const subjectIds = this.extractIds(teacherData.subjects);
            updateData.subjects = { deleteMany: {}, create: subjectIds.map(id => ({ subjectId: id })) };
        }
        if (teacherData.examTypes) {
            const examIds = this.extractIds(teacherData.examTypes);
            updateData.examTypes = { deleteMany: {}, create: examIds.map(id => ({ examTypeId: id })) };
        }

        return await this.prisma.teacher.update({
          where: { userId },
          data: updateData,
          include: { branches: true, subjects: true }
        });

    } catch (error) {
        throw new BadRequestException(`Güncelleme başarısız: ${error.message}`);
    }
  }

  // 3. MÜSAİTLİK
  async getAvailability(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: { availability: true }, 
    });
    return teacher?.availability || [];
  }

  async updateAvailability(userId: string, availabilityData: any) {
    let slots = [];
    if (Array.isArray(availabilityData)) {
        slots = availabilityData;
    } else if (availabilityData && Array.isArray(availabilityData.slots)) {
        slots = availabilityData.slots;
    }

    return this.prisma.teacher.update({
      where: { userId },
      data: { 
        availability: {
          deleteMany: {}, 
          create: slots.map(slot => ({
            dayOfWeek: Number(slot.dayOfWeek),
            startTime: slot.startTime,
            endTime: slot.endTime,
            isRecurring: true
          }))
        }
      },
    });
  }

  // 4. ÖĞRENCİLERİM LİSTESİ (HATA DÜZELTİLDİ)
  async getMyStudents(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new BadRequestException('Öğretmen profili bulunamadı');

    const appointments = await this.prisma.appointment.findMany({
      where: { teacherId: teacher.id },
      include: {
        student: {
          include: { 
            user: {
              // DÜZELTME: profilePhotoUrl User tablosunda yoksa siliyoruz.
              select: {
                firstName: true,
                lastName: true
              }
            } 
          }
        },
        subject: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const uniqueStudents = new Map();
    
    // DÜZELTME: 'app: any' diyerek TypeScript kontrolünü aşıyoruz
    appointments.forEach((app: any) => {
      if (!uniqueStudents.has(app.studentId)) {
        uniqueStudents.set(app.studentId, {
          id: app.student.id,
          name: `${app.student.user.firstName} ${app.student.user.lastName}`,
          grade: app.student.gradeLevel,
          subject: app.subject.name,
          lastLessonDate: app.scheduledAt,
          totalLessons: 1,
          photoUrl: null 
        });
      } else {
        const existing = uniqueStudents.get(app.studentId);
        existing.totalLessons += 1;
      }
    });

    return Array.from(uniqueStudents.values());
  }

  // 5. DERS TAKVİMİ (HATA DÜZELTİLDİ)
  async getMyAppointments(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new BadRequestException('Öğretmen profili bulunamadı');

    return this.prisma.appointment.findMany({
      where: { teacherId: teacher.id },
      include: {
        student: {
           include: { 
             user: {
               select: { 
                 firstName: true, 
                 lastName: true
               } 
             }
           }
        },
        subject: true
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }
}
