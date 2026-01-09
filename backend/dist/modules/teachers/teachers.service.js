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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const common_dto_1 = require("../../common/dto/common.dto");
let TeachersService = class TeachersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listTeachers(query) {
        const { page = 1, limit = 20, branchId, subjectId, minPrice, maxPrice, search } = query;
        const skip = (page - 1) * limit;
        const where = {
            isApproved: true,
            user: { status: 'ACTIVE', deletedAt: null },
        };
        if (branchId) {
            where.branchId = branchId;
        }
        if (subjectId) {
            where.subjects = {
                some: { subjectId },
            };
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.hourlyRate = {};
            if (minPrice !== undefined)
                where.hourlyRate.gte = minPrice;
            if (maxPrice !== undefined)
                where.hourlyRate.lte = maxPrice;
        }
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [teachers, total] = await Promise.all([
            this.prisma.teacher.findMany({
                where,
                include: {
                    branch: { select: { name: true } },
                    subjects: {
                        include: { subject: { select: { name: true } } },
                    },
                    _count: {
                        select: {
                            appointments: {
                                where: { status: 'COMPLETED' },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.teacher.count({ where }),
        ]);
        const teacherIds = teachers.map((t) => t.id);
        const ratings = await this.prisma.feedback.groupBy({
            by: ['teacherId'],
            where: { teacherId: { in: teacherIds } },
            _avg: {
                comprehensionLevel: true,
                engagementLevel: true,
                participationLevel: true,
            },
        });
        const ratingsMap = new Map(ratings.map((r) => [
            r.teacherId,
            ((r._avg.comprehensionLevel || 0) +
                (r._avg.engagementLevel || 0) +
                (r._avg.participationLevel || 0)) /
                3,
        ]));
        const data = teachers.map((t) => ({
            id: t.id,
            firstName: t.firstName,
            lastNameInitial: t.lastName.charAt(0) + '.',
            profilePhotoUrl: t.profilePhotoUrl,
            introVideoUrl: t.introVideoUrl,
            bio: t.bio,
            hourlyRate: t.hourlyRate.toNumber(),
            branchName: t.branch.name,
            subjects: t.subjects.map((s) => s.subject.name),
            completedLessons: t._count.appointments,
            averageRating: ratingsMap.get(t.id) || null,
        }));
        return new common_dto_1.PaginatedResponseDto(data, total, page, limit);
    }
    async getTeacherProfile(id) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: {
                branch: { select: { name: true } },
                subjects: {
                    include: { subject: { select: { name: true } } },
                },
                _count: {
                    select: {
                        appointments: {
                            where: { status: 'COMPLETED' },
                        },
                    },
                },
            },
        });
        if (!teacher || !teacher.isApproved) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        const rating = await this.prisma.feedback.aggregate({
            where: { teacherId: id },
            _avg: {
                comprehensionLevel: true,
                engagementLevel: true,
                participationLevel: true,
            },
        });
        const avgRating = ((rating._avg.comprehensionLevel || 0) +
            (rating._avg.engagementLevel || 0) +
            (rating._avg.participationLevel || 0)) /
            3;
        return {
            id: teacher.id,
            firstName: teacher.firstName,
            lastNameInitial: teacher.lastName.charAt(0) + '.',
            profilePhotoUrl: teacher.profilePhotoUrl,
            introVideoUrl: teacher.introVideoUrl,
            bio: teacher.bio,
            hourlyRate: teacher.hourlyRate.toNumber(),
            branchName: teacher.branch.name,
            subjects: teacher.subjects.map((s) => s.subject.name),
            completedLessons: teacher._count.appointments,
            averageRating: avgRating || null,
        };
    }
    async getTeacherAvailability(teacherId, startDate, endDate) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacher || !teacher.isApproved) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const slots = [];
        const recurringAvailability = await this.prisma.teacherAvailability.findMany({
            where: {
                teacherId,
                isRecurring: true,
            },
        });
        const specificAvailability = await this.prisma.teacherAvailability.findMany({
            where: {
                teacherId,
                isRecurring: false,
                specificDate: {
                    gte: start,
                    lte: end,
                },
            },
        });
        const appointments = await this.prisma.appointment.findMany({
            where: {
                teacherId,
                scheduledAt: {
                    gte: start,
                    lte: end,
                },
                status: {
                    notIn: ['CANCELLED', 'EXPIRED'],
                },
            },
            select: { scheduledAt: true, durationMinutes: true },
        });
        const bookedSlots = new Set(appointments.map((a) => a.scheduledAt.toISOString()));
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
            const dateStr = currentDate.toISOString().split('T')[0];
            const specificSlots = specificAvailability.filter((a) => a.specificDate?.toISOString().split('T')[0] === dateStr);
            const daySlots = specificSlots.length > 0
                ? specificSlots
                : recurringAvailability.filter((a) => a.dayOfWeek === dayOfWeek);
            for (const slot of daySlots) {
                const slotDateTime = new Date(`${dateStr}T${slot.startTime.toISOString().split('T')[1]}`);
                slots.push({
                    date: dateStr,
                    startTime: slot.startTime.toISOString().split('T')[1].slice(0, 5),
                    endTime: slot.endTime.toISOString().split('T')[1].slice(0, 5),
                    isBooked: bookedSlots.has(slotDateTime.toISOString()),
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return slots;
    }
    async updateProfile(userId, data) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher profile not found');
        }
        return this.prisma.teacher.update({
            where: { id: teacher.id },
            data,
        });
    }
    async updateAvailability(userId, slots) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher profile not found');
        }
        await this.prisma.teacherAvailability.deleteMany({
            where: {
                teacherId: teacher.id,
                isRecurring: true,
            },
        });
        const createdSlots = await this.prisma.teacherAvailability.createMany({
            data: slots.map((slot) => ({
                teacherId: teacher.id,
                dayOfWeek: slot.dayOfWeek,
                startTime: new Date(`1970-01-01T${slot.startTime}:00Z`),
                endTime: new Date(`1970-01-01T${slot.endTime}:00Z`),
                isRecurring: slot.isRecurring,
                specificDate: slot.specificDate ? new Date(slot.specificDate) : null,
            })),
        });
        return { created: createdSlots.count };
    }
    async getTeacherDashboard(userId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId },
            include: { wallet: true },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher profile not found');
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [upcomingLessons, monthlyStats, recentFeedback] = await Promise.all([
            this.prisma.appointment.findMany({
                where: {
                    teacherId: teacher.id,
                    status: 'CONFIRMED',
                    scheduledAt: { gte: now },
                },
                include: {
                    student: { select: { firstName: true, lastName: true } },
                    subject: { select: { name: true } },
                },
                orderBy: { scheduledAt: 'asc' },
                take: 5,
            }),
            this.prisma.appointment.aggregate({
                where: {
                    teacherId: teacher.id,
                    status: 'COMPLETED',
                    scheduledAt: { gte: startOfMonth },
                },
                _count: { id: true },
                _sum: { teacherEarning: true },
            }),
            this.prisma.feedback.findMany({
                where: { teacherId: teacher.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    student: { select: { firstName: true } },
                    appointment: {
                        select: { subject: { select: { name: true } } },
                    },
                },
            }),
        ]);
        return {
            profile: {
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                isApproved: teacher.isApproved,
                hourlyRate: teacher.hourlyRate,
            },
            wallet: teacher.wallet
                ? {
                    availableBalance: teacher.wallet.availableBalance,
                    pendingBalance: teacher.wallet.pendingBalance,
                    totalEarned: teacher.wallet.totalEarned,
                }
                : null,
            upcomingLessons: upcomingLessons.map((l) => ({
                id: l.id,
                studentName: `${l.student.firstName} ${l.student.lastName.charAt(0)}.`,
                subject: l.subject.name,
                scheduledAt: l.scheduledAt,
                teamsJoinUrl: l.teamsJoinUrl,
            })),
            monthlyStats: {
                completedLessons: monthlyStats._count.id,
                earnings: monthlyStats._sum.teacherEarning || 0,
            },
            recentFeedback: recentFeedback.map((f) => ({
                studentName: f.student.firstName,
                subject: f.appointment.subject.name,
                rating: (f.comprehensionLevel + f.engagementLevel + f.participationLevel) / 3,
                date: f.createdAt,
            })),
        };
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map