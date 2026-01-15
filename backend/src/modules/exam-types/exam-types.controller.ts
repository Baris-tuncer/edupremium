import { Controller, Get } from '@nestjs/common';
import { ExamTypesService } from './exam-types.service';

@Controller('exam-types')
export class ExamTypesController {
  constructor(private readonly examTypesService: ExamTypesService) {}

  @Get()
  async findAll() {
    return this.examTypesService.findAll();
  }
}
