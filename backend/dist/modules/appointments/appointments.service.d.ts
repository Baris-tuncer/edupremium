import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.module';
import { CreateAppointmentDto, AppointmentResponseDto, AppointmentListQueryDto, MarkNoShowDto } from './dto/appointments.dto';
import { PaginatedResponseDto } from '../../common/dto/common.dto';
export declare class AppointmentsService {
    private prisma;
    private configService;
    private eventEmitter;
    private appointmentsQueue;
    constructor(prisma: PrismaService, configService: ConfigService, eventEmitter: EventEmitter2, appointmentsQueue: Queue);
    createAppointment(studentUserId: string, dto: CreateAppointmentDto): Promise<AppointmentResponseDto>;
    getAppointmentById(id: string, userId: string, userRole: string): Promise<AppointmentResponseDto>;
    listAppointments(userId: string, userRole: string, query: AppointmentListQueryDto): Promise<PaginatedResponseDto<AppointmentResponseDto>>;
    confirmAppointment(id: string): Promise<AppointmentResponseDto>;
    cancelAppointment(id: string, userId: string, reason?: string): Promise<AppointmentResponseDto>;
    markLessonStarted(id: string, teacherUserId: string): Promise<AppointmentResponseDto>;
    markNoShow(id: string, teacherUserId: string, dto: MarkNoShowDto): Promise<AppointmentResponseDto>;
    completeAppointment(id: string): Promise<AppointmentResponseDto>;
    private checkTeacherAvailability;
    private generateOrderCode;
    private scheduleReminders;
    private mapToResponseDto;
}
