import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.module';
import { AiReportService } from './ai-report.service';
import { CreateFeedbackDto, FeedbackResponseDto } from './dto/feedback.dto';
export declare class FeedbackService {
    private prisma;
    private aiReportService;
    private eventEmitter;
    constructor(prisma: PrismaService, aiReportService: AiReportService, eventEmitter: EventEmitter2);
    createFeedback(teacherUserId: string, dto: CreateFeedbackDto): Promise<FeedbackResponseDto>;
    generateAndSendAiReport(feedbackId: string): Promise<void>;
    getFeedbackById(id: string, userId: string, userRole: string): Promise<FeedbackResponseDto>;
    listStudentFeedbacks(studentUserId: string, page?: number, limit?: number): Promise<{
        data: FeedbackResponseDto[];
        total: number;
    }>;
    resendReportToParent(feedbackId: string): Promise<{
        message: string;
    }>;
    private mapToResponseDto;
}
