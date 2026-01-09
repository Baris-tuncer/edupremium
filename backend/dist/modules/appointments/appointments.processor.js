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
var AppointmentsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const client_1 = require("@prisma/client");
let AppointmentsProcessor = AppointmentsProcessor_1 = class AppointmentsProcessor {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AppointmentsProcessor_1.name);
    }
    async handleBankTransferExpiration(job) {
        this.logger.log(`Checking bank transfer expiration for appointment: ${job.data.appointmentId}`);
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: job.data.appointmentId },
        });
        if (!appointment) {
            this.logger.warn(`Appointment not found: ${job.data.appointmentId}`);
            return;
        }
        if (appointment.paymentStatus === client_1.PaymentStatus.PENDING &&
            appointment.status === client_1.AppointmentStatus.PENDING_PAYMENT) {
            if (appointment.bankTransferDeadline && new Date() > appointment.bankTransferDeadline) {
                await this.prisma.appointment.update({
                    where: { id: job.data.appointmentId },
                    data: {
                        status: client_1.AppointmentStatus.EXPIRED,
                        paymentStatus: client_1.PaymentStatus.CANCELLED,
                    },
                });
                this.logger.log(`Appointment expired: ${job.data.appointmentId}`);
                this.eventEmitter.emit('appointment.expired', {
                    appointmentId: job.data.appointmentId,
                });
            }
        }
    }
    async handleReminder(job) {
        this.logger.log(`Sending ${job.data.type} reminder for appointment: ${job.data.appointmentId}`);
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: job.data.appointmentId },
            include: {
                teacher: {
                    include: { user: { select: { email: true, phone: true } } },
                },
                student: {
                    include: { user: { select: { email: true, phone: true } } },
                },
                subject: true,
            },
        });
        if (!appointment) {
            this.logger.warn(`Appointment not found: ${job.data.appointmentId}`);
            return;
        }
        if (appointment.status !== client_1.AppointmentStatus.CONFIRMED) {
            this.logger.log(`Skipping reminder - appointment not confirmed: ${job.data.appointmentId}`);
            return;
        }
        this.eventEmitter.emit('notification.send-reminder', {
            appointmentId: job.data.appointmentId,
            type: job.data.type,
            teacherEmail: appointment.teacher.user.email,
            teacherPhone: appointment.teacher.user.phone,
            studentEmail: appointment.student.user.email,
            studentPhone: appointment.student.user.phone,
            scheduledAt: appointment.scheduledAt,
            subjectName: appointment.subject.name,
            teamsJoinUrl: appointment.teamsJoinUrl,
        });
    }
    async handleAutoComplete(job) {
        this.logger.log(`Auto-completing lesson: ${job.data.appointmentId}`);
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: job.data.appointmentId },
        });
        if (!appointment) {
            return;
        }
        if (appointment.status === client_1.AppointmentStatus.IN_PROGRESS) {
            await this.prisma.appointment.update({
                where: { id: job.data.appointmentId },
                data: { status: client_1.AppointmentStatus.COMPLETED },
            });
            this.eventEmitter.emit('appointment.completed', {
                appointmentId: job.data.appointmentId,
                teacherId: appointment.teacherId,
                studentId: appointment.studentId,
                teacherEarning: appointment.teacherEarning,
            });
        }
    }
};
exports.AppointmentsProcessor = AppointmentsProcessor;
__decorate([
    (0, bull_1.Process)('check-bank-transfer-expiration'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentsProcessor.prototype, "handleBankTransferExpiration", null);
__decorate([
    (0, bull_1.Process)('send-reminder'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentsProcessor.prototype, "handleReminder", null);
__decorate([
    (0, bull_1.Process)('auto-complete-lesson'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentsProcessor.prototype, "handleAutoComplete", null);
exports.AppointmentsProcessor = AppointmentsProcessor = AppointmentsProcessor_1 = __decorate([
    (0, bull_1.Processor)('appointments'),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        event_emitter_1.EventEmitter2])
], AppointmentsProcessor);
//# sourceMappingURL=appointments.processor.js.map