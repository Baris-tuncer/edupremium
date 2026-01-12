import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { WalletController } from './wallet.controller';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [WalletController],
  providers: [JwtAuthGuard],
})
export class WalletModule {}
