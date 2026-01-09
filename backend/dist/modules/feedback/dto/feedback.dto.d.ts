export declare class CreateFeedbackDto {
    appointmentId: string;
    comprehensionLevel: number;
    engagementLevel: number;
    participationLevel: number;
    homeworkStatus?: string;
    topicsCovered: string[];
    improvementAreas: string[];
    areasForImprovement: string[];
    teacherNotes?: string;
}
export declare class FeedbackResponseDto {
    id: string;
    appointmentId: string;
    comprehensionLevel: number;
    engagementLevel: number;
    participationLevel: number;
}
