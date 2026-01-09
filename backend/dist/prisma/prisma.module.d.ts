import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    softDelete(model: string, where: object): Promise<any>;
    cleanExpiredSessions(): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findActiveOrThrow<T>(model: string, where: object): Promise<T>;
}
export declare class PrismaModule {
}
