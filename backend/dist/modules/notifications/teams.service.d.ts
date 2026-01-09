import { ConfigService } from '@nestjs/config';
export interface TeamsMeetingDetails {
    meetingId: string;
    joinUrl: string;
    subject: string;
    startDateTime: string;
    endDateTime: string;
}
export declare class TeamsService {
    private configService;
    private readonly logger;
    private graphClient;
    private systemUserId;
    constructor(configService: ConfigService);
    private initializeClient;
    createMeeting(subject: string, startDateTime: Date, endDateTime: Date, teacherName: string, studentName: string): Promise<TeamsMeetingDetails>;
    getMeetingDetails(meetingId: string): Promise<TeamsMeetingDetails | null>;
    deleteMeeting(meetingId: string): Promise<boolean>;
    updateMeeting(meetingId: string, updates: {
        subject?: string;
        startDateTime?: Date;
        endDateTime?: Date;
    }): Promise<TeamsMeetingDetails | null>;
}
