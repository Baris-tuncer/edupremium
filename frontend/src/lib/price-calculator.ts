// src/lib/price-calculator.ts
// EduPremium Merkezi Fiyat Hesaplayıcı
//
// ÖNEMLİ: Bu dosya hem Frontend UI hem de Backend API tarafından kullanılır.
// Hash uyuşmazlığını önlemek için TÜM fiyat hesaplamaları bu dosyadan yapılmalıdır.
//
// Algoritma:
// - Öğretmen "Net Tutar" belirler (cebine girecek miktar)
// - Stopaj, Komisyon ve KDV bu tutarın ÜZERİNE eklenir
// - Veli final tutarı öder

// =====================================================
// SABİTLER
// =====================================================

export const PRICE_CONSTANTS = {
  MIN_NET_PRICE: 1000,           // Minimum net fiyat (TL)
  STOPAJ_RATE: 0.20,             // Stopaj oranı (%20)
  KDV_RATE: 0.20,                // KDV oranı (%20)
  ROUNDING_BASE: 50,             // Yuvarlama tabanı (50 TL)
};

// Komisyon basamakları (ders sayısına göre)
export const COMMISSION_TIERS = [
  { minLessons: 0, maxLessons: 100, rate: 0.25, label: 'Başlangıç', percentage: '25' },
  { minLessons: 101, maxLessons: 200, rate: 0.20, label: 'Standart', percentage: '20' },
  { minLessons: 201, maxLessons: Infinity, rate: 0.15, label: 'Premium', percentage: '15' },
];

// =====================================================
// TİP TANIMLARI
// =====================================================

export interface PriceBreakdown {
  netPrice: number;          // Öğretmenin alacağı net tutar
  stopaj: number;            // Stopaj tutarı (Net × 0.20)
  komisyon: number;          // Platform komisyonu (Net × komisyon oranı)
  araToplam: number;         // KDV hariç toplam (Net + Stopaj + Komisyon)
  kdv: number;               // KDV tutarı (Ara Toplam × 0.20)
  rawTotal: number;          // Yuvarlanmamış toplam
  displayPrice: number;      // Veli öder (50'ye yuvarlanmış)
  commissionRate: number;    // Uygulanan komisyon oranı
}

// =====================================================
// KOMİSYON FONKSİYONLARI
// =====================================================

/**
 * Ders sayısına göre komisyon oranını döndürür
 */
export function getCommissionRate(completedLessons: number): number {
  if (completedLessons > 200) return 0.15;
  if (completedLessons > 100) return 0.20;
  return 0.25;
}

/**
 * Komisyon seviye bilgisini döndürür
 */
export function getCommissionTier(completedLessons: number) {
  const tier = COMMISSION_TIERS.find(
    t => completedLessons >= t.minLessons && completedLessons <= t.maxLessons
  );
  return tier || COMMISSION_TIERS[0];
}

// =====================================================
// ANA FİYAT HESAPLAMA FONKSİYONU
// =====================================================

/**
 * Net tutardan veli fiyatını hesaplar
 *
 * Bu fonksiyon MUTLAKA hem frontend hem backend'de aynı şekilde kullanılmalıdır.
 *
 * Algoritma:
 * 1. Stopaj = Net × 0.20
 * 2. Komisyon = Net × komisyon oranı
 * 3. Ara Toplam = Net + Stopaj + Komisyon
 * 4. KDV = Ara Toplam × 0.20
 * 5. Veli Final = Ara Toplam + KDV (50'ye yuvarlanır)
 *
 * @param netPrice - Öğretmenin cebine girecek net tutar
 * @param commissionRate - Komisyon oranı (varsayılan: 0.25)
 * @returns Detaylı fiyat dökümü
 *
 * @example
 * calculatePriceFromNet(1000, 0.25)
 * // Sonuç:
 * // netPrice: 1000
 * // stopaj: 200 (1000 × 0.20)
 * // komisyon: 250 (1000 × 0.25)
 * // araToplam: 1450 (1000 + 200 + 250)
 * // kdv: 290 (1450 × 0.20)
 * // rawTotal: 1740
 * // displayPrice: 1750 (50'ye yuvarlanmış)
 */
export function calculatePriceFromNet(
  netPrice: number,
  commissionRate: number = 0.25
): PriceBreakdown {
  // Geçersiz giriş kontrolü
  if (!netPrice || netPrice <= 0) {
    return {
      netPrice: 0,
      stopaj: 0,
      komisyon: 0,
      araToplam: 0,
      kdv: 0,
      rawTotal: 0,
      displayPrice: 0,
      commissionRate,
    };
  }

  // 1. Stopaj (Net × 0.20)
  const stopaj = netPrice * PRICE_CONSTANTS.STOPAJ_RATE;

  // 2. Komisyon (Net × komisyon oranı)
  const komisyon = netPrice * commissionRate;

  // 3. Ara Toplam (KDV Hariç) = Net + Stopaj + Komisyon
  const araToplam = netPrice + stopaj + komisyon;

  // 4. KDV = Ara Toplam × 0.20
  const kdv = araToplam * PRICE_CONSTANTS.KDV_RATE;

  // 5. Ham toplam
  const rawTotal = araToplam + kdv;

  // 6. 50'ye yuvarla
  const displayPrice = Math.round(rawTotal / PRICE_CONSTANTS.ROUNDING_BASE) * PRICE_CONSTANTS.ROUNDING_BASE;

  return {
    netPrice: Math.round(netPrice),
    stopaj: Math.round(stopaj * 100) / 100,
    komisyon: Math.round(komisyon * 100) / 100,
    araToplam: Math.round(araToplam * 100) / 100,
    kdv: Math.round(kdv * 100) / 100,
    rawTotal: Math.round(rawTotal * 100) / 100,
    displayPrice,
    commissionRate,
  };
}

/**
 * Sadece veli fiyatını hesaplar (hızlı versiyon)
 *
 * @param netPrice - Öğretmenin net tutarı
 * @param commissionRate - Komisyon oranı
 * @returns Veli ödemesi gereken tutar (50'ye yuvarlanmış)
 */
export function calculateDisplayPrice(netPrice: number, commissionRate: number = 0.25): number {
  if (!netPrice || netPrice <= 0) return 0;

  const stopaj = netPrice * PRICE_CONSTANTS.STOPAJ_RATE;
  const komisyon = netPrice * commissionRate;
  const araToplam = netPrice + stopaj + komisyon;
  const rawTotal = araToplam * (1 + PRICE_CONSTANTS.KDV_RATE);

  return Math.round(rawTotal / PRICE_CONSTANTS.ROUNDING_BASE) * PRICE_CONSTANTS.ROUNDING_BASE;
}

/**
 * Ders sayısıyla birlikte tam hesaplama
 */
export function calculateFullPricing(netPrice: number, completedLessons: number) {
  const commissionRate = getCommissionRate(completedLessons);
  const tier = getCommissionTier(completedLessons);
  const breakdown = calculatePriceFromNet(netPrice, commissionRate);

  return {
    ...breakdown,
    tierName: tier.label,
    tierPercentage: tier.percentage,
    completedLessons,
  };
}

// =====================================================
// VALİDASYON
// =====================================================

/**
 * Net fiyat validasyonu
 */
export function validateNetPrice(price: number): { valid: boolean; error?: string } {
  if (!price || price <= 0) {
    return { valid: false, error: 'Lütfen bir ders bedeli giriniz.' };
  }

  if (price < PRICE_CONSTANTS.MIN_NET_PRICE) {
    return {
      valid: false,
      error: `Minimum ders bedeli ${formatPrice(PRICE_CONSTANTS.MIN_NET_PRICE)} olmalıdır.`
    };
  }

  return { valid: true };
}

// =====================================================
// FORMAT FONKSİYONLARI
// =====================================================

/**
 * Fiyatı TL formatında döndürür
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR') + ' TL';
}

/**
 * Yüzde formatında döndürür
 */
export function formatPercentage(rate: number): string {
  return '%' + (rate * 100).toFixed(0);
}

// =====================================================
// ÖRNEK HESAPLAMALAR
// =====================================================

/*
// Net = 1000 TL örneği:
const result = calculatePriceFromNet(1000, 0.25);
console.log(result);
// {
//   netPrice: 1000,          // Öğretmen alır
//   stopaj: 200,             // 1000 × 0.20
//   komisyon: 250,           // 1000 × 0.25
//   araToplam: 1450,         // 1000 + 200 + 250
//   kdv: 290,                // 1450 × 0.20
//   rawTotal: 1740,          // 1450 + 290
//   displayPrice: 1750,      // 50'ye yuvarlanmış
//   commissionRate: 0.25
// }

// Farklı komisyon oranları:
console.log(calculateDisplayPrice(1000, 0.25));  // 1750 (Başlangıç)
console.log(calculateDisplayPrice(1000, 0.20));  // 1700 (Standart)
console.log(calculateDisplayPrice(1000, 0.15));  // 1650 (Premium)
*/
