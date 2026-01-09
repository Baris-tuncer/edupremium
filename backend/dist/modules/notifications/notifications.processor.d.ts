import { Job } from "bull";
export declare class NotificationsProcessor {
    handleEmail(job: Job): Promise<void>;
}
