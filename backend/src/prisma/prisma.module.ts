// ============================================================================
// PRISMA MODULE & SERVICE
// ============================================================================

import { Global, Module, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Soft delete extension
  async softDelete(model: string, where: object) {
    return this[model].update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  // Clean expired sessions
  async cleanExpiredSessions() {
    return this.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  // Get active record (not soft-deleted)
  async findActiveOrThrow<T>(model: string, where: object): Promise<T> {
    const record = await this[model].findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
    });

    if (!record) {
      throw new Error(`${model} not found`);
    }

    return record as T;
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
