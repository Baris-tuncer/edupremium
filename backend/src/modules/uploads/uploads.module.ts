import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UploadsController } from './uploads.controller';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [UploadsController],
  providers: [JwtAuthGuard],
})
export class UploadsModule {}
