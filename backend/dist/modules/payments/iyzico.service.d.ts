import { ConfigService } from '@nestjs/config';
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
export declare class IyzicoService {
    private configService;
    private readonly logger;
    private iyzipay;
    constructor(configService: ConfigService);
    initializePayment(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResult>;
    retrievePaymentResult(token: string): Promise<IyzicoPaymentResult>;
    refundPayment(paymentTransactionId: string, amount: number, conversationId: string): Promise<IyzicoPaymentResult>;
    cancelPayment(paymentId: string, conversationId: string): Promise<IyzicoPaymentResult>;
}
