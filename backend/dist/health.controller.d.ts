import { PrismaService } from './prisma/prisma.module';
interface HealthStatus {
    status: 'ok' | 'error';
    timestamp: string;
    uptime: number;
    services: {
        database: 'connected' | 'disconnected';
        redis?: 'connected' | 'disconnected';
    };
    version: string;
}
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    check(): Promise<HealthStatus>;
    root(): {
        message: string;
        docs: string;
    };
}
export {};
