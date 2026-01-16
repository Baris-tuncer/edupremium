import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '../../common/guards/auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

// Varsayılan ayarlar
const DEFAULT_SETTINGS = {
  PLATFORM_COMMISSION_RATE: '20',
  TAX_RATE: '20',
  MIN_HOURLY_RATE: '100',
  MAX_HOURLY_RATE: '2000',
  DEFAULT_LESSON_DURATION: '60',
  CANCELLATION_HOURS: '24',
  PLATFORM_NAME: 'EduPremium',
  SUPPORT_EMAIL: 'destek@edupremium.com',
  SUPPORT_PHONE: '+90 850 123 4567',
};

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getSettings() {
    const configs = await this.prisma.systemConfig.findMany();
    
    // Mevcut ayarları map'e çevir
    const configMap: Record<string, string> = {};
    configs.forEach(c => {
      configMap[c.key] = c.value;
    });

    // Varsayılan değerlerle birleştir
    const settings = { ...DEFAULT_SETTINGS, ...configMap };

    // Entegrasyon durumlarını env'den kontrol et
    const integrations = {
      teams: {
        configured: !!(process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID),
        name: 'Microsoft Teams',
        description: 'Online ders görüşmeleri için',
      },
      paratika: {
        configured: !!(process.env.PARATIKA_MERCHANT_ID && process.env.PARATIKA_API_KEY),
        name: 'Paratika',
        description: 'Ödeme altyapısı',
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        name: 'Resend',
        description: 'Email servisi',
      },
      netgsm: {
        configured: !!(process.env.NETGSM_USERNAME && process.env.NETGSM_PASSWORD),
        name: 'Netgsm',
        description: 'SMS servisi',
      },
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        name: 'OpenAI',
        description: 'AI rapor oluşturma',
      },
    };

    return {
      success: true,
      data: {
        pricing: {
          platformCommissionRate: parseFloat(settings.PLATFORM_COMMISSION_RATE),
          taxRate: parseFloat(settings.TAX_RATE),
          minHourlyRate: parseFloat(settings.MIN_HOURLY_RATE),
          maxHourlyRate: parseFloat(settings.MAX_HOURLY_RATE),
          defaultLessonDuration: parseInt(settings.DEFAULT_LESSON_DURATION),
          cancellationHours: parseInt(settings.CANCELLATION_HOURS),
        },
        general: {
          platformName: settings.PLATFORM_NAME,
          supportEmail: settings.SUPPORT_EMAIL,
          supportPhone: settings.SUPPORT_PHONE,
        },
        integrations,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Put()
  async updateSettings(@Body() body: Record<string, any>) {
    const updates: { key: string; value: string }[] = [];

    // Pricing ayarları
    if (body.pricing) {
      if (body.pricing.platformCommissionRate !== undefined) {
        updates.push({ key: 'PLATFORM_COMMISSION_RATE', value: String(body.pricing.platformCommissionRate) });
      }
      if (body.pricing.taxRate !== undefined) {
        updates.push({ key: 'TAX_RATE', value: String(body.pricing.taxRate) });
      }
      if (body.pricing.minHourlyRate !== undefined) {
        updates.push({ key: 'MIN_HOURLY_RATE', value: String(body.pricing.minHourlyRate) });
      }
      if (body.pricing.maxHourlyRate !== undefined) {
        updates.push({ key: 'MAX_HOURLY_RATE', value: String(body.pricing.maxHourlyRate) });
      }
      if (body.pricing.defaultLessonDuration !== undefined) {
        updates.push({ key: 'DEFAULT_LESSON_DURATION', value: String(body.pricing.defaultLessonDuration) });
      }
      if (body.pricing.cancellationHours !== undefined) {
        updates.push({ key: 'CANCELLATION_HOURS', value: String(body.pricing.cancellationHours) });
      }
    }

    // General ayarları
    if (body.general) {
      if (body.general.platformName !== undefined) {
        updates.push({ key: 'PLATFORM_NAME', value: body.general.platformName });
      }
      if (body.general.supportEmail !== undefined) {
        updates.push({ key: 'SUPPORT_EMAIL', value: body.general.supportEmail });
      }
      if (body.general.supportPhone !== undefined) {
        updates.push({ key: 'SUPPORT_PHONE', value: body.general.supportPhone });
      }
    }

    // Upsert işlemi
    for (const update of updates) {
      await this.prisma.systemConfig.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: { key: update.key, value: update.value },
      });
    }

    return {
      success: true,
      message: 'Ayarlar güncellendi',
      updatedKeys: updates.map(u => u.key),
      timestamp: new Date().toISOString(),
    };
  }

  // Fiyat hesaplama endpoint'i - Frontend için
  @Get('calculate-price')
  async calculatePrice() {
    const commissionConfig = await this.prisma.systemConfig.findUnique({
      where: { key: 'PLATFORM_COMMISSION_RATE' },
    });
    const taxConfig = await this.prisma.systemConfig.findUnique({
      where: { key: 'TAX_RATE' },
    });

    const commissionRate = commissionConfig ? parseFloat(commissionConfig.value) : 20;
    const taxRate = taxConfig ? parseFloat(taxConfig.value) : 20;

    return {
      success: true,
      data: {
        commissionRate,
        taxRate,
        // Örnek hesaplama (1000 TL için)
        example: {
          teacherRate: 1000,
          commission: 1000 * (commissionRate / 100),
          subtotal: 1000 * (1 + commissionRate / 100),
          tax: 1000 * (1 + commissionRate / 100) * (taxRate / 100),
          totalPrice: 1000 * (1 + commissionRate / 100) * (1 + taxRate / 100),
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
