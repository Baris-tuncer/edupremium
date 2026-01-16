import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

// Fiyatlandırma sabitleri
const PLATFORM_COMMISSION_RATE = 0.20; // %20 platform komisyonu
const TAX_RATE = 0.20; // %20 KDV

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Fiyat hesaplama yardımcı fonksiyonu
  calculatePricing(teacherHourlyRate: number) {
    const teacherEarning = teacherHourlyRate; // Öğretmenin alacağı
    const platformFee = teacherHourlyRate * PLATFORM_COMMISSION_RATE; // Platform komisyonu
    const subtotal = teacherEarning + platformFee; // Ara toplam
    const tax = subtotal * TAX_RATE; // KDV
    const totalPrice = subtotal + tax; // Velinin ödeyeceği toplam

    return {
      teacherEarning,
      platformFee,
      subtotal,
      tax,
      totalPrice,
    };
  }

  async getDashboardStats() {
    const [
      totalTeachers,
      activeTeachers,
      totalStudents,
      activeStudents,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
    ] = await Promise.all([
      this.prisma.teacher.count(),
      this.prisma.teacher.count({ where: { user: { status: 'ACTIVE' } } }),
      this.prisma.student.count(),
      this.prisma.student.count({ where: { user: { status: 'ACTIVE' } } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.appointment.count({ where: { status: { in: ['PENDING_PAYMENT', 'CONFIRMED'] } } }),
    ]);

    const payments = await this.prisma.appointment.aggregate({
      where: { paymentStatus: { in: ['COMPLETED', 'PAID'] } },
      _sum: { paymentAmount: true, platformFee: true, teacherEarning: true },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyPayments = await this.prisma.appointment.aggregate({
      where: {
        paymentStatus: { in: ['COMPLETED', 'PAID'] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { paymentAmount: true, platformFee: true },
    });

    return {
      success: true,
      data: {
        totalTeachers,
        activeTeachers,
        totalStudents,
        activeStudents,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalRevenue: payments._sum.paymentAmount?.toNumber() || 0,
        totalPlatformFee: payments._sum.platformFee?.toNumber() || 0,
        totalTeacherEarnings: payments._sum.teacherEarning?.toNumber() || 0,
        monthlyRevenue: monthlyPayments._sum.paymentAmount?.toNumber() || 0,
        monthlyPlatformFee: monthlyPayments._sum.platformFee?.toNumber() || 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Son aktiviteler - gerçek veriler
  async getRecentActivities() {
    const [recentStudents, recentAppointments, recentPayments, recentTeachers] = await Promise.all([
      // Son kayıt olan öğrenciler
      this.prisma.student.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, createdAt: true } } },
      }),
      // Son randevular
      this.prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { firstName: true, lastName: true } },
          teacher: { select: { firstName: true, lastName: true } },
          subject: { select: { name: true } },
        },
      }),
      // Son ödemeler
      this.prisma.appointment.findMany({
        where: { paymentStatus: { in: ['COMPLETED', 'PAID'] } },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          paymentAmount: true,
          updatedAt: true,
          student: { select: { firstName: true, lastName: true } },
        },
      }),
      // Son kayıt olan öğretmenler
      this.prisma.teacher.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, createdAt: true } } },
      }),
    ]);

    // Tüm aktiviteleri birleştir ve sırala
    const activities: any[] = [];

    recentStudents.forEach((s) => {
      activities.push({
        type: 'STUDENT_REGISTERED',
        title: 'Yeni öğrenci kaydı',
        description: `${s.firstName} ${s.lastName} kayıt oldu`,
        createdAt: s.createdAt,
      });
    });

    recentAppointments.forEach((a) => {
      activities.push({
        type: 'APPOINTMENT_CREATED',
        title: 'Yeni randevu',
        description: `${a.student.firstName} ${a.student.lastName} - ${a.teacher.firstName} ${a.teacher.lastName} (${a.subject.name})`,
        createdAt: a.createdAt,
      });
    });

    recentPayments.forEach((p) => {
      activities.push({
        type: 'PAYMENT_RECEIVED',
        title: 'Ödeme alındı',
        description: `${p.student.firstName} ${p.student.lastName} - ₺${p.paymentAmount?.toNumber() || 0}`,
        createdAt: p.updatedAt,
      });
    });

    recentTeachers.forEach((t) => {
      activities.push({
        type: 'TEACHER_REGISTERED',
        title: 'Yeni öğretmen kaydı',
        description: `${t.firstName} ${t.lastName} kayıt oldu`,
        createdAt: t.createdAt,
      });
    });

    // Tarihe göre sırala ve son 10 tanesini al
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: activities.slice(0, 10),
      timestamp: new Date().toISOString(),
    };
  }

  async getAllTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        branches: { include: { branch: true } },
        subjects: { include: { subject: true } },
        _count: { select: { appointments: { where: { status: 'COMPLETED' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: teachers.map((t) => {
        const pricing = this.calculatePricing(t.hourlyRate.toNumber());
        return {
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.user.email,
          phone: t.user.phone,
          branches: t.branches.map((tb) => tb.branch),
          subjects: t.subjects.map((ts) => ts.subject),
          hourlyRate: t.hourlyRate.toNumber(),
          pricing: {
            teacherEarning: pricing.teacherEarning,
            platformFee: pricing.platformFee,
            tax: pricing.tax,
            totalPrice: pricing.totalPrice,
          },
          commissionRate: t.commissionRate.toNumber(),
          totalLessons: t._count.appointments,
          isActive: t.user.status === 'ACTIVE',
          status: t.user.status,
          createdAt: t.createdAt,
          bio: t.bio,
          profilePhotoUrl: t.profilePhotoUrl,
          introVideoUrl: t.introVideoUrl,
        };
      }),
      timestamp: new Date().toISOString(),
    };
  }

  async getPendingTeachers() {
    return {
      success: true,
      data: [],
      message: 'Davet kodu sistemi kullanılıyor. Manuel onay gerekmiyor.',
      timestamp: new Date().toISOString(),
    };
  }

  async approveTeacher(teacherId: string) {
    throw new BadRequestException(
      'Manuel onaylama sistemi kaldırıldı. Öğretmenler davet kodu ile otomatik kayıt oluyor.',
    );
  }

  async rejectTeacher(teacherId: string, reason?: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });
    if (!teacher) throw new NotFoundException('Öğretmen bulunamadı');

    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { status: 'INACTIVE', isActive: false },
    });

    return {
      success: true,
      message: 'Öğretmen devre dışı bırakıldı',
      timestamp: new Date().toISOString(),
    };
  }

  async activateTeacher(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });
    if (!teacher) throw new NotFoundException('Öğretmen bulunamadı');

    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { status: 'ACTIVE', isActive: true },
    });

    return {
      success: true,
      message: 'Öğretmen aktif edildi',
      timestamp: new Date().toISOString(),
    };
  }

  async getAllStudents() {
    const students = await this.prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: students.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.user.email,
        phone: s.user.phone,
        gradeLevel: s.gradeLevel,
        schoolName: s.schoolName,
        parentName: s.parentName,
        parentEmail: s.parentEmail,
        parentPhone: s.parentPhone,
        totalAppointments: s._count.appointments,
        isActive: s.user.status === 'ACTIVE',
        status: s.user.status,
        createdAt: s.createdAt,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async getAllAppointments() {
    const appointments = await this.prisma.appointment.findMany({
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, hourlyRate: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
        subject: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: appointments.map((a) => ({
        id: a.id,
        orderCode: a.orderCode,
        student: a.student,
        teacher: a.teacher,
        subject: a.subject,
        scheduledAt: a.scheduledAt,
        durationMinutes: a.durationMinutes,
        status: a.status,
        paymentStatus: a.paymentStatus,
        paymentAmount: a.paymentAmount?.toNumber() || 0,
        teacherEarning: a.teacherEarning?.toNumber() || 0,
        platformFee: a.platformFee?.toNumber() || 0,
        teamsJoinUrl: a.teamsJoinUrl,
        createdAt: a.createdAt,
        completedAt: a.completedAt,
        cancelledAt: a.cancelledAt,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async getAllPayments() {
    const appointments = await this.prisma.appointment.findMany({
      where: { paymentStatus: { in: ['COMPLETED', 'PAID', 'PENDING'] } },
      include: {
        teacher: { select: { firstName: true, lastName: true, hourlyRate: true } },
        student: { select: { firstName: true, lastName: true } },
        subject: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Toplam hesaplamaları
    const totals = appointments.reduce(
      (acc, a) => {
        if (a.paymentStatus === 'COMPLETED' || a.paymentStatus === 'PAID') {
          acc.totalRevenue += a.paymentAmount?.toNumber() || 0;
          acc.totalPlatformFee += a.platformFee?.toNumber() || 0;
          acc.totalTeacherEarnings += a.teacherEarning?.toNumber() || 0;
        }
        return acc;
      },
      { totalRevenue: 0, totalPlatformFee: 0, totalTeacherEarnings: 0 },
    );

    // KDV hesaplama (platform komisyonu + öğretmen kazancı üzerinden)
    const totalTax = totals.totalRevenue - totals.totalPlatformFee - totals.totalTeacherEarnings;

    return {
      success: true,
      data: appointments.map((a) => ({
        id: a.id,
        orderCode: a.orderCode,
        student: a.student,
        teacher: a.teacher,
        subject: a.subject,
        scheduledAt: a.scheduledAt,
        paymentStatus: a.paymentStatus,
        paymentMethod: a.paymentMethod,
        paymentAmount: a.paymentAmount?.toNumber() || 0,
        teacherEarning: a.teacherEarning?.toNumber() || 0,
        platformFee: a.platformFee?.toNumber() || 0,
        createdAt: a.createdAt,
      })),
      totals: {
        ...totals,
        totalTax,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getTeacherEarnings() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        user: { select: { email: true, status: true } },
        wallet: true,
        _count: { select: { appointments: { where: { status: 'COMPLETED' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Toplam hakediş hesaplamaları
    const totals = teachers.reduce(
      (acc, t) => {
        acc.totalPending += t.wallet?.pendingBalance?.toNumber() || 0;
        acc.totalAvailable += t.wallet?.availableBalance?.toNumber() || 0;
        acc.totalPaid += t.wallet?.totalWithdrawn?.toNumber() || 0;
        acc.totalEarned += t.wallet?.totalEarned?.toNumber() || 0;
        return acc;
      },
      { totalPending: 0, totalAvailable: 0, totalPaid: 0, totalEarned: 0 },
    );

    return {
      success: true,
      data: teachers.map((t) => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.user.email,
        iban: t.iban,
        hourlyRate: t.hourlyRate.toNumber(),
        completedLessons: t._count.appointments,
        wallet: t.wallet
          ? {
              pendingBalance: t.wallet.pendingBalance.toNumber(),
              availableBalance: t.wallet.availableBalance.toNumber(),
              totalEarned: t.wallet.totalEarned.toNumber(),
              totalWithdrawn: t.wallet.totalWithdrawn.toNumber(),
            }
          : null,
        isActive: t.user.status === 'ACTIVE',
      })),
      totals,
      timestamp: new Date().toISOString(),
    };
  }

  // Randevu durumu güncelleme
  async updateAppointmentStatus(appointmentId: string, status: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) throw new NotFoundException('Randevu bulunamadı');

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: status as any,
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
        ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }
}
