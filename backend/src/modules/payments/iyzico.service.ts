import { Injectable } from '@nestjs/common';

@Injectable()
export class IyzicoService {
  async createCheckoutForm(data: any) {
    return { checkoutFormContent: '', token: 'mock-token' };
  }

  async retrievePayment(token: string) {
    return { status: 'success', paymentId: token };
  }

  async refund(paymentId: string, amount: number) {
    return { status: 'success' };
  }

  async cancel(paymentId: string) {
    return { status: 'success' };
  }
}
