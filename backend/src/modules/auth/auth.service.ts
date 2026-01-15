import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.module';
import { InvitationService } from '../invitation/invitation.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private invitationService: InvitationService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { teacher: true, student: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // Öğrenci kaydı (değişiklik yok)
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
    // Email kontrolü
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kullanılıyor');
    }

    // Şifre hash
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Transaction ile user ve student oluştur
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
      include: {
        student: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  // DAVET KODU İLE ÖĞRETMEN KAYDI
  async registerTeacher(data: {
    invitationCode: string;
    email: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    branchId: string;
    bio?: string;
    hourlyRate: number;
    iban?: string;
    isNative?: boolean;
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

    // 4. Branch kontrolü
    const branch = await this.prisma.branch.findUnique({
      where: { id: data.branchId },
    });

    if (!branch) {
      throw new BadRequestException('Geçersiz branş');
    }

    // 5. Şifre hash
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 6. Transaction ile user ve teacher oluştur
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
            branchId: data.branchId,
            bio: data.bio,
            hourlyRate: data.hourlyRate,
            iban: data.iban,
            isNative: data.isNative || false,
            invitationCodeId: invitation.id,
          },
        },
      },
      include: {
        teacher: true,
      },
    });

    // 7. Davet kodunu kullanıldı olarak işaretle
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
    try {
      const invitation = await this.invitationService.validateInvitationCode(code);
      return {
        valid: true,
        code: invitation.code,
        assignedEmail: invitation.assignedEmail,
        assignedPhone: invitation.assignedPhone,
        expiresAt: invitation.expiresAt,
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
      };
    }
  }
}
