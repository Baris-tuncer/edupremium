import { ConfigService } from '@nestjs/config';
export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    templateId?: string;
    dynamicTemplateData?: Record<string, any>;
}
export declare class EmailService {
    private configService;
    private readonly logger;
    private fromEmail;
    private fromName;
    constructor(configService: ConfigService);
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendAppointmentConfirmation(to: string, data: {
        studentName: string;
        teacherName: string;
        subjectName: string;
        scheduledAt: string;
        teamsJoinUrl: string;
        orderCode: string;
    }): Promise<boolean>;
    sendLessonReminder(to: string, data: {
        recipientName: string;
        teacherName: string;
        subjectName: string;
        scheduledAt: string;
        teamsJoinUrl: string;
        reminderType: 'morning' | 'hour-before';
    }): Promise<boolean>;
    sendParentReport(to: string, data: {
        parentName: string;
        studentName: string;
        subjectName: string;
        lessonDate: string;
        report: string;
    }): Promise<boolean>;
    sendBankTransferInfo(to: string, data: {
        studentName: string;
        orderCode: string;
        amount: number;
        bankName: string;
        iban: string;
        deadline: string;
    }): Promise<boolean>;
}
