import { FeedbackService } from "./feedback.service";
import { CreateFeedbackDto } from "./dto/feedback.dto";
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(dto: CreateFeedbackDto, req: any): Promise<any>;
    findOne(id: string, req: any): Promise<any>;
    generateReport(id: string): Promise<any>;
}
