import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private configService;
    private readonly logger;
    private userCode;
    private password;
    private header;
    private baseUrl;
    constructor(configService: ConfigService);
    sendSms(phone: string, message: string): Promise<boolean>;
    sendAppointmentConfirmation(phone: string, data: {
        teacherName: string;
        subjectName: string;
        scheduledAt: string;
    }): Promise<boolean>;
    sendLessonReminder(phone: string, data: {
        subjectName: string;
        scheduledAt: string;
        reminderType: 'morning' | 'hour-before';
    }): Promise<boolean>;
    sendParentNotification(phone: string, studentName: string, message: string): Promise<boolean>;
    sendBankTransferReminder(phone: string, data: {
        orderCode: string;
        deadline: string;
    }): Promise<boolean>;
}
