import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class ExamTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const examTypes = await this.prisma.examType.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: examTypes };
  }
}
