import { Module } from '@nestjs/common';
import { BranchesController, SubjectsController } from './branches.controller';

@Module({
  controllers: [BranchesController, SubjectsController],
})
export class BranchesModule {}
