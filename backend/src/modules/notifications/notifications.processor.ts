import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
@Processor("notifications")
export class NotificationsProcessor {
  @Process("send-email")
  async handleEmail(job: Job) {}
}