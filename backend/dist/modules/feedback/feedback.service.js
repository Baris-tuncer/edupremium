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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_module_1 = require("../../prisma/prisma.module");
const ai_report_service_1 = require("./ai-report.service");
const client_1 = require("@prisma/client");
let FeedbackService = class FeedbackService {
    constructor(prisma, aiReportService, eventEmitter) {
        this.prisma = prisma;
        this.aiReportService = aiReportService;
        this.eventEmitter = eventEmitter;
    }
    async createFeedback(teacherUserId, dto) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId: teacherUserId },
        });
        if (!teacher) {
            throw new common_1.ForbiddenException('Teacher not found');
        }
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: dto.appointmentId },
            include: {
                student: true,
                subject: true,
            },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('Not your appointment');
        }
        if (appointment.status !== client_1.AppointmentStatus.COMPLETED &&
            appointment.status !== client_1.AppointmentStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot add feedback to this appointment');
        }
        const existingFeedback = await this.prisma.feedback.findUnique({
            where: { appointmentId: dto.appointmentId },
        });
        if (existingFeedback) {
            throw new common_1.BadRequestException('Feedback already submitted for this appointment');
        }
        const feedback = await this.prisma.feedback.create({
            data: {
                appointmentId: dto.appointmentId,
                teacherId: teacher.id,
                studentId: appointment.studentId,
                comprehensionLevel: dto.comprehensionLevel,
                engagementLevel: dto.engagementLevel,
                participationLevel: dto.participationLevel,
                homeworkStatus: dto.homeworkStatus,
                teacherNotes: dto.teacherNotes,
                topicsCovered: dto.topicsCovered,
                areasForImprovement: dto.areasForImprovement,
            },
        });
        if (appointment.status !== client_1.AppointmentStatus.COMPLETED) {
            await this.prisma.appointment.update({
                where: { id: dto.appointmentId },
                data: { status: client_1.AppointmentStatus.COMPLETED },
            });
            this.eventEmitter.emit('appointment.completed', {
                appointmentId: dto.appointmentId,
                teacherId: teacher.id,
                studentId: appointment.studentId,
                teacherEarning: appointment.teacherEarning,
            });
        }
        if (appointment.student.parentEmail || appointment.student.parentPhone) {
            await this.generateAndSendAiReport(feedback.id);
        }
        return this.mapToResponseDto(feedback);
    }
    async generateAndSendAiReport(feedbackId) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: {
                appointment: {
                    include: { subject: true },
                },
                student: true,
                teacher: true,
            },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback not found');
        }
        const feedbackData = {
            studentName: `${feedback.student.firstName} ${feedback.student.lastName}`,
            gradeLevel: feedback.student.gradeLevel || 0,
            subjectName: feedback.appointment.subject.name,
            lessonDate: feedback.appointment.scheduledAt.toLocaleDateString('tr-TR'),
            teacherName: `${feedback.teacher.firstName} ${feedback.teacher.lastName}`,
            comprehensionLevel: feedback.comprehensionLevel,
            engagementLevel: feedback.engagementLevel,
            participationLevel: feedback.participationLevel,
            homeworkStatus: feedback.homeworkStatus,
            topicsCovered: feedback.topicsCovered,
            teacherNotes: feedback.teacherNotes || undefined,
            areasForImprovement: feedback.areasForImprovement,
        };
        const aiReport = await this.aiReportService.generateParentReport(feedbackData);
        await this.prisma.feedback.update({
            where: { id: feedbackId },
            data: {
                aiGeneratedReport: aiReport,
                aiReportGeneratedAt: new Date(),
                aiModelUsed: 'claude-3-opus',
            },
        });
        if (feedback.student.parentEmail || feedback.student.parentPhone) {
            this.eventEmitter.emit('feedback.report-ready', {
                feedbackId,
                studentId: feedback.studentId,
                parentEmail: feedback.student.parentEmail,
                parentPhone: feedback.student.parentPhone,
                report: aiReport,
            });
        }
    }
    async getFeedbackById(id, userId, userRole) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { id },
            include: {
                teacher: { select: { userId: true, firstName: true, lastName: true } },
                student: { select: { userId: true, firstName: true, lastName: true } },
                appointment: { select: { scheduledAt: true, subject: { select: { name: true } } } },
            },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback not found');
        }
        if (userRole !== 'ADMIN') {
            if (feedback.teacher.userId !== userId && feedback.student.userId !== userId) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        return this.mapToResponseDto(feedback);
    }
    async listStudentFeedbacks(studentUserId, page = 1, limit = 20) {
        const student = await this.prisma.student.findUnique({
            where: { userId: studentUserId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        const [feedbacks, total] = await Promise.all([
            this.prisma.feedback.findMany({
                where: { studentId: student.id },
                include: {
                    teacher: { select: { firstName: true, lastName: true } },
                    appointment: { select: { scheduledAt: true, subject: { select: { name: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.feedback.count({ where: { studentId: student.id } }),
        ]);
        return {
            data: feedbacks.map((f) => this.mapToResponseDto(f)),
            total,
        };
    }
    async resendReportToParent(feedbackId) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: { student: true },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback not found');
        }
        if (!feedback.aiGeneratedReport) {
            throw new common_1.BadRequestException('No AI report generated for this feedback');
        }
        this.eventEmitter.emit('feedback.resend-report', {
            feedbackId,
            parentEmail: feedback.student.parentEmail,
            parentPhone: feedback.student.parentPhone,
            report: feedback.aiGeneratedReport,
        });
        return { message: 'Report resend initiated' };
    }
    mapToResponseDto(feedback) {
        return {
            id: feedback.id,
            appointmentId: feedback.appointmentId,
            teacherName: feedback.teacher
                ? `${feedback.teacher.firstName} ${feedback.teacher.lastName}`
                : undefined,
            studentName: feedback.student
                ? `${feedback.student.firstName} ${feedback.student.lastName}`
                : undefined,
            subjectName: feedback.appointment?.subject?.name,
            lessonDate: feedback.appointment?.scheduledAt?.toISOString(),
            comprehensionLevel: feedback.comprehensionLevel,
            engagementLevel: feedback.engagementLevel,
            participationLevel: feedback.participationLevel,
            homeworkStatus: feedback.homeworkStatus,
            topicsCovered: feedback.topicsCovered,
            teacherNotes: feedback.teacherNotes,
            areasForImprovement: feedback.areasForImprovement,
            aiGeneratedReport: feedback.aiGeneratedReport,
            reportSentToParent: feedback.reportSentToParent,
            createdAt: feedback.createdAt?.toISOString(),
        };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        ai_report_service_1.AiReportService,
        event_emitter_1.EventEmitter2])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map