import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.module';
import { InvitationService } from '../invitation/invitation.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => InvitationService))
    private invitationService: InvitationService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { teacher: true, student: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Geçersiz kullanıcı adı veya şifre');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz kullanıcı adı veya şifre');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '999y' },
    );

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 999 * 365 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async registerStudent(data: {
    email: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    gradeLevel?: number;
    schoolName?: string;
    parentName?: string;
    parentEmail?: string;
    parentPhone?: string;
  }) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Bu email veya telefon numarası zaten kullanılıyor');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'STUDENT',
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            gradeLevel: data.gradeLevel,
            schoolName: data.schoolName,
            parentName: data.parentName,
            parentEmail: data.parentEmail,
            parentPhone: data.parentPhone,
          },
        },
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async registerTeacher(data: {
    invitationCode: string;
    email: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    branchIds: string[];
    subjectIds?: string[];
    examTypeIds?: string[];
    bio?: string;
    hourlyRate: number;
    iban?: string;
    isNative?: boolean;
    profilePhotoUrl?: string;
    introVideoUrl?: string;
    diplomaUrl?: string;
  }) {
    // 1. Davet kodunu doğrula
    const invitation = await this.invitationService.validateInvitationCode(data.invitationCode);

    // 2. Email/telefon kontrolü
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Bu email veya telefon numarası zaten kullanılıyor');
    }

    // 3. Davet kodunun email/phone'u eşleşiyor mu kontrol et (opsiyonel)
    if (invitation.assignedEmail && invitation.assignedEmail !== data.email) {
      throw new BadRequestException('Bu davet kodu başka bir email adresine tanımlanmış');
    }

    if (invitation.assignedPhone && invitation.assignedPhone !== data.phone) {
      throw new BadRequestException('Bu davet kodu başka bir telefon numarasına tanımlanmış');
    }

    // 4. Branch kontrolü (en az 1 tane olmalı)
    if (!data.branchIds || data.branchIds.length === 0) {
      throw new BadRequestException('En az bir branş seçmelisiniz');
    }

    const branches = await this.prisma.branch.findMany({
      where: { id: { in: data.branchIds } },
    });

    if (branches.length !== data.branchIds.length) {
      throw new BadRequestException('Geçersiz branş seçimi');
    }

    // 5. Subject kontrolü (opsiyonel)
    if (data.subjectIds && data.subjectIds.length > 0) {
      const subjects = await this.prisma.subject.findMany({
        where: { id: { in: data.subjectIds } },
      });

      if (subjects.length !== data.subjectIds.length) {
        throw new BadRequestException('Geçersiz ders seçimi');
      }
    }

    // 6. ExamType kontrolü (opsiyonel)
    if (data.examTypeIds && data.examTypeIds.length > 0) {
      const examTypes = await this.prisma.examType.findMany({
        where: { id: { in: data.examTypeIds } },
      });

      if (examTypes.length !== data.examTypeIds.length) {
        throw new BadRequestException('Geçersiz sınav tipi seçimi');
      }
    }

    // 7. Şifre hash
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 8. Transaction ile user ve teacher oluştur
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'TEACHER',
        teacher: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            bio: data.bio,
            hourlyRate: data.hourlyRate,
            iban: data.iban,
            isNative: data.isNative || false,
            invitationCodeId: invitation.id,
            profilePhotoUrl: data.profilePhotoUrl,
            introVideoUrl: data.introVideoUrl,
            diplomaUrl: data.diplomaUrl,
            branches: {
              create: data.branchIds.map(branchId => ({ branchId })),
            },
            subjects: data.subjectIds && data.subjectIds.length > 0 ? {
              create: data.subjectIds.map(subjectId => ({ subjectId })),
            } : undefined,
            examTypes: data.examTypeIds && data.examTypeIds.length > 0 ? {
              create: data.examTypeIds.map(examTypeId => ({ examTypeId })),
            } : undefined,
          },
        },
      },
      include: {
        teacher: {
          include: {
            branches: { include: { branch: true } },
            subjects: { include: { subject: true } },
            examTypes: { include: { examType: true } },
          },
        },
      },
    });

    // 9. Davet kodunu kullanıldı olarak işaretle
    await this.invitationService.useInvitationCode(data.invitationCode, user.teacher.id);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      teacher: {
        id: user.teacher.id,
        firstName: user.teacher.firstName,
        lastName: user.teacher.lastName,
      },
    };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { teacher: true, student: true },
    });
  }

  // Davet kodunu doğrula (frontend için)
  async checkInvitationCode(code: string) {
    return this.invitationService.validateInvitationCode(code);
  }
}
