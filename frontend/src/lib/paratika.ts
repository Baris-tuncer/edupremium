// Paratika Ödeme Entegrasyonu
// EduPremium - Ders Ödemesi

export const PARATIKA_CONFIG = {
  MERCHANT: '10005538',
  MERCHANT_USER: 'visserrapiuser@gmail.com',
  MERCHANT_PASSWORD: 'Baristuncer1980!',
  MERCHANT_SECRET: '2ta2DL3kL9hhgZus34RA',

  // Entegrasyon (Test) ortamı
  TEST_API_URL: 'https://entegrasyon.paratika.com.tr/paratika/api/v2',
  TEST_PAYMENT_URL: 'https://entegrasyon.paratika.com.tr/payment',

  // Production ortamı
  PROD_API_URL: 'https://vpos.paratika.com.tr/paratika/api/v2',
  PROD_PAYMENT_URL: 'https://vpos.paratika.com.tr/payment',
};

// Test modunda mı?
export const IS_TEST_MODE = true;

export const getApiUrl = () => IS_TEST_MODE ? PARATIKA_CONFIG.TEST_API_URL : PARATIKA_CONFIG.PROD_API_URL;
export const getPaymentPageUrl = (sessionToken: string) => {
  const baseUrl = IS_TEST_MODE ? PARATIKA_CONFIG.TEST_PAYMENT_URL : PARATIKA_CONFIG.PROD_PAYMENT_URL;
  return `${baseUrl}/${sessionToken}`;
};
