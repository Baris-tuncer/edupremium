import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.module';
import { IyzicoService } from './iyzico.service';
export declare class PaymentsService {
    private prisma;
    private configService;
    private iyzicoService;
    private eventEmitter;
    constructor(prisma: PrismaService, configService: ConfigService, iyzicoService: IyzicoService, eventEmitter: EventEmitter2);
    initiateIyzicoPayment(appointmentId: string, userId: string, clientIp: string): Promise<{
        checkoutFormContent: string;
        token: string;
    }>;
    processIyzicoCallback(token: string): Promise<{
        success: boolean;
        appointmentId: string;
    }>;
    getBankTransferInfo(appointmentId: string, userId: string): Promise<any>;
    confirmBankTransfer(appointmentId: string, userId: string): Promise<{
        message: string;
    }>;
    uploadReceipt(appointmentId: string, userId: string, receiptUrl: string): Promise<{
        message: string;
    }>;
    approveBankTransfer(appointmentId: string, adminUserId: string): Promise<{
        message: string;
    }>;
    rejectBankTransfer(appointmentId: string, adminUserId: string, reason: string): Promise<{
        message: string;
    }>;
    processRefund(appointmentId: string, adminUserId: string): Promise<{
        message: string;
    }>;
}
