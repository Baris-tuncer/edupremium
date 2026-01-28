// Paratika Ödeme Entegrasyonu
// EduPremium - Ders Ödemesi

export const PARATIKA_CONFIG = {
  MERCHANT: '10005538',
  MERCHANT_USER: 'visserrapiuser@gmail.com',
  MERCHANT_PASSWORD: 'Baristuncer1980!',
  MERCHANT_SECRET: '2ta2DL3kL9hhgZus34RA',
  
  // Test ortamı
  TEST_API_URL: 'https://test.paratika.com.tr/paratika/api/v2',
  TEST_PAYMENT_URL: 'https://test.paratika.com.tr/paratika/post/sale3d',
  
  // Production ortamı
  PROD_API_URL: 'https://vpos.paratika.com.tr/paratika/api/v2',
  PROD_PAYMENT_URL: 'https://vpos.paratika.com.tr/paratika/post/sale3d',
};

// Test modunda mı?
export const IS_TEST_MODE = true;

export const getApiUrl = () => IS_TEST_MODE ? PARATIKA_CONFIG.TEST_API_URL : PARATIKA_CONFIG.PROD_API_URL;
export const getPaymentPageUrl = (sessionToken: string) => {
  const baseUrl = IS_TEST_MODE ? PARATIKA_CONFIG.TEST_PAYMENT_URL : PARATIKA_CONFIG.PROD_PAYMENT_URL;
  return `${baseUrl}/${sessionToken}`;
};

export interface PaymentSessionParams {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  extra?: Record<string, any>;
}

export interface PaymentSessionResponse {
  success: boolean;
  sessionToken?: string;
  paymentUrl?: string;
  error?: string;
  responseCode?: string;
}
