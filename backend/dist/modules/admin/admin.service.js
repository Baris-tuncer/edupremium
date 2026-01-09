"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async getPendingTeachers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [teachers, total] = await Promise.all([
            this.prisma.teacher.findMany({
                where: { isApproved: false },
                include: {
                    user: {
                        select: { email: true, createdAt: true },
                    },
                    branch: {
                        select: { name: true },
                    },
                    invitationCode: {
                        select: { code: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.teacher.count({ where: { isApproved: false } }),
        ]);
        return {
            data: teachers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async approveTeacher(teacherId, adminUserId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
            include: { user: true },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        if (teacher.isApproved) {
            throw new common_1.BadRequestException('Teacher is already approved');
        }
        const [updatedTeacher] = await this.prisma.$transaction([
            this.prisma.teacher.update({
                where: { id: teacherId },
                data: {
                    isApproved: true,
                    approvedAt: new Date(),
                    approvedById: adminUserId,
                },
            }),
            this.prisma.user.update({
                where: { id: teacher.userId },
                data: { status: client_1.UserStatus.ACTIVE },
            }),
        ]);
        this.eventEmitter.emit('teacher.approved', {
            teacherId,
            email: teacher.user.email,
            firstName: teacher.firstName,
        });
        return updatedTeacher;
    }
    async rejectTeacher(teacherId, reason) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
            include: { user: true, invitationCode: true },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: teacher.userId },
                data: { deletedAt: new Date() },
            }),
            ...(teacher.invitationCodeId
                ? [
                    this.prisma.invitationCode.update({
                        where: { id: teacher.invitationCodeId },
                        data: { status: 'ACTIVE', usedAt: null },
                    }),
                ]
                : []),
        ]);
        this.eventEmitter.emit('teacher.rejected', {
            email: teacher.user.email,
            firstName: teacher.firstName,
            reason,
        });
        return { message: 'Teacher rejected' };
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const [totalStudents, totalTeachers, pendingTeachers, monthlyAppointments, weeklyAppointments, monthlyRevenue, pendingBankTransfers,] = await Promise.all([
            this.prisma.student.count(),
            this.prisma.teacher.count({ where: { isApproved: true } }),
            this.prisma.teacher.count({ where: { isApproved: false } }),
            this.prisma.appointment.count({
                where: {
                    createdAt: { gte: startOfMonth },
                    status: { not: 'CANCELLED' },
                },
            }),
            this.prisma.appointment.count({
                where: {
                    createdAt: { gte: startOfWeek },
                    status: { not: 'CANCELLED' },
                },
            }),
            this.prisma.appointment.aggregate({
                where: {
                    createdAt: { gte: startOfMonth },
                    paymentStatus: 'PAID',
                },
                _sum: { paymentAmount: true },
            }),
            this.prisma.appointment.count({
                where: {
                    paymentMethod: 'BANK_TRANSFER',
                    paymentStatus: 'PENDING',
                    status: 'PENDING_PAYMENT',
                },
            }),
        ]);
        return {
            users: {
                totalStudents,
                totalTeachers,
                pendingTeachers,
            },
            appointments: {
                monthlyTotal: monthlyAppointments,
                weeklyTotal: weeklyAppointments,
            },
            finance: {
                monthlyRevenue: monthlyRevenue._sum.paymentAmount || 0,
                pendingBankTransfers,
            },
        };
    }
    async approveBankTransfer(appointmentId, adminUserId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.paymentMethod !== 'BANK_TRANSFER') {
            throw new common_1.BadRequestException('This is not a bank transfer payment');
        }
        if (appointment.paymentStatus !== 'PENDING') {
            throw new common_1.BadRequestException('Payment is not pending');
        }
        const updated = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
                bankTransferApprovedById: adminUserId,
                bankTransferApprovedAt: new Date(),
            },
        });
        this.eventEmitter.emit('appointment.confirmed', {
            appointmentId,
            teacherId: appointment.teacherId,
            studentId: appointment.studentId,
            scheduledAt: appointment.scheduledAt,
        });
        return updated;
    }
    async rejectBankTransfer(appointmentId, reason) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        const updated = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                paymentStatus: 'FAILED',
                status: 'CANCELLED',
                cancellationReason: reason,
            },
        });
        this.eventEmitter.emit('payment.rejected', {
            appointmentId,
            reason,
        });
        return updated;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        event_emitter_1.EventEmitter2])
], AdminService);
//# sourceMappingURL=admin.service.js.map