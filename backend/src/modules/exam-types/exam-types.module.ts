import { Module } from '@nestjs/common';
import { ExamTypesController } from './exam-types.controller';
import { ExamTypesService } from './exam-types.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExamTypesController],
  providers: [ExamTypesService],
  exports: [ExamTypesService],
})
export class ExamTypesModule {}
