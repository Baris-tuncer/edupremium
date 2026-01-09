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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
let StudentsService = class StudentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentDashboard(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [upcomingLessons, recentLessons, monthlyStats] = await Promise.all([
            this.prisma.appointment.findMany({
                where: {
                    studentId: student.id,
                    status: 'CONFIRMED',
                    scheduledAt: { gte: now },
                },
                include: {
                    teacher: {
                        select: { firstName: true, lastName: true, profilePhotoUrl: true },
                    },
                    subject: { select: { name: true } },
                },
                orderBy: { scheduledAt: 'asc' },
                take: 5,
            }),
            this.prisma.appointment.findMany({
                where: {
                    studentId: student.id,
                    status: 'COMPLETED',
                },
                include: {
                    teacher: { select: { firstName: true, lastName: true } },
                    subject: { select: { name: true } },
                    feedback: {
                        select: {
                            comprehensionLevel: true,
                            aiGeneratedReport: true,
                        },
                    },
                },
                orderBy: { scheduledAt: 'desc' },
                take: 5,
            }),
            this.prisma.appointment.aggregate({
                where: {
                    studentId: student.id,
                    status: 'COMPLETED',
                    scheduledAt: { gte: startOfMonth },
                },
                _count: { id: true },
                _sum: { paymentAmount: true },
            }),
        ]);
        return {
            profile: {
                firstName: student.firstName,
                lastName: student.lastName,
                gradeLevel: student.gradeLevel,
                schoolName: student.schoolName,
            },
            upcomingLessons: upcomingLessons.map((l) => ({
                id: l.id,
                teacherName: `${l.teacher.firstName} ${l.teacher.lastName.charAt(0)}.`,
                teacherPhoto: l.teacher.profilePhotoUrl,
                subject: l.subject.name,
                scheduledAt: l.scheduledAt,
                teamsJoinUrl: l.teamsJoinUrl,
            })),
            recentLessons: recentLessons.map((l) => ({
                id: l.id,
                teacherName: `${l.teacher.firstName} ${l.teacher.lastName.charAt(0)}.`,
                subject: l.subject.name,
                scheduledAt: l.scheduledAt,
                feedback: l.feedback
                    ? {
                        comprehensionLevel: l.feedback.comprehensionLevel,
                        hasReport: !!l.feedback.aiGeneratedReport,
                    }
                    : null,
            })),
            monthlyStats: {
                completedLessons: monthlyStats._count.id,
                totalSpent: monthlyStats._sum.paymentAmount || 0,
            },
        };
    }
    async updateProfile(userId, data) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        return this.prisma.student.update({
            where: { id: student.id },
            data,
        });
    }
    async getLessonHistory(userId, page = 1, limit = 20) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const skip = (page - 1) * limit;
        const [lessons, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where: { studentId: student.id },
                include: {
                    teacher: { select: { firstName: true, lastName: true } },
                    subject: { select: { name: true } },
                    feedback: {
                        select: {
                            comprehensionLevel: true,
                            engagementLevel: true,
                            participationLevel: true,
                            aiGeneratedReport: true,
                        },
                    },
                },
                orderBy: { scheduledAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.appointment.count({ where: { studentId: student.id } }),
        ]);
        return {
            data: lessons,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getLessonReport(userId, appointmentId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                feedback: true,
                teacher: { select: { firstName: true, lastName: true } },
                subject: { select: { name: true } },
            },
        });
        if (!appointment || appointment.studentId !== student.id) {
            throw new common_1.NotFoundException('Lesson not found');
        }
        if (!appointment.feedback?.aiGeneratedReport) {
            throw new common_1.NotFoundException('Report not available yet');
        }
        return {
            lessonDate: appointment.scheduledAt,
            teacherName: `${appointment.teacher.firstName} ${appointment.teacher.lastName}`,
            subject: appointment.subject.name,
            feedback: {
                comprehensionLevel: appointment.feedback.comprehensionLevel,
                engagementLevel: appointment.feedback.engagementLevel,
                participationLevel: appointment.feedback.participationLevel,
                homeworkStatus: appointment.feedback.homeworkStatus,
                topicsCovered: appointment.feedback.topicsCovered,
            },
            aiReport: appointment.feedback.aiGeneratedReport,
        };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map