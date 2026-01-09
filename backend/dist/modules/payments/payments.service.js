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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_module_1 = require("../../prisma/prisma.module");
const iyzico_service_1 = require("./iyzico.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    constructor(prisma, configService, iyzicoService, eventEmitter) {
        this.prisma = prisma;
        this.configService = configService;
        this.iyzicoService = iyzicoService;
        this.eventEmitter = eventEmitter;
    }
    async initiateIyzicoPayment(appointmentId, userId, clientIp) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                student: {
                    include: { user: true },
                },
                teacher: true,
                subject: true,
            },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.student.userId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        if (appointment.paymentMethod !== client_1.PaymentMethod.CREDIT_CARD) {
            throw new common_1.BadRequestException('Payment method is not credit card');
        }
        if (appointment.paymentStatus === client_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Payment already completed');
        }
        const callbackUrl = `${this.configService.get('PLATFORM_URL')}/api/v1/payments/iyzico/callback`;
        const result = await this.iyzicoService.initializePayment({
            conversationId: appointment.orderCode,
            price: appointment.paymentAmount.toNumber(),
            paidPrice: appointment.paymentAmount.toNumber(),
            currency: 'TRY',
            basketId: appointment.id,
            paymentGroup: 'PRODUCT',
            callbackUrl,
            buyer: {
                id: appointment.student.id,
                name: appointment.student.firstName,
                surname: appointment.student.lastName,
                email: appointment.student.user.email,
                gsmNumber: appointment.student.user.phone || undefined,
                identityNumber: '11111111111',
                registrationAddress: 'Türkiye',
                ip: clientIp,
                city: 'Istanbul',
                country: 'Turkey',
            },
            billingAddress: {
                contactName: `${appointment.student.firstName} ${appointment.student.lastName}`,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Türkiye',
            },
            basketItems: [
                {
                    id: appointment.id,
                    name: `${appointment.subject.name} Dersi - ${appointment.teacher.firstName} ${appointment.teacher.lastName}`,
                    category1: 'Online Ders',
                    itemType: 'VIRTUAL',
                    price: appointment.paymentAmount.toNumber(),
                },
            ],
        });
        if (result.status === 'failure') {
            throw new common_1.BadRequestException(result.errorMessage || 'Payment initialization failed');
        }
        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                iyzicoConversationId: appointment.orderCode,
            },
        });
        return {
            checkoutFormContent: result.checkoutFormContent,
            token: result.token,
        };
    }
    async processIyzicoCallback(token) {
        const result = await this.iyzicoService.retrievePaymentResult(token);
        const appointment = await this.prisma.appointment.findFirst({
            where: { iyzicoConversationId: result.conversationId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (result.status === 'failure') {
            await this.prisma.appointment.update({
                where: { id: appointment.id },
                data: { paymentStatus: client_1.PaymentStatus.FAILED },
            });
            return { success: false, appointmentId: appointment.id };
        }
        await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                paymentStatus: client_1.PaymentStatus.PAID,
                iyzicoPaymentId: result.paymentId,
            },
        });
        this.eventEmitter.emit('payment.completed', {
            appointmentId: appointment.id,
            paymentMethod: client_1.PaymentMethod.CREDIT_CARD,
        });
        return { success: true, appointmentId: appointment.id };
    }
    async getBankTransferInfo(appointmentId, userId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                student: { select: { userId: true } },
            },
        });
        if (!appointment || appointment.student.userId !== userId) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.paymentMethod !== client_1.PaymentMethod.BANK_TRANSFER) {
            throw new common_1.BadRequestException('Payment method is not bank transfer');
        }
        return {
            orderCode: appointment.orderCode,
            amount: appointment.paymentAmount.toNumber(),
            bankName: this.configService.get('PLATFORM_BANK_NAME'),
            iban: this.configService.get('PLATFORM_IBAN'),
            accountHolder: 'Premium EdTech Platform Ltd.',
            deadline: appointment.bankTransferDeadline?.toISOString(),
            instructions: `Lütfen havale/EFT açıklamasına sipariş kodunuzu (${appointment.orderCode}) yazmayı unutmayınız.`,
        };
    }
    async confirmBankTransfer(appointmentId, userId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                student: { select: { userId: true } },
            },
        });
        if (!appointment || appointment.student.userId !== userId) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.paymentMethod !== client_1.PaymentMethod.BANK_TRANSFER) {
            throw new common_1.BadRequestException('Payment method is not bank transfer');
        }
        this.eventEmitter.emit('bank-transfer.pending', {
            appointmentId: appointment.id,
            orderCode: appointment.orderCode,
            amount: appointment.paymentAmount,
        });
        return { message: 'Payment confirmation received. Awaiting admin verification.' };
    }
    async uploadReceipt(appointmentId, userId, receiptUrl) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                student: { select: { userId: true } },
            },
        });
        if (!appointment || appointment.student.userId !== userId) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { bankTransferReceiptUrl: receiptUrl },
        });
        this.eventEmitter.emit('bank-transfer.receipt-uploaded', {
            appointmentId,
            receiptUrl,
        });
        return { message: 'Receipt uploaded successfully.' };
    }
    async approveBankTransfer(appointmentId, adminUserId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.paymentMethod !== client_1.PaymentMethod.BANK_TRANSFER) {
            throw new common_1.BadRequestException('Payment method is not bank transfer');
        }
        if (appointment.paymentStatus === client_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Payment already approved');
        }
        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                paymentStatus: client_1.PaymentStatus.PAID,
                bankTransferApprovedById: adminUserId,
                bankTransferApprovedAt: new Date(),
            },
        });
        this.eventEmitter.emit('payment.completed', {
            appointmentId,
            paymentMethod: client_1.PaymentMethod.BANK_TRANSFER,
        });
        return { message: 'Bank transfer approved successfully.' };
    }
    async rejectBankTransfer(appointmentId, adminUserId, reason) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                paymentStatus: client_1.PaymentStatus.FAILED,
                status: 'CANCELLED',
                cancellationReason: reason,
                cancelledById: adminUserId,
                cancelledAt: new Date(),
            },
        });
        this.eventEmitter.emit('bank-transfer.rejected', {
            appointmentId,
            reason,
        });
        return { message: 'Bank transfer rejected.' };
    }
    async processRefund(appointmentId, adminUserId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.paymentStatus !== client_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Cannot refund unpaid appointment');
        }
        if (appointment.paymentMethod === client_1.PaymentMethod.CREDIT_CARD && appointment.iyzicoPaymentId) {
            await this.iyzicoService.refundPayment(appointment.iyzicoPaymentId, appointment.paymentAmount.toNumber(), appointment.orderCode);
        }
        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                paymentStatus: client_1.PaymentStatus.REFUNDED,
            },
        });
        return { message: 'Refund processed successfully.' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        config_1.ConfigService,
        iyzico_service_1.IyzicoService,
        event_emitter_1.EventEmitter2])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map