// ============================================================================
// HEALTH CONTROLLER
// ============================================================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.module';
import { Public } from './common/guards/auth.guard';

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

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check(): Promise<HealthStatus> {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Root endpoint' })
  root(): { message: string; docs: string } {
    return {
      message: 'Premium EdTech Platform API',
      docs: '/docs',
    };
  }
}
