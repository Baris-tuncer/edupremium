"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const prisma_module_1 = require("../../prisma/prisma.module");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async registerStudent(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    role: client_1.UserRole.STUDENT,
                    status: 'ACTIVE',
                    phone: dto.phone,
                },
            });
            await tx.student.create({
                data: {
                    userId: user.id,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    gradeLevel: dto.gradeLevel,
                    schoolName: dto.schoolName,
                    parentName: dto.parentName,
                    parentEmail: dto.parentEmail,
                    parentPhone: dto.parentPhone,
                },
            });
            return user;
        });
        return this.generateTokens(result.id, result.email, result.role);
    }
    async registerTeacher(dto) {
        const invitation = await this.prisma.invitationCode.findUnique({
            where: { code: dto.invitationCode },
        });
        if (!invitation) {
            throw new common_1.BadRequestException('Invalid invitation code');
        }
        if (invitation.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Invitation code is no longer valid');
        }
        if (invitation.expiresAt && invitation.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invitation code has expired');
        }
        if (invitation.assignedEmail && invitation.assignedEmail !== dto.email) {
            throw new common_1.BadRequestException('This invitation code is assigned to a different email');
        }
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const branch = await this.prisma.branch.findUnique({
            where: { id: dto.branchId },
        });
        if (!branch) {
            throw new common_1.BadRequestException('Invalid branch');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    role: client_1.UserRole.TEACHER,
                    status: 'PENDING',
                    phone: dto.phone,
                },
            });
            const teacher = await tx.teacher.create({
                data: {
                    userId: user.id,
                    invitationCodeId: invitation.id,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    branchId: dto.branchId,
                    introVideoUrl: dto.introVideoUrl,
                    bio: dto.bio,
                    hourlyRate: dto.hourlyRate,
                    iban: dto.iban,
                },
            });
            await tx.invitationCode.update({
                where: { id: invitation.id },
                data: {
                    status: 'USED',
                    usedAt: new Date(),
                },
            });
            return user;
        });
        return this.generateTokens(result.id, result.email, result.role);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || user.deletedAt) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === 'SUSPENDED') {
            throw new common_1.UnauthorizedException('Account suspended. Please contact support.');
        }
        return this.generateTokens(user.id, user.email, user.role);
    }
    async refreshToken(dto) {
        try {
            const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const session = await this.prisma.session.findUnique({
                where: { refreshToken: dto.refreshToken },
            });
            if (!session || session.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.deletedAt || user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            await this.prisma.session.delete({
                where: { id: session.id },
            });
            return this.generateTokens(user.id, user.email, user.role);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(refreshToken) {
        await this.prisma.session.deleteMany({
            where: { refreshToken },
        });
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            return { message: 'If the email exists, a reset link has been sent' };
        }
        const resetToken = (0, uuid_1.v4)();
        const resetExpires = new Date(Date.now() + 3600000);
        await this.prisma.systemConfig.upsert({
            where: { key: `password_reset:${resetToken}` },
            update: { value: JSON.stringify({ userId: user.id, expires: resetExpires }) },
            create: {
                key: `password_reset:${resetToken}`,
                value: JSON.stringify({ userId: user.id, expires: resetExpires }),
                type: 'json',
            },
        });
        return { message: 'If the email exists, a reset link has been sent' };
    }
    async resetPassword(dto) {
        const resetData = await this.prisma.systemConfig.findUnique({
            where: { key: `password_reset:${dto.token}` },
        });
        if (!resetData) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const parsed = JSON.parse(resetData.value);
        if (new Date(parsed.expires) < new Date()) {
            await this.prisma.systemConfig.delete({
                where: { key: `password_reset:${dto.token}` },
            });
            throw new common_1.BadRequestException('Reset token has expired');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: parsed.userId },
                data: { passwordHash },
            }),
            this.prisma.systemConfig.delete({
                where: { key: `password_reset:${dto.token}` },
            }),
            this.prisma.session.deleteMany({
                where: { userId: parsed.userId },
            }),
        ]);
        return { message: 'Password has been reset successfully' };
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.session.create({
            data: {
                userId,
                refreshToken,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
            tokenType: 'Bearer',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map