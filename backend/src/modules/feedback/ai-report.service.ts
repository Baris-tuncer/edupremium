// ============================================================================
// AI REPORT SERVICE (Claude API Integration)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface FeedbackData {
  studentName: string;
  gradeLevel: number;
  subjectName: string;
  lessonDate: string;
  teacherName: string;
  comprehensionLevel: number; // 1-5
  engagementLevel: number; // 1-5
  participationLevel: number; // 1-5
  homeworkStatus: 'NOT_ASSIGNED' | 'NOT_DONE' | 'PARTIALLY_DONE' | 'FULLY_DONE';
  topicsCovered: string[];
  teacherNotes?: string;
  areasForImprovement?: string[];
}

@Injectable()
export class AiReportService {
  private readonly logger = new Logger(AiReportService.name);
  private anthropic: Anthropic;
  private modelId: string;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
    this.modelId = this.configService.get<string>('AI_MODEL', 'claude-3-opus-20240229');
  }

  // ========================================
  // GENERATE PARENT REPORT
  // ========================================
  async generateParentReport(feedback: FeedbackData): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(feedback);

    try {
      const response = await this.anthropic.messages.create({
        model: this.modelId,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract text from response
      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from AI');
      }

      this.logger.log(`AI report generated for student: ${feedback.studentName}`);
      return textBlock.text;
    } catch (error) {
      this.logger.error('Failed to generate AI report', error);
      throw error;
    }
  }

  // ========================================
  // SYSTEM PROMPT
  // ========================================
  private buildSystemPrompt(): string {
    return `Sen deneyimli bir eğitim danışmanısın. Görevin, öğretmenlerden aldığın ders değerlendirmelerini velilere yönelik profesyonel ve yapıcı raporlara dönüştürmek.

KURALLAR:
1. Rapor 150-250 kelime arasında olmalı
2. Resmi ama sıcak bir dil kullan
3. Her zaman olumlu ve yapıcı bir ton benimse
4. Öğrencinin güçlü yönlerini vurgula
5. Gelişim alanlarını motive edici bir şekilde sun
6. Somut öneriler ver
7. Türkçe yaz

YAPI:
- Genel Değerlendirme (1 paragraf)
- İşlenen Konular ve Kazanımlar (1 paragraf)
- Gelişim Alanları ve Öneriler (1 paragraf)
- Motive Edici Kapanış (1-2 cümle)

DEĞERLENDİRME ÖLÇEĞİ:
1 = Çok düşük, 2 = Düşük, 3 = Orta, 4 = İyi, 5 = Mükemmel`;
  }

  // ========================================
  // USER PROMPT
  // ========================================
  private buildUserPrompt(feedback: FeedbackData): string {
    const homeworkStatusMap = {
      NOT_ASSIGNED: 'Ödev verilmedi',
      NOT_DONE: 'Ödev yapılmadı',
      PARTIALLY_DONE: 'Ödev kısmen yapıldı',
      FULLY_DONE: 'Ödev tam olarak yapıldı',
    };

    return `Aşağıdaki bilgilere dayanarak bir veli raporu oluştur:

ÖĞRENCİ BİLGİLERİ:
- İsim: ${feedback.studentName}
- Sınıf: ${feedback.gradeLevel}. sınıf
- Ders: ${feedback.subjectName}
- Tarih: ${feedback.lessonDate}
- Öğretmen: ${feedback.teacherName}

ÖĞRETMEN DEĞERLENDİRMESİ:
- Konuyu Anlama Düzeyi: ${feedback.comprehensionLevel}/5
- Derse Katılım: ${feedback.engagementLevel}/5
- Aktif Katılım: ${feedback.participationLevel}/5
- Ödev Durumu: ${homeworkStatusMap[feedback.homeworkStatus]}

İŞLENEN KONULAR:
${feedback.topicsCovered.map((topic) => `- ${topic}`).join('\n')}

${feedback.teacherNotes ? `ÖĞRETMEN NOTLARI:\n${feedback.teacherNotes}` : ''}

${feedback.areasForImprovement?.length ? `GELİŞİM ALANLARI:\n${feedback.areasForImprovement.map((area) => `- ${area}`).join('\n')}` : ''}

Lütfen bu bilgilere dayanarak kapsamlı ve profesyonel bir veli raporu oluştur.`;
  }

  // ========================================
  // GENERATE SUMMARY (For multiple lessons)
  // ========================================
  async generateWeeklySummary(
    studentName: string,
    lessonCount: number,
    feedbacks: FeedbackData[],
  ): Promise<string> {
    const avgComprehension = feedbacks.reduce((sum, f) => sum + f.comprehensionLevel, 0) / lessonCount;
    const avgEngagement = feedbacks.reduce((sum, f) => sum + f.engagementLevel, 0) / lessonCount;
    const avgParticipation = feedbacks.reduce((sum, f) => sum + f.participationLevel, 0) / lessonCount;

    const allTopics = [...new Set(feedbacks.flatMap((f) => f.topicsCovered))];
    const subjects = [...new Set(feedbacks.map((f) => f.subjectName))];

    const prompt = `${studentName} isimli öğrenci için haftalık özet rapor oluştur.

Bu hafta ${lessonCount} ders işlendi.
Dersler: ${subjects.join(', ')}

ORTALAMA DEĞERLENDİRME:
- Anlama: ${avgComprehension.toFixed(1)}/5
- Katılım: ${avgEngagement.toFixed(1)}/5
- Aktif Katılım: ${avgParticipation.toFixed(1)}/5

İŞLENEN TÜM KONULAR:
${allTopics.join(', ')}

Kısa (100-150 kelime) ve özlü bir haftalık değerlendirme yaz.`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.modelId,
        max_tokens: 512,
        system: 'Sen bir eğitim danışmanısın. Öğrencilerin haftalık performansını özetleyen kısa raporlar yazıyorsun. Türkçe yaz, pozitif ve motive edici ol.',
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      return textBlock?.type === 'text' ? textBlock.text : '';
    } catch (error) {
      this.logger.error('Failed to generate weekly summary', error);
      throw error;
    }
  }
}
