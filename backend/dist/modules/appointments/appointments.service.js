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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_module_1 = require("../../prisma/prisma.module");
const client_1 = require("@prisma/client");
const common_dto_1 = require("../../common/dto/common.dto");
let AppointmentsService = class AppointmentsService {
    constructor(prisma, configService, eventEmitter, appointmentsQueue) {
        this.prisma = prisma;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.appointmentsQueue = appointmentsQueue;
    }
    async createAppointment(studentUserId, dto) {
        const student = await this.prisma.student.findUnique({
            where: { userId: studentUserId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: dto.teacherId },
            include: { branch: true },
        });
        if (!teacher || !teacher.isApproved) {
            throw new common_1.NotFoundException('Teacher not found or not approved');
        }
        const subject = await this.prisma.subject.findUnique({
            where: { id: dto.subjectId },
        });
        if (!subject || subject.branchId !== teacher.branchId) {
            throw new common_1.BadRequestException('Invalid subject for this teacher');
        }
        const scheduledAt = new Date(dto.scheduledAt);
        const now = new Date();
        const minBookingHours = this.configService.get('platform.minBookingHoursAdvance', 2);
        const maxBookingDays = this.configService.get('platform.maxBookingDaysAdvance', 30);
        const minBookingTime = new Date(now.getTime() + minBookingHours * 60 * 60 * 1000);
        const maxBookingTime = new Date(now.getTime() + maxBookingDays * 24 * 60 * 60 * 1000);
        if (scheduledAt < minBookingTime) {
            throw new common_1.BadRequestException(`Appointments must be booked at least ${minBookingHours} hours in advance`);
        }
        if (scheduledAt > maxBookingTime) {
            throw new common_1.BadRequestException(`Appointments cannot be booked more than ${maxBookingDays} days in advance`);
        }
        const isAvailable = await this.checkTeacherAvailability(dto.teacherId, scheduledAt, dto.durationMinutes || 60);
        if (!isAvailable) {
            throw new common_1.BadRequestException('Selected time slot is not available');
        }
        const conflictingAppointment = await this.prisma.appointment.findFirst({
            where: {
                teacherId: dto.teacherId,
                scheduledAt: scheduledAt,
                status: {
                    notIn: [client_1.AppointmentStatus.CANCELLED, client_1.AppointmentStatus.EXPIRED],
                },
            },
        });
        if (conflictingAppointment) {
            throw new common_1.BadRequestException('This time slot is already booked');
        }
        const paymentAmount = teacher.hourlyRate.toNumber();
        const commissionRate = teacher.commissionRate.toNumber();
        const platformFee = paymentAmount * (commissionRate / 100);
        const teacherEarning = paymentAmount - platformFee;
        const orderCode = this.generateOrderCode();
        let bankTransferDeadline = null;
        if (dto.paymentMethod === client_1.PaymentMethod.BANK_TRANSFER) {
            const deadlineHours = this.configService.get('platform.bankTransferDeadlineHours', 24);
            bankTransferDeadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);
        }
        const appointment = await this.prisma.appointment.create({
            data: {
                orderCode,
                studentId: student.id,
                teacherId: dto.teacherId,
                subjectId: dto.subjectId,
                scheduledAt,
                durationMinutes: dto.durationMinutes || 60,
                paymentMethod: dto.paymentMethod,
                paymentStatus: client_1.PaymentStatus.PENDING,
                paymentAmount,
                platformFee,
                teacherEarning,
                status: client_1.AppointmentStatus.PENDING_PAYMENT,
                studentNote: dto.studentNote,
                bankTransferDeadline,
            },
            include: {
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePhotoUrl: true,
                    },
                },
                subject: {
                    select: { name: true },
                },
            },
        });
        this.eventEmitter.emit('appointment.created', {
            appointmentId: appointment.id,
            studentId: student.id,
            teacherId: dto.teacherId,
            paymentMethod: dto.paymentMethod,
        });
        if (dto.paymentMethod === client_1.PaymentMethod.BANK_TRANSFER) {
            await this.appointmentsQueue.add('check-bank-transfer-expiration', { appointmentId: appointment.id }, {
                delay: (this.configService.get('platform.bankTransferDeadlineHours', 24) + 1) * 60 * 60 * 1000,
            });
        }
        return this.mapToResponseDto(appointment);
    }
    async getAppointmentById(id, userId, userRole) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                teacher: {
                    select: {
                        id: true,
                        userId: true,
                        firstName: true,
                        lastName: true,
                        profilePhotoUrl: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        userId: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                subject: {
                    select: { name: true },
                },
            },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (userRole !== 'ADMIN') {
            const hasAccess = appointment.student.userId === userId ||
                appointment.teacher.userId === userId;
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Access denied to this appointment');
            }
        }
        return this.mapToResponseDto(appointment);
    }
    async listAppointments(userId, userRole, query) {
        const { page = 1, limit = 20, status, startDate, endDate } = query;
        const skip = (page - 1) * limit;
        let whereClause = {};
        if (userRole === 'STUDENT') {
            const student = await this.prisma.student.findUnique({
                where: { userId },
                select: { id: true },
            });
            whereClause.studentId = student?.id;
        }
        else if (userRole === 'TEACHER') {
            const teacher = await this.prisma.teacher.findUnique({
                where: { userId },
                select: { id: true },
            });
            whereClause.teacherId = teacher?.id;
        }
        if (status) {
            whereClause.status = status;
        }
        if (startDate) {
            whereClause.scheduledAt = {
                ...whereClause.scheduledAt,
                gte: new Date(startDate),
            };
        }
        if (endDate) {
            whereClause.scheduledAt = {
                ...whereClause.scheduledAt,
                lte: new Date(endDate),
            };
        }
        const [appointments, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where: whereClause,
                include: {
                    teacher: {
                        select: {
                            firstName: true,
                            lastName: true,
                            profilePhotoUrl: true,
                        },
                    },
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    subject: {
                        select: { name: true },
                    },
                },
                orderBy: { scheduledAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.appointment.count({ where: whereClause }),
        ]);
        const data = appointments.map((apt) => this.mapToResponseDto(apt));
        return new common_dto_1.PaginatedResponseDto(data, total, page, limit);
    }
    async confirmAppointment(id) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                teacher: true,
                student: true,
                subject: true,
            },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.status !== client_1.AppointmentStatus.PENDING_PAYMENT) {
            throw new common_1.BadRequestException('Appointment is not pending payment');
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: {
                status: client_1.AppointmentStatus.CONFIRMED,
                paymentStatus: client_1.PaymentStatus.PAID,
            },
            include: {
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePhotoUrl: true,
                    },
                },
                subject: {
                    select: { name: true },
                },
            },
        });
        this.eventEmitter.emit('appointment.confirmed', {
            appointmentId: id,
            teacherId: appointment.teacherId,
            studentId: appointment.studentId,
            scheduledAt: appointment.scheduledAt,
            subjectName: appointment.subject.name,
        });
        await this.scheduleReminders(id, appointment.scheduledAt);
        return this.mapToResponseDto(updated);
    }
    async cancelAppointment(id, userId, reason) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                teacher: { select: { userId: true } },
                student: { select: { userId: true } },
            },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        const isOwner = appointment.teacher.userId === userId ||
            appointment.student.userId === userId;
        if (!isOwner) {
            throw new common_1.ForbiddenException('Cannot cancel this appointment');
        }
        const cancellationDeadlineHours = this.configService.get('platform.cancellationDeadlineHours', 24);
        const deadline = new Date(appointment.scheduledAt.getTime() - cancellationDeadlineHours * 60 * 60 * 1000);
        if (new Date() > deadline) {
            throw new common_1.BadRequestException(`Appointments must be cancelled at least ${cancellationDeadlineHours} hours before`);
        }
        if (appointment.status === client_1.AppointmentStatus.CANCELLED ||
            appointment.status === client_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel this appointment');
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: {
                status: client_1.AppointmentStatus.CANCELLED,
                cancelledAt: new Date(),
                cancelledById: userId,
                cancellationReason: reason,
            },
            include: {
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePhotoUrl: true,
                    },
                },
                subject: {
                    select: { name: true },
                },
            },
        });
        this.eventEmitter.emit('appointment.cancelled', {
            appointmentId: id,
            cancelledBy: userId,
            paymentStatus: appointment.paymentStatus,
            paymentAmount: appointment.paymentAmount,
        });
        return this.mapToResponseDto(updated);
    }
    async markLessonStarted(id, teacherUserId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId: teacherUserId },
        });
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment || appointment.teacherId !== teacher?.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (appointment.status !== client_1.AppointmentStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Appointment is not confirmed');
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: {
                status: client_1.AppointmentStatus.IN_PROGRESS,
                teacherStartedAt: new Date(),
            },
            include: {
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePhotoUrl: true,
                    },
                },
                subject: {
                    select: { name: true },
                },
            },
        });
        return this.mapToResponseDto(updated);
    }
    async markNoShow(id, teacherUserId, dto) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId: teacherUserId },
        });
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment || appointment.teacherId !== teacher?.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (new Date() < appointment.scheduledAt) {
            throw new common_1.BadRequestException('Cannot mark no-show before scheduled time');
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: {
                status: client_1.AppointmentStatus.NO_SHOW,
                markedNoShow: true,
                noShowReportedAt: new Date(),
            },
            include: {
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePhotoUrl: true,
                    },
                },
                subject: {
                    select: { name: true },
                },
            },
        });
        this.eventEmitter.emit('appointment.no-show', {
            appointmentId: id,
            teacherId: appointment.teacherId,
            teacherEarning: appointment.teacherEarning,
        });
        return this.mapToResponseDto(updated);
    }
    async completeAppointment(id) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: {
                status: client_1.AppointmentStatus.COMPLETED,
            },
            include: {
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePhotoUrl: true,
                    },
                },
                subject: {
                    select: { name: true },
                },
            },
        });
        this.eventEmitter.emit('appointment.completed', {
            appointmentId: id,
            teacherId: appointment.teacherId,
            studentId: appointment.studentId,
            teacherEarning: appointment.teacherEarning,
        });
        return this.mapToResponseDto(updated);
    }
    async checkTeacherAvailability(teacherId, scheduledAt, durationMinutes) {
        const dayOfWeek = scheduledAt.getDay() === 0 ? 6 : scheduledAt.getDay() - 1;
        const time = scheduledAt.toTimeString().slice(0, 8);
        const availability = await this.prisma.teacherAvailability.findFirst({
            where: {
                teacherId,
                OR: [
                    {
                        isRecurring: true,
                        dayOfWeek,
                        startTime: { lte: time },
                        endTime: { gte: time },
                    },
                    {
                        isRecurring: false,
                        specificDate: scheduledAt,
                        startTime: { lte: time },
                        endTime: { gte: time },
                    },
                ],
            },
        });
        return !!availability;
    }
    generateOrderCode() {
        const date = new Date();
        const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `ORD-${datePart}-${randomPart}`;
    }
    async scheduleReminders(appointmentId, scheduledAt) {
        const now = new Date();
        const morningReminder = new Date(scheduledAt);
        morningReminder.setHours(9, 0, 0, 0);
        if (morningReminder > now) {
            await this.appointmentsQueue.add('send-reminder', { appointmentId, type: 'morning' }, { delay: morningReminder.getTime() - now.getTime() });
        }
        const hourBefore = new Date(scheduledAt.getTime() - 60 * 60 * 1000);
        if (hourBefore > now) {
            await this.appointmentsQueue.add('send-reminder', { appointmentId, type: 'hour-before' }, { delay: hourBefore.getTime() - now.getTime() });
        }
    }
    mapToResponseDto(appointment) {
        return {
            id: appointment.id,
            orderCode: appointment.orderCode,
            teacherName: `${appointment.teacher.firstName} ${appointment.teacher.lastName}`,
            teacherPhoto: appointment.teacher.profilePhotoUrl,
            subjectName: appointment.subject.name,
            scheduledAt: appointment.scheduledAt.toISOString(),
            durationMinutes: appointment.durationMinutes,
            paymentMethod: appointment.paymentMethod,
            paymentStatus: appointment.paymentStatus,
            paymentAmount: appointment.paymentAmount.toNumber(),
            status: appointment.status,
            teamsJoinUrl: appointment.teamsJoinUrl,
            studentNote: appointment.studentNote,
            bankTransferDeadline: appointment.bankTransferDeadline?.toISOString(),
        };
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bull_1.InjectQueue)('appointments')),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        config_1.ConfigService,
        event_emitter_1.EventEmitter2, Object])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map