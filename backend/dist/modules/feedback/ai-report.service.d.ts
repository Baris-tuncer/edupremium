import { ConfigService } from '@nestjs/config';
export interface FeedbackData {
    studentName: string;
    gradeLevel: number;
    subjectName: string;
    lessonDate: string;
    teacherName: string;
    comprehensionLevel: number;
    engagementLevel: number;
    participationLevel: number;
    homeworkStatus: 'NOT_ASSIGNED' | 'NOT_DONE' | 'PARTIALLY_DONE' | 'FULLY_DONE';
    topicsCovered: string[];
    teacherNotes?: string;
    areasForImprovement?: string[];
}
export declare class AiReportService {
    private configService;
    private readonly logger;
    private anthropic;
    private modelId;
    constructor(configService: ConfigService);
    generateParentReport(feedback: FeedbackData): Promise<string>;
    private buildSystemPrompt;
    private buildUserPrompt;
    generateWeeklySummary(studentName: string, lessonCount: number, feedbacks: FeedbackData[]): Promise<string>;
}
