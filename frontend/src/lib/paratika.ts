// src/lib/paratika.ts
import crypto from 'crypto';

export const PARATIKA_CONFIG = {
  MERCHANT: process.env.PARATIKA_MERCHANT!,
  MERCHANT_USER: process.env.PARATIKA_MERCHANT_USER!,
  MERCHANT_PASSWORD: process.env.PARATIKA_MERCHANT_PASSWORD!,
  SECRET_KEY: process.env.PARATIKA_SECRET_KEY!,
  API_URL: process.env.PARATIKA_API_URL || 'https://test.paratika.com.tr/paratika/api/v2',
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
};

export function generateHash(sessionToken: string): string {
  const hashString = PARATIKA_CONFIG.MERCHANT + sessionToken + PARATIKA_CONFIG.SECRET_KEY;
  return crypto.createHash('sha256').update(hashString).digest('base64');
}

export async function createPaymentSession(params: {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  description: string;
  teacherId?: string;
  studentId?: string;
  availabilityId?: string;
  subject?: string;
  scheduledAt?: string;
}): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  try {
    const { amount, orderId, customerEmail, customerName, description } = params;
    const returnUrl = `${PARATIKA_CONFIG.BASE_URL}/api/payment/callback`;

    const formData = new URLSearchParams();
    formData.append('ACTION', 'SESSIONTOKEN');
    formData.append('MERCHANT', PARATIKA_CONFIG.MERCHANT);
    formData.append('MERCHANTUSER', PARATIKA_CONFIG.MERCHANT_USER);
    formData.append('MERCHANTPASSWORD', PARATIKA_CONFIG.MERCHANT_PASSWORD);
    formData.append('SESSIONTYPE', 'PAYMENTSESSION');
    formData.append('RETURNURL', returnUrl);
    formData.append('AMOUNT', amount.toFixed(2));
    formData.append('CURRENCY', 'TRY');
    formData.append('MERCHANTPAYMENTID', orderId);
    formData.append('CUSTOMER', customerEmail);
    formData.append('CUSTOMERNAME', customerName);
    formData.append('CUSTOMEREMAIL', customerEmail);
    formData.append('ORDERITEMS', JSON.stringify([{
      code: orderId,
      name: description,
      quantity: 1,
      amount: amount.toFixed(2),
      description: description
    }]));
    formData.append('EXTRA', JSON.stringify({
      teacherId: params.teacherId,
      studentId: params.studentId,
      availabilityId: params.availabilityId,
      subject: params.subject,
      scheduledAt: params.scheduledAt,
    }));

    console.log('Paratika Request:', { merchant: PARATIKA_CONFIG.MERCHANT, amount, orderId });

    const response = await fetch(PARATIKA_CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('Paratika Response:', responseText);

    const result = parseParatikaResponse(responseText);

    if (result.responseCode === '00' && result.sessionToken) {
      return { success: true, sessionToken: result.sessionToken };
    } else {
      return { success: false, error: result.responseMsg || 'Session oluşturulamadı' };
    }
  } catch (error) {
    console.error('Paratika Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' };
  }
}

export function parseParatikaResponse(responseText: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (responseText.includes('=')) {
    const pairs = responseText.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) {
        result[key] = decodeURIComponent(value);
      }
    }
  }
  
  try {
    const json = JSON.parse(responseText);
    return { ...result, ...json };
  } catch {}
  
  return result;
}

export function getPaymentPageUrl(sessionToken: string): string {
  return `https://test.paratika.com.tr/paratika/api/v2/post/sale3d/${sessionToken}`;
}
