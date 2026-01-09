import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { TeamsService } from './teams.service';
import { PrismaService } from '../../prisma/prisma.module';
export declare class NotificationsListener {
    private emailService;
    private smsService;
    private teamsService;
    private prisma;
    private readonly logger;
    constructor(emailService: EmailService, smsService: SmsService, teamsService: TeamsService, prisma: PrismaService);
    handleAppointmentCreated(payload: {
        appointmentId: string;
        studentId: string;
        teacherId: string;
        paymentMethod: string;
    }): Promise<void>;
    handleAppointmentConfirmed(payload: {
        appointmentId: string;
        teacherId: string;
        studentId: string;
        scheduledAt: Date;
        subjectName?: string;
    }): Promise<void>;
    handleAppointmentCancelled(payload: {
        appointmentId: string;
        cancelledBy: string;
        paymentStatus: string;
        paymentAmount: any;
    }): Promise<void>;
    handleAppointmentCompleted(payload: {
        appointmentId: string;
        teacherId: string;
        studentId: string;
        teacherEarning: any;
    }): Promise<void>;
    handleTeacherApproved(payload: {
        teacherId: string;
        email: string;
        firstName: string;
    }): Promise<void>;
    handleSendReminder(payload: {
        appointmentId: string;
        type: string;
        teacherEmail: string;
        teacherPhone?: string;
        studentEmail: string;
        studentPhone?: string;
        scheduledAt: Date;
        subjectName: string;
        teamsJoinUrl?: string;
    }): Promise<void>;
}
