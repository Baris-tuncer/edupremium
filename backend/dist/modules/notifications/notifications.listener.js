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
var NotificationsListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const email_service_1 = require("./email.service");
const sms_service_1 = require("./sms.service");
const teams_service_1 = require("./teams.service");
const prisma_module_1 = require("../../prisma/prisma.module");
let NotificationsListener = NotificationsListener_1 = class NotificationsListener {
    constructor(emailService, smsService, teamsService, prisma) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.teamsService = teamsService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationsListener_1.name);
    }
    async handleAppointmentCreated(payload) {
        this.logger.log(`Appointment created: ${payload.appointmentId}`);
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: payload.appointmentId },
            include: {
                student: { include: { user: true } },
                teacher: { include: { user: true } },
                subject: true,
            },
        });
        if (!appointment)
            return;
        if (payload.paymentMethod === 'BANK_TRANSFER') {
            await this.emailService.sendBankTransferInstructions(appointment.student.user.email, {
                studentName: appointment.student.firstName,
                orderCode: appointment.orderCode,
                amount: appointment.paymentAmount.toNumber(),
                deadline: appointment.bankTransferDeadline,
            });
        }
    }
    async handleAppointmentConfirmed(payload) {
        this.logger.log(`Appointment confirmed: ${payload.appointmentId}`);
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: payload.appointmentId },
            include: {
                student: { include: { user: true } },
                teacher: { include: { user: true } },
                subject: true,
            },
        });
        if (!appointment)
            return;
        try {
            const meeting = await this.teamsService.createMeeting(payload.appointmentId, `${appointment.subject.name} Dersi - ${appointment.student.firstName}`, appointment.scheduledAt, appointment.durationMinutes);
            this.logger.log(`Teams meeting created: ${meeting.joinUrl}`);
        }
        catch (error) {
            this.logger.error('Failed to create Teams meeting:', error);
        }
        await Promise.all([
            this.emailService.sendAppointmentConfirmation(appointment.student.user.email, {
                recipientName: appointment.student.firstName,
                teacherName: `${appointment.teacher.firstName} ${appointment.teacher.lastName}`,
                subject: appointment.subject.name,
                scheduledAt: appointment.scheduledAt,
                teamsJoinUrl: appointment.teamsJoinUrl || '',
            }),
            this.emailService.sendAppointmentConfirmation(appointment.teacher.user.email, {
                recipientName: appointment.teacher.firstName,
                teacherName: `${appointment.student.firstName}`,
                subject: appointment.subject.name,
                scheduledAt: appointment.scheduledAt,
                teamsJoinUrl: appointment.teamsJoinUrl || '',
            }),
        ]);
        if (appointment.student.user.phone) {
            await this.smsService.sendLessonReminder(appointment.student.user.phone, {
                name: appointment.student.firstName,
                subject: appointment.subject.name,
                date: appointment.scheduledAt,
            });
        }
    }
    async handleAppointmentCancelled(payload) {
        this.logger.log(`Appointment cancelled: ${payload.appointmentId}`);
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: payload.appointmentId },
            include: {
                student: { include: { user: true } },
                teacher: { include: { user: true } },
                subject: true,
            },
        });
        if (!appointment)
            return;
        if (appointment.teamsMeetingId) {
            await this.teamsService.deleteMeeting(appointment.teamsMeetingId);
        }
        await Promise.all([
            this.emailService.sendAppointmentCancellation(appointment.student.user.email, {
                name: appointment.student.firstName,
                subject: appointment.subject.name,
                scheduledAt: appointment.scheduledAt,
            }),
            this.emailService.sendAppointmentCancellation(appointment.teacher.user.email, {
                name: appointment.teacher.firstName,
                subject: appointment.subject.name,
                scheduledAt: appointment.scheduledAt,
            }),
        ]);
    }
    async handleAppointmentCompleted(payload) {
        this.logger.log(`Appointment completed: ${payload.appointmentId}`);
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: payload.appointmentId },
            include: {
                student: { include: { user: true } },
                teacher: true,
                subject: true,
            },
        });
        if (!appointment)
            return;
        await this.emailService.sendFeedbackRequest(appointment.teacher.user?.email || '', {
            teacherName: appointment.teacher.firstName,
            studentName: appointment.student.firstName,
            subject: appointment.subject.name,
            appointmentId: payload.appointmentId,
        });
    }
    async handleTeacherApproved(payload) {
        this.logger.log(`Teacher approved: ${payload.teacherId}`);
        await this.emailService.sendTeacherApproval(payload.email, {
            name: payload.firstName,
        });
    }
    async handleSendReminder(payload) {
        this.logger.log(`Sending ${payload.type} reminder for ${payload.appointmentId}`);
        const reminderText = payload.type === 'morning'
            ? `Bugün ${payload.subjectName} dersiniz var!`
            : `${payload.subjectName} dersinize 1 saat kaldı!`;
        await this.emailService.sendLessonReminder(payload.studentEmail, {
            message: reminderText,
            scheduledAt: payload.scheduledAt,
            teamsJoinUrl: payload.teamsJoinUrl,
        });
        if (payload.studentPhone) {
            await this.smsService.sendText(payload.studentPhone, `${reminderText} Ders linki: ${payload.teamsJoinUrl}`);
        }
        await this.emailService.sendLessonReminder(payload.teacherEmail, {
            message: reminderText,
            scheduledAt: payload.scheduledAt,
            teamsJoinUrl: payload.teamsJoinUrl,
        });
        if (payload.teacherPhone) {
            await this.smsService.sendText(payload.teacherPhone, `${reminderText} Ders linki: ${payload.teamsJoinUrl}`);
        }
    }
};
exports.NotificationsListener = NotificationsListener;
__decorate([
    (0, event_emitter_1.OnEvent)('appointment.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsListener.prototype, "handleAppointmentCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('appointment.confirmed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsListener.prototype, "handleAppointmentConfirmed", null);
__decorate([
    (0, event_emitter_1.OnEvent)('appointment.cancelled'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsListener.prototype, "handleAppointmentCancelled", null);
__decorate([
    (0, event_emitter_1.OnEvent)('appointment.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsListener.prototype, "handleAppointmentCompleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('teacher.approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsListener.prototype, "handleTeacherApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)('notification.send-reminder'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsListener.prototype, "handleSendReminder", null);
exports.NotificationsListener = NotificationsListener = NotificationsListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        sms_service_1.SmsService,
        teams_service_1.TeamsService,
        prisma_module_1.PrismaService])
], NotificationsListener);
//# sourceMappingURL=notifications.listener.js.map