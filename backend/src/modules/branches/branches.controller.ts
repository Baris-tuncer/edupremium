import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Controller('branches')
export class BranchesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async listBranches() {
    const branches = await this.prisma.branch.findMany({ orderBy: { name: 'asc' } });
    return { success: true, data: branches };
  }
}

@Controller('subjects')
export class SubjectsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async listSubjects(@Query('branchId') branchId?: string) {
    const where = branchId ? { branchId } : {};
    const subjects = await this.prisma.subject.findMany({ where, orderBy: { name: 'asc' } });
    return { success: true, data: subjects };
  }
}
