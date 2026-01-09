import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.module';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class AppointmentsProcessor {
    private prisma;
    private eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    handleBankTransferExpiration(job: Job<{
        appointmentId: string;
    }>): Promise<void>;
    handleReminder(job: Job<{
        appointmentId: string;
        type: string;
    }>): Promise<void>;
    handleAutoComplete(job: Job<{
        appointmentId: string;
    }>): Promise<void>;
}
