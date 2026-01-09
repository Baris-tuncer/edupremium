export declare class InitiatePaymentDto {
    appointmentId: string;
}
export declare class BankTransferInfoDto {
    orderCode: string;
    amount: number;
    bankName: string;
    iban: string;
    accountHolder: string;
    deadline?: string;
    instructions: string;
}
export declare class UploadReceiptDto {
    appointmentId: string;
    receiptUrl: string;
}
export declare class PaymentCallbackDto {
    token: string;
}
