// ============================================================================
// FEEDBACK CONTROLLER - Değerlendirme ve AI Rapor
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';
import { ConfigService } from '@nestjs/config';

interface CreateFeedbackDto {
  comprehensionLevel: number;
  engagementLevel: number;
  participationLevel: number;
  homeworkStatus?: string;
  topicsCovered: string[];
  improvementAreas: string[];
  teacherNotes?: string;
}

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // Değerlendirme kaydet
  @Post(':appointmentId')
  async createFeedback(
    @Param('appointmentId') appointmentId: string,
    @Body() dto: CreateFeedbackDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;

    // Öğretmeni bul
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    // Randevuyu kontrol et
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { student: true },
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    if (appointment.teacherId !== teacher.id) {
      throw new BadRequestException('You are not authorized to provide feedback for this appointment');
    }

    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('Feedback can only be provided for completed appointments');
    }

    // Mevcut feedback var mı kontrol et
    const existingFeedback = await this.prisma.feedback.findUnique({
      where: { appointmentId },
    });

    if (existingFeedback) {
      // Güncelle
      const updated = await this.prisma.feedback.update({
        where: { appointmentId },
        data: {
          comprehensionLevel: dto.comprehensionLevel,
          engagementLevel: dto.engagementLevel,
          participationLevel: dto.participationLevel,
          homeworkStatus: dto.homeworkStatus,
          topicsCovered: dto.topicsCovered,
          improvementAreas: dto.improvementAreas,
          areasForImprovement: dto.improvementAreas,
          teacherNotes: dto.teacherNotes,
        },
      });

      return {
        success: true,
        data: updated,
      };
    }

    // Yeni feedback oluştur
    const feedback = await this.prisma.feedback.create({
      data: {
        appointmentId,
        teacherId: teacher.id,
        studentId: appointment.studentId,
        comprehensionLevel: dto.comprehensionLevel,
        engagementLevel: dto.engagementLevel,
        participationLevel: dto.participationLevel,
        homeworkStatus: dto.homeworkStatus,
        topicsCovered: dto.topicsCovered,
        improvementAreas: dto.improvementAreas,
        areasForImprovement: dto.improvementAreas,
        teacherNotes: dto.teacherNotes,
      },
    });

    return {
      success: true,
      data: feedback,
    };
  }

  // AI Rapor oluştur
  @Post(':appointmentId/generate-report')
  async generateAIReport(
    @Param('appointmentId') appointmentId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;

    // Öğretmeni bul
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    // Feedback'i bul
    const feedback = await this.prisma.feedback.findUnique({
      where: { appointmentId },
      include: {
        student: true,
        appointment: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new BadRequestException('Feedback not found. Please submit feedback first.');
    }

    if (feedback.teacherId !== teacher.id) {
      throw new BadRequestException('You are not authorized to generate report for this feedback');
    }

    // AI Rapor oluştur
    const report = await this.generateReport(feedback);

    // Raporu kaydet
    await this.prisma.feedback.update({
      where: { appointmentId },
      data: {
        aiGeneratedReport: report,
        aiReportGeneratedAt: new Date(),
      },
    });

    return {
      success: true,
      data: { report },
    };
  }

  // AI Rapor oluşturma fonksiyonu
  private async generateReport(feedback: any): Promise<string> {
    const levelLabels = ['Çok Düşük', 'Düşük', 'Orta', 'İyi', 'Çok İyi'];
    
    const studentName = `${feedback.student.firstName} ${feedback.student.lastName}`;
    const subjectName = feedback.appointment?.subject?.name || 'Ders';
    const comprehension = levelLabels[feedback.comprehensionLevel - 1] || 'Orta';
    const engagement = levelLabels[feedback.engagementLevel - 1] || 'Orta';
    const participation = levelLabels[feedback.participationLevel - 1] || 'Orta';
    
    const topicsList = feedback.topicsCovered?.length > 0 
      ? feedback.topicsCovered.join(', ') 
      : 'Belirtilmemiş';
    
    const improvementList = feedback.improvementAreas?.length > 0 
      ? feedback.improvementAreas.join(', ') 
      : 'Belirtilmemiş';

    const homeworkStatus = {
      NOT_ASSIGNED: 'Ödev verilmedi',
      COMPLETED: 'Ödev tamamlandı',
      PARTIAL: 'Ödev kısmen tamamlandı',
      NOT_COMPLETED: 'Ödev tamamlanmadı',
    }[feedback.homeworkStatus || 'NOT_ASSIGNED'];

    // Basit şablon bazlı rapor (gerçek uygulamada OpenAI API kullanılabilir)
    let report = `📊 DERS DEĞERLENDİRME RAPORU

👤 Öğrenci: ${studentName}
📚 Ders: ${subjectName}
📅 Tarih: ${new Date(feedback.createdAt).toLocaleDateString('tr-TR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PERFORMANS ÖZETİ

• Anlama Seviyesi: ${comprehension}
• İlgi/Motivasyon: ${engagement}
• Katılım: ${participation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 İŞLENEN KONULAR
${topicsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 GELİŞTİRİLMESİ GEREKEN ALANLAR
${improvementList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ÖDEV DURUMU
${homeworkStatus}

`;

    // Öğretmen notları varsa ekle
    if (feedback.teacherNotes) {
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 ÖĞRETMEN NOTLARI
${feedback.teacherNotes}

`;
    }

    // Genel değerlendirme
    const avgScore = (feedback.comprehensionLevel + feedback.engagementLevel + feedback.participationLevel) / 3;
    let generalAssessment = '';
    
    if (avgScore >= 4) {
      generalAssessment = `🌟 ${studentName} bu derste mükemmel bir performans sergilemiştir. Konulara olan ilgisi ve aktif katılımı dikkat çekicidir. Bu motivasyonun devam etmesi için öğrenciyi teşvik etmenizi öneririz.`;
    } else if (avgScore >= 3) {
      generalAssessment = `✅ ${studentName} bu derste iyi bir performans göstermiştir. Belirtilen gelişim alanlarına odaklanarak daha da ilerleme kaydedebilir. Düzenli çalışma ve tekrar önerilir.`;
    } else if (avgScore >= 2) {
      generalAssessment = `⚠️ ${studentName}'in bu derste orta düzeyde bir performans sergilediği görülmektedir. Anlama ve katılım konularında ek destek faydalı olabilir. Evde düzenli tekrar yapması önerilir.`;
    } else {
      generalAssessment = `📌 ${studentName}'in bu derste bazı zorluklarla karşılaştığı gözlemlenmiştir. Temel konuların tekrar edilmesi ve ek çalışma materyalleri ile desteklenmesi önerilir. Öğrenci ile birebir çalışma faydalı olacaktır.`;
    }

    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 GENEL DEĞERLENDİRME
${generalAssessment}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bu rapor EduPremium platformu tarafından otomatik olarak oluşturulmuştur.
`;

    return report;
  }

  // Belirli bir feedback getir
  @Get(':appointmentId')
  async getFeedback(@Param('appointmentId') appointmentId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { appointmentId },
      include: {
        student: true,
        teacher: true,
        appointment: {
          include: { subject: true },
        },
      },
    });

    if (!feedback) {
      throw new BadRequestException('Feedback not found');
    }

    return {
      success: true,
      data: feedback,
    };
  }
}
