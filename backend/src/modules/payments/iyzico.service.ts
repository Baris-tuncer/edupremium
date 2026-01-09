// ============================================================================
// IYZICO SERVICE - Matches PaymentsService exactly
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PaymentResult {
  status: string;
  errorCode?: string;
  errorMessage?: string;
  paymentId?: string;
  conversationId?: string;
  price?: number;
  paidPrice?: number;
  fraudStatus?: number;
  checkoutFormContent?: string;
  token?: string;
}

@Injectable()
export class IyzicoService {
  private readonly logger = new Logger(IyzicoService.name);
  private iyzipay: any;

  constructor(private configService: ConfigService) {
    try {
      const Iyzipay = require('iyzipay');
      this.iyzipay = new Iyzipay({
        apiKey: this.configService.get('IYZICO_API_KEY') || 'sandbox',
        secretKey: this.configService.get('IYZICO_SECRET_KEY') || 'sandbox',
        uri: this.configService.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com',
      });
    } catch (e) {
      this.logger.warn('Iyzipay not found, using mock mode');
      this.iyzipay = null;
    }
  }

  // payments.service.ts line 67: this.iyzicoService.initializePayment(...)
  async initializePayment(request: any): Promise<PaymentResult> {
    if (!this.iyzipay) {
      return {
        status: 'success',
        paymentId: `mock_${Date.now()}`,
        conversationId: request.conversationId || request.basketId,
        checkoutFormContent: '<html><body>Mock 3DS</body></html>',
        token: `token_${Date.now()}`,
      };
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // payments.service.ts line 126: this.iyzicoService.retrievePaymentResult(...)
  async retrievePaymentResult(token: string): Promise<PaymentResult> {
    if (!this.iyzipay) {
      return {
        status: 'success',
        paymentId: `mock_${Date.now()}`,
        price: 200,
        paidPrice: 200,
      };
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.checkoutForm.retrieve({ token }, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // payments.service.ts line 354: this.iyzicoService.refundPayment(...)
  // Note: The third argument should be string, converting if needed
  async refundPayment(paymentId: string, ip: string, amount?: string | number): Promise<PaymentResult> {
    if (!this.iyzipay) {
      return { status: 'success', paymentId };
    }

    const priceStr = amount ? String(amount) : undefined;

    return new Promise((resolve, reject) => {
      const request: any = { paymentId, ip };
      if (priceStr) {
        request.price = priceStr;
        request.currency = 'TRY';
      }

      this.iyzipay.cancel.create(request, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Aliases
  async createPayment(request: any): Promise<PaymentResult> {
    return this.initializePayment(request);
  }

  async retrievePayment(token: string): Promise<PaymentResult> {
    return this.retrievePaymentResult(token);
  }

  async cancelPayment(paymentId: string, ip: string): Promise<PaymentResult> {
    return this.refundPayment(paymentId, ip);
  }
}
