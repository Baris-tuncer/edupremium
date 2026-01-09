export class InitiatePaymentDto { appointmentId: string; }
export class BankTransferInfoDto { orderCode: string; amount: number; bankName: string; iban: string; accountHolder: string; deadline?: string; instructions: string; }
export class UploadReceiptDto { appointmentId: string; receiptUrl: string; }
export class PaymentCallbackDto { token: string; }
