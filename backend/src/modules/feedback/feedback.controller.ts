import { Controller, Post, Get, Body, Param, Request } from "@nestjs/common";
import { FeedbackService } from "./feedback.service";
import { CreateFeedbackDto } from "./dto/feedback.dto";
@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}
  @Post()
  async create(@Body() dto: CreateFeedbackDto, @Request() req: any) { return this.feedbackService.create(dto, req.user?.userId); }
  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: any) { return this.feedbackService.findById(id, req.user?.userId); }
  @Post(":id/generate-report")
  async generateReport(@Param("id") id: string) { return this.feedbackService.generateAIReport(id); }
}
