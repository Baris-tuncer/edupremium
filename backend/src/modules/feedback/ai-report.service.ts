// ============================================================================
// AI REPORT SERVICE - Mock Version (No Anthropic dependency)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FeedbackData {
  studentName: string;
  teacherName: string;
  subjectName: string;
  lessonDate: string;
  comprehensionLevel: number;
  engagementLevel: number;
  participationLevel: number;
  homeworkStatus?: string;
  topicsCovered?: string[];
  teacherNotes?: string;
  areasForImprovement?: string[];
}

@Injectable()
export class AiReportService {
  private readonly logger = new Logger(AiReportService.name);

  constructor(private configService: ConfigService) {}

  async generateReport(data: FeedbackData): Promise<string> {
    this.logger.log(`Generating report for ${data.studentName}`);

    const avgLevel = (
      (data.comprehensionLevel + data.engagementLevel + data.participationLevel) / 3
    ).toFixed(1);

    return `
# Ders Değerlendirme Raporu

## Öğrenci: ${data.studentName}
## Öğretmen: ${data.teacherName}
## Ders: ${data.subjectName}
## Tarih: ${data.lessonDate}

### Performans
- Anlama: ${data.comprehensionLevel}/5
- Katılım: ${data.engagementLevel}/5
- Aktiflik: ${data.participationLevel}/5
- Ortalama: ${avgLevel}/5

### Konular
${data.topicsCovered?.join(', ') || 'Belirtilmedi'}

### Notlar
${data.teacherNotes || 'Not yok'}
    `.trim();
  }
}
