// ============================================================================
// IYZICO PAYMENT SERVICE
// ============================================================================

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Iyzipay from 'iyzipay';

export interface IyzicoPaymentRequest {
  conversationId: string;
  price: number;
  paidPrice: number;
  currency: string;
  basketId: string;
  paymentGroup: string;
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    gsmNumber?: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: number;
  }>;
}

export interface IyzicoPaymentResult {
  status: 'success' | 'failure';
  paymentId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  token?: string;
  checkoutFormContent?: string;
}

@Injectable()
export class IyzicoService {
  private readonly logger = new Logger(IyzicoService.name);
  private iyzipay: Iyzipay;

  constructor(private configService: ConfigService) {
    this.iyzipay = new Iyzipay({
      apiKey: this.configService.get<string>('IYZICO_API_KEY'),
      secretKey: this.configService.get<string>('IYZICO_SECRET_KEY'),
      uri: this.configService.get<string>('IYZICO_BASE_URL'),
    });
  }

  // ========================================
  // INITIALIZE 3D SECURE PAYMENT
  // ========================================
  async initializePayment(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResult> {
    return new Promise((resolve, reject) => {
      const paymentRequest = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: request.conversationId,
        price: request.price.toFixed(2),
        paidPrice: request.paidPrice.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        basketId: request.basketId,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: request.callbackUrl,
        enabledInstallments: [1], // Only single payment
        buyer: {
          id: request.buyer.id,
          name: request.buyer.name,
          surname: request.buyer.surname,
          gsmNumber: request.buyer.gsmNumber || '+905000000000',
          email: request.buyer.email,
          identityNumber: request.buyer.identityNumber || '11111111111',
          lastLoginDate: new Date().toISOString().split('T')[0] + ' 00:00:00',
          registrationDate: new Date().toISOString().split('T')[0] + ' 00:00:00',
          registrationAddress: request.buyer.registrationAddress,
          ip: request.buyer.ip,
          city: request.buyer.city,
          country: request.buyer.country,
        },
        shippingAddress: {
          contactName: request.billingAddress.contactName,
          city: request.billingAddress.city,
          country: request.billingAddress.country,
          address: request.billingAddress.address,
        },
        billingAddress: {
          contactName: request.billingAddress.contactName,
          city: request.billingAddress.city,
          country: request.billingAddress.country,
          address: request.billingAddress.address,
        },
        basketItems: request.basketItems.map((item) => ({
          id: item.id,
          name: item.name,
          category1: item.category1,
          category2: 'Online Ders',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: item.price.toFixed(2),
        })),
      };

      this.iyzipay.checkoutFormInitialize.create(paymentRequest, (err, result) => {
        if (err) {
          this.logger.error('Iyzico initialization error', err);
          reject(new BadRequestException('Payment initialization failed'));
          return;
        }

        if (result.status === 'failure') {
          this.logger.warn('Iyzico payment failed', result);
          resolve({
            status: 'failure',
            errorCode: result.errorCode,
            errorMessage: result.errorMessage,
          });
          return;
        }

        resolve({
          status: 'success',
          token: result.token,
          checkoutFormContent: result.checkoutFormContent,
          conversationId: result.conversationId,
        });
      });
    });
  }

  // ========================================
  // RETRIEVE PAYMENT RESULT (Callback)
  // ========================================
  async retrievePaymentResult(token: string): Promise<IyzicoPaymentResult> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        token: token,
      };

      this.iyzipay.checkoutForm.retrieve(request, (err, result) => {
        if (err) {
          this.logger.error('Iyzico retrieve error', err);
          reject(new BadRequestException('Payment verification failed'));
          return;
        }

        if (result.status === 'failure' || result.paymentStatus !== 'SUCCESS') {
          this.logger.warn('Iyzico payment not successful', result);
          resolve({
            status: 'failure',
            errorCode: result.errorCode,
            errorMessage: result.errorMessage || 'Payment not successful',
          });
          return;
        }

        resolve({
          status: 'success',
          paymentId: result.paymentId,
          conversationId: result.conversationId,
        });
      });
    });
  }

  // ========================================
  // REFUND PAYMENT
  // ========================================
  async refundPayment(
    paymentTransactionId: string,
    amount: number,
    conversationId: string,
  ): Promise<IyzicoPaymentResult> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: conversationId,
        paymentTransactionId: paymentTransactionId,
        price: amount.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        ip: '127.0.0.1',
      };

      this.iyzipay.refund.create(request, (err, result) => {
        if (err) {
          this.logger.error('Iyzico refund error', err);
          reject(new BadRequestException('Refund failed'));
          return;
        }

        if (result.status === 'failure') {
          resolve({
            status: 'failure',
            errorCode: result.errorCode,
            errorMessage: result.errorMessage,
          });
          return;
        }

        resolve({
          status: 'success',
          paymentId: result.paymentId,
        });
      });
    });
  }

  // ========================================
  // CANCEL PAYMENT
  // ========================================
  async cancelPayment(
    paymentId: string,
    conversationId: string,
  ): Promise<IyzicoPaymentResult> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: conversationId,
        paymentId: paymentId,
        ip: '127.0.0.1',
      };

      this.iyzipay.cancel.create(request, (err, result) => {
        if (err) {
          this.logger.error('Iyzico cancel error', err);
          reject(new BadRequestException('Cancellation failed'));
          return;
        }

        if (result.status === 'failure') {
          resolve({
            status: 'failure',
            errorCode: result.errorCode,
            errorMessage: result.errorMessage,
          });
          return;
        }

        resolve({
          status: 'success',
          paymentId: result.paymentId,
        });
      });
    });
  }
}
