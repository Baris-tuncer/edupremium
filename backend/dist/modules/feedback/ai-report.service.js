"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReportService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let AiReportService = AiReportService_1 = class AiReportService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AiReportService_1.name);
        this.anthropic = new sdk_1.default({
            apiKey: this.configService.get('ANTHROPIC_API_KEY'),
        });
        this.modelId = this.configService.get('AI_MODEL', 'claude-3-opus-20240229');
    }
    async generateParentReport(feedback) {
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
            const textBlock = response.content.find((block) => block.type === 'text');
            if (!textBlock || textBlock.type !== 'text') {
                throw new Error('No text response from AI');
            }
            this.logger.log(`AI report generated for student: ${feedback.studentName}`);
            return textBlock.text;
        }
        catch (error) {
            this.logger.error('Failed to generate AI report', error);
            throw error;
        }
    }
    buildSystemPrompt() {
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
    buildUserPrompt(feedback) {
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
    async generateWeeklySummary(studentName, lessonCount, feedbacks) {
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
        }
        catch (error) {
            this.logger.error('Failed to generate weekly summary', error);
            throw error;
        }
    }
};
exports.AiReportService = AiReportService;
exports.AiReportService = AiReportService = AiReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiReportService);
//# sourceMappingURL=ai-report.service.js.map