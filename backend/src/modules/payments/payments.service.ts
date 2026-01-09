// ============================================================================
// PAYMENTS SERVICE
// ============================================================================

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.module';
import { IyzicoService } from './iyzico.service';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import {
  InitiatePaymentDto,
  PaymentCallbackDto,
  BankTransferApprovalDto,
} from './dto/payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private iyzicoService: IyzicoService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ========================================
  // INITIATE CREDIT CARD PAYMENT
  // ========================================
  async initiateIyzicoPayment(
    appointmentId: string,
    userId: string,
    clientIp: string,
  ): Promise<{ checkoutFormContent: string; token: string }> {
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
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.student.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    if (appointment.paymentMethod !== PaymentMethod.CREDIT_CARD) {
      throw new BadRequestException('Payment method is not credit card');
    }

    if (appointment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already completed');
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
      throw new BadRequestException(result.errorMessage || 'Payment initialization failed');
    }

    // Store token for callback verification
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        iyzicoConversationId: appointment.orderCode,
      },
    });

    return {
      checkoutFormContent: result.checkoutFormContent!,
      token: result.token!,
    };
  }

  // ========================================
  // PROCESS IYZICO CALLBACK
  // ========================================
  async processIyzicoCallback(token: string): Promise<{ success: boolean; appointmentId: string }> {
    const result = await this.iyzicoService.retrievePaymentResult(token);

    // Find appointment by conversation ID
    const appointment = await this.prisma.appointment.findFirst({
      where: { iyzicoConversationId: result.conversationId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (result.status === 'failure') {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      
      return { success: false, appointmentId: appointment.id };
    }

    // Update payment status
    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        iyzicoPaymentId: result.paymentId,
      },
    });

    // Emit event to confirm appointment (creates Teams meeting, sends notifications)
    this.eventEmitter.emit('payment.completed', {
      appointmentId: appointment.id,
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });

    return { success: true, appointmentId: appointment.id };
  }

  // ========================================
  // GET BANK TRANSFER INFO
  // ========================================
  async getBankTransferInfo(appointmentId: string, userId: string): Promise<any> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        student: { select: { userId: true } },
      },
    });

    if (!appointment || appointment.student.userId !== userId) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException('Payment method is not bank transfer');
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

  // ========================================
  // CONFIRM BANK TRANSFER PAYMENT (Student)
  // ========================================
  async confirmBankTransfer(appointmentId: string, userId: string): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        student: { select: { userId: true } },
      },
    });

    if (!appointment || appointment.student.userId !== userId) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException('Payment method is not bank transfer');
    }

    // Notify admin about pending bank transfer
    this.eventEmitter.emit('bank-transfer.pending', {
      appointmentId: appointment.id,
      orderCode: appointment.orderCode,
      amount: appointment.paymentAmount,
    });

    return { message: 'Payment confirmation received. Awaiting admin verification.' };
  }

  // ========================================
  // UPLOAD RECEIPT (Student)
  // ========================================
  async uploadReceipt(
    appointmentId: string,
    userId: string,
    receiptUrl: string,
  ): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        student: { select: { userId: true } },
      },
    });

    if (!appointment || appointment.student.userId !== userId) {
      throw new NotFoundException('Appointment not found');
    }

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { bankTransferReceiptUrl: receiptUrl },
    });

    // Notify admin
    this.eventEmitter.emit('bank-transfer.receipt-uploaded', {
      appointmentId,
      receiptUrl,
    });

    return { message: 'Receipt uploaded successfully.' };
  }

  // ========================================
  // APPROVE BANK TRANSFER (Admin)
  // ========================================
  async approveBankTransfer(
    appointmentId: string,
    adminUserId: string,
  ): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException('Payment method is not bank transfer');
    }

    if (appointment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already approved');
    }

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });

    // Emit event to confirm appointment
    this.eventEmitter.emit('payment.completed', {
      appointmentId,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
    });

    return { message: 'Bank transfer approved successfully.' };
  }

  // ========================================
  // REJECT BANK TRANSFER (Admin)
  // ========================================
  async rejectBankTransfer(
    appointmentId: string,
    adminUserId: string,
    reason: string,
  ): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        status: 'CANCELLED',
        cancelReason: reason,
        cancelledById: adminUserId,
        cancelledAt: new Date(),
      },
    });

    // Notify student
    this.eventEmitter.emit('bank-transfer.rejected', {
      appointmentId,
      reason,
    });

    return { message: 'Bank transfer rejected.' };
  }

  // ========================================
  // PROCESS REFUND
  // ========================================
  async processRefund(
    appointmentId: string,
    adminUserId: string,
  ): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Cannot refund unpaid appointment');
    }

    // For credit card, call Iyzico refund
    if (appointment.paymentMethod === PaymentMethod.CREDIT_CARD && appointment.iyzicoPaymentId) {
      await this.iyzicoService.refundPayment(
        appointment.iyzicoPaymentId,
        appointment.paymentAmount.toNumber(),
        appointment.orderCode,
      );
    }

    // Update status
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });

    return { message: 'Refund processed successfully.' };
  }
}
