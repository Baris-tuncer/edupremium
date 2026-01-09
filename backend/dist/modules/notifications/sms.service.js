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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let SmsService = SmsService_1 = class SmsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SmsService_1.name);
        this.baseUrl = 'https://api.netgsm.com.tr/sms/send/get';
        this.userCode = this.configService.get('NETGSM_USER_CODE');
        this.password = this.configService.get('NETGSM_PASSWORD');
        this.header = this.configService.get('NETGSM_HEADER');
    }
    async sendSms(phone, message) {
        try {
            const formattedPhone = phone.replace(/^\+90/, '').replace(/\D/g, '');
            const params = new URLSearchParams({
                usercode: this.userCode,
                password: this.password,
                gsmno: formattedPhone,
                message: message,
                msgheader: this.header,
                dil: 'TR',
            });
            const response = await axios_1.default.get(`${this.baseUrl}?${params.toString()}`);
            const responseCode = response.data.toString().split(' ')[0];
            if (['00', '01', '02'].includes(responseCode)) {
                this.logger.log(`SMS sent to: ${formattedPhone}`);
                return true;
            }
            this.logger.warn(`SMS failed with code: ${responseCode}`);
            return false;
        }
        catch (error) {
            this.logger.error(`Failed to send SMS to ${phone}`, error);
            return false;
        }
    }
    async sendAppointmentConfirmation(phone, data) {
        const message = `Ders randevunuz onaylandi. ${data.subjectName} - ${data.teacherName}, ${data.scheduledAt}. Detaylar icin e-postanizi kontrol edin. - EdTech Platform`;
        return this.sendSms(phone, message);
    }
    async sendLessonReminder(phone, data) {
        const reminderText = data.reminderType === 'morning'
            ? 'Bugun bir dersiniz var'
            : 'Dersinize 1 saat kaldi';
        const message = `${reminderText}: ${data.subjectName}, ${data.scheduledAt}. Derse katilmak icin e-postanizdaki linki kullanin. - EdTech Platform`;
        return this.sendSms(phone, message);
    }
    async sendParentNotification(phone, studentName, message) {
        const smsMessage = `${studentName} icin bilgilendirme: ${message} - EdTech Platform`;
        return this.sendSms(phone, smsMessage);
    }
    async sendBankTransferReminder(phone, data) {
        const message = `Odeme hatirlatmasi: ${data.orderCode} kodlu randevunuz icin son odeme tarihi ${data.deadline}. Odeme yapilmazsa randevu iptal edilecektir. - EdTech Platform`;
        return this.sendSms(phone, message);
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map