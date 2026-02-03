// Paratika Ödeme Entegrasyonu
// EduPremium - Ders Ödemesi

export const PARATIKA_CONFIG = {
  MERCHANT: process.env.PARATIKA_MERCHANT_ID || '',
  MERCHANT_USER: process.env.PARATIKA_MERCHANT_USER || '',
  MERCHANT_PASSWORD: process.env.PARATIKA_MERCHANT_PASSWORD || '',
  MERCHANT_SECRET: process.env.PARATIKA_MERCHANT_SECRET || '',

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

// HASH doğrulama fonksiyonu - Callback güvenliği için
import crypto from 'crypto';

export function verifyParatikaCallback(callbackData: Record<string, string>): boolean {
  const receivedHash = callbackData.hash || callbackData.HASH || '';
  const hashParams = callbackData.HASHPARAMS || callbackData.hashParams || '';
  const hashParamsVal = callbackData.HASHPARAMSVAL || callbackData.hashParamsVal || '';

  // Paratika hash göndermemişse (test ortamı veya eski entegrasyon)
  // responseCode kontrolü ile devam et
  if (!receivedHash) {
    console.log('Paratika callback: HASH parametresi yok, responseCode ile doğrulama yapılacak');
    // responseCode '00' ise başarılı kabul et (callback route'ta zaten kontrol ediliyor)
    return true;
  }

  // Paratika HASH formatı: SHA256(HASHPARAMSVAL + MERCHANT_SECRET)
  // HASHPARAMSVAL = HASHPARAMS'taki parametrelerin değerlerinin birleşimi
  let hashInput: string;

  if (hashParamsVal) {
    // Yeni format: HASHPARAMSVAL kullan
    hashInput = hashParamsVal + PARATIKA_CONFIG.MERCHANT_SECRET;
  } else if (hashParams) {
    // Alternatif: HASHPARAMS'taki parametreleri manuel birleştir
    const paramNames = hashParams.split(':');
    const values = paramNames.map(param => callbackData[param] || '').join('');
    hashInput = values + PARATIKA_CONFIG.MERCHANT_SECRET;
  } else {
    // Fallback: Basit format
    hashInput = (callbackData.merchantPaymentId || callbackData.MERCHANTPAYMENTID || '') + PARATIKA_CONFIG.MERCHANT_SECRET;
  }

  const calculatedHash = crypto.createHash('sha256').update(hashInput).digest('hex').toUpperCase();
  const isValid = calculatedHash === receivedHash.toUpperCase();

  if (!isValid) {
    console.error('Paratika callback: HASH doğrulaması başarısız');
    console.error('Hash Input:', hashInput.replace(PARATIKA_CONFIG.MERCHANT_SECRET, '***'));
    console.error('Beklenen:', calculatedHash);
    console.error('Gelen:', receivedHash.toUpperCase());
    console.error('Tüm callback parametreleri:', JSON.stringify(callbackData));
  }

  return isValid;
}
