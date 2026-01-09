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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCurrentUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                emailVerified: true,
                phone: true,
                phoneVerified: true,
                createdAt: true,
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePhotoUrl: true,
                        isApproved: true,
                        branch: { select: { name: true } },
                    },
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        gradeLevel: true,
                        schoolName: true,
                        parentName: true,
                        parentEmail: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });
        await this.prisma.session.deleteMany({
            where: { userId },
        });
        return { message: 'Password changed successfully' };
    }
    async updateEmail(userId, newEmail) {
        const existing = await this.prisma.user.findUnique({
            where: { email: newEmail },
        });
        if (existing && existing.id !== userId) {
            throw new common_1.BadRequestException('Email already in use');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                email: newEmail,
                emailVerified: false,
            },
        });
        return { message: 'Email updated. Please verify your new email.' };
    }
    async updatePhone(userId, newPhone) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                phone: newPhone,
                phoneVerified: false,
            },
        });
        return { message: 'Phone updated. Please verify your new phone.' };
    }
    async deleteAccount(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() },
        });
        await this.prisma.session.deleteMany({
            where: { userId },
        });
        return { message: 'Account scheduled for deletion. You have 30 days to recover.' };
    }
    async exportUserData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacher: {
                    include: {
                        appointments: {
                            include: {
                                subject: true,
                                student: { select: { firstName: true } },
                            },
                        },
                        feedbacks: true,
                        wallet: { include: { transactions: true } },
                    },
                },
                student: {
                    include: {
                        appointments: {
                            include: {
                                subject: true,
                                teacher: { select: { firstName: true, lastName: true } },
                            },
                        },
                        feedbacks: true,
                    },
                },
                sessions: {
                    select: { createdAt: true, userAgent: true, ipAddress: true },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash, ...safeUser } = user;
        return {
            exportDate: new Date().toISOString(),
            userData: safeUser,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map