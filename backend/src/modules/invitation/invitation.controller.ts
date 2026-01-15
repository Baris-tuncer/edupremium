import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InvitationStatus } from '@prisma/client';

@Controller('admin/invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  // Yeni davet kodu oluştur
  @Post()
  async createInvitation(
    @Body()
    body: {
      email?: string;
      phone?: string;
      expiresInDays?: number;
    },
    @Request() req,
  ) {
    return this.invitationService.createInvitationCode({
      ...body,
      createdById: req.user.userId,
    });
  }

  // Tüm davet kodlarını listele
  @Get()
  async getAllInvitations(
    @Query('status') status?: InvitationStatus,
    @Query('createdById') createdById?: string,
  ) {
    return this.invitationService.getAllInvitations({
      status,
      createdById,
    });
  }

  // Tek davet kodunu getir
  @Get(':id')
  async getInvitation(@Param('id') id: string) {
    return this.invitationService.getInvitationById(id);
  }

  // SMS gönder
  @Post(':id/send-sms')
  async sendSMS(@Param('id') id: string) {
    return this.invitationService.sendSMS(id);
  }

  // Email gönder
  @Post(':id/send-email')
  async sendEmail(@Param('id') id: string) {
    return this.invitationService.sendEmail(id);
  }

  // Davet kodunu iptal et
  @Delete(':id')
  async revokeInvitation(@Param('id') id: string) {
    return this.invitationService.revokeInvitation(id);
  }

  // Süresi dolmuş kodları temizle
  @Post('expire-old')
  async expireOldCodes() {
    return this.invitationService.expireOldCodes();
  }
}
