import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TeachersController } from './teachers.controller';
import { TeacherAvailabilityController } from './availability.controller';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/auth.guard';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [TeachersController, TeacherAvailabilityController],
  providers: [TeachersService, JwtAuthGuard, RolesGuard],
  exports: [TeachersService],
})
export class TeachersModule {}
