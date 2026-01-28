// src/lib/pricing.ts
// EduPremium Fiyatlandırma Sistemi V10 - FINAL
// Model: Baz Fiyat Üzerinden Bölüşüm
// 
// Mantık:
// - Öğretmen "Baz Fiyat" girer (örn: 1000 TL)
// - Komisyon bu fiyattan KESİLİR (öğretmen 750 TL alır)
// - Vergiler eklenerek veli fiyatı oluşturulur (1450 TL)

// =====================================================
// SABİTLER
// =====================================================

export const PRICING_CONSTANTS = {
  MIN_BASE_PRICE: 1300,          // Minimum baz fiyat (TL)
  STOPAJ_RATE: 0.20,             // Stopaj oranı
  KDV_RATE: 0.20,                // KDV oranı
  ROUNDING_BASE: 50,             // Yuvarlama tabanı (50 TL)
};

// Komisyon basamakları
export const COMMISSION_TIERS = [
  { minLessons: 0, maxLessons: 100, rate: 0.25, label: 'Başlangıç', percentage: '25' },
  { minLessons: 101, maxLessons: 200, rate: 0.20, label: 'Standart', percentage: '20' },
  { minLessons: 201, maxLessons: Infinity, rate: 0.15, label: 'Premium', percentage: '15' },
];

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

/**
 * Sonraki seviyeye kalan ders sayısını döndürür
 */
export function getLessonsUntilNextTier(completedLessons: number): { 
  nextTier: string; 
  lessonsNeeded: number;
  nextRate: string;
} | null {
  if (completedLessons > 200) return null;
  
  if (completedLessons <= 100) {
    return {
      nextTier: 'Standart',
      lessonsNeeded: 101 - completedLessons,
      nextRate: '20'
    };
  }
  
  return {
    nextTier: 'Premium',
    lessonsNeeded: 201 - completedLessons,
    nextRate: '15'
  };
}

// =====================================================
// FİYAT HESAPLAMA FONKSİYONLARI
// =====================================================

/**
 * Detaylı fiyat hesaplaması
 * 
 * @param basePrice - Öğretmenin girdiği baz fiyat
 * @param commissionRate - Komisyon oranı (0.25, 0.20 veya 0.15)
 */
export function calculatePriceDetails(
  basePrice: number,
  commissionRate: number = 0.25
) {
  if (!basePrice || basePrice <= 0) {
    return {
      basePrice: 0,
      commissionRate,
      commissionAmount: 0,
      teacherNet: 0,
      teacherGross: 0,
      stopajAmount: 0,
      platformShare: 0,
      kdvMatrah: 0,
      kdvAmount: 0,
      rawTotal: 0,
      displayPrice: 0,
      taxTotal: 0,
    };
  }

  // 1. Komisyon tutarı (öğretmenden kesilecek)
  const commissionAmount = Math.round(basePrice * commissionRate);
  
  // 2. Öğretmenin net payı (komisyon düşülmüş)
  const teacherNet = basePrice - commissionAmount;
  
  // 3. Öğretmenin brüt maliyeti (stopaj dahil)
  const teacherGross = teacherNet / (1 - PRICING_CONSTANTS.STOPAJ_RATE);
  const stopajAmount = teacherGross - teacherNet;
  
  // 4. Platform payı = komisyon tutarı
  const platformShare = commissionAmount;
  
  // 5. KDV matrahı
  const kdvMatrah = teacherGross + platformShare;
  
  // 6. KDV tutarı
  const kdvAmount = kdvMatrah * PRICING_CONSTANTS.KDV_RATE;
  
  // 7. Ham toplam
  const rawTotal = kdvMatrah + kdvAmount;
  
  // 8. 50'ye yuvarla
  const displayPrice = Math.round(rawTotal / PRICING_CONSTANTS.ROUNDING_BASE) * PRICING_CONSTANTS.ROUNDING_BASE;
  
  // Toplam vergi/kesinti (veli fiyatı - baz fiyat)
  const taxTotal = displayPrice - basePrice;

  return {
    basePrice,
    commissionRate,
    commissionAmount: Math.round(commissionAmount),
    teacherNet: Math.round(teacherNet),
    teacherGross: Math.round(teacherGross * 100) / 100,
    stopajAmount: Math.round(stopajAmount * 100) / 100,
    platformShare: Math.round(platformShare),
    kdvMatrah: Math.round(kdvMatrah * 100) / 100,
    kdvAmount: Math.round(kdvAmount * 100) / 100,
    rawTotal: Math.round(rawTotal * 100) / 100,
    displayPrice,
    taxTotal,
  };
}

/**
 * Sadece veli fiyatını hesaplar (hızlı)
 */
export function calculateDisplayPrice(basePrice: number, commissionRate: number = 0.25): number {
  if (!basePrice || basePrice <= 0) return 0;
  
  const teacherNet = basePrice * (1 - commissionRate);
  const teacherGross = teacherNet / 0.80;
  const platformShare = basePrice * commissionRate;
  const matrah = teacherGross + platformShare;
  const rawPrice = matrah * 1.20;
  
  return Math.round(rawPrice / 50) * 50;
}

/**
 * Sadece öğretmen net payını hesaplar
 */
export function calculateTeacherNet(basePrice: number, commissionRate: number = 0.25): number {
  if (!basePrice || basePrice <= 0) return 0;
  return Math.round(basePrice * (1 - commissionRate));
}

/**
 * Ders sayısıyla birlikte tam hesaplama
 */
export function calculateFullPricing(basePrice: number, completedLessons: number) {
  const commissionRate = getCommissionRate(completedLessons);
  const tier = getCommissionTier(completedLessons);
  const details = calculatePriceDetails(basePrice, commissionRate);
  const nextTierInfo = getLessonsUntilNextTier(completedLessons);
  
  return {
    ...details,
    tierName: tier.label,
    tierPercentage: tier.percentage,
    completedLessons,
    nextTierInfo,
  };
}

// =====================================================
// VALİDASYON
// =====================================================

/**
 * Baz fiyat validasyonu
 */
export function validateBasePrice(price: number): { valid: boolean; error?: string } {
  if (!price || price <= 0) {
    return { valid: false, error: 'Lütfen bir ders bedeli giriniz.' };
  }
  
  if (price < PRICING_CONSTANTS.MIN_BASE_PRICE) {
    return { 
      valid: false, 
      error: `Minimum ders bedeli ${formatPrice(PRICING_CONSTANTS.MIN_BASE_PRICE)} olmalıdır.` 
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
// ÖRNEK KULLANIM
// =====================================================

/*
// Temel hesaplama
const details = calculatePriceDetails(1000, 0.25);
console.log(details);
// {
//   basePrice: 1000,
//   commissionRate: 0.25,
//   commissionAmount: 250,      // Öğretmenden kesilen
//   teacherNet: 750,            // Öğretmenin eline geçen
//   teacherGross: 937.5,        // Stopaj dahil maliyet
//   stopajAmount: 187.5,        // Stopaj
//   platformShare: 250,         // Platform payı
//   kdvMatrah: 1187.5,
//   kdvAmount: 237.5,
//   rawTotal: 1425,
//   displayPrice: 1450,         // Veli öder (50'ye yuvarlanmış)
//   taxTotal: 450               // Toplam vergi/kesinti
// }

// Hızlı hesaplamalar
console.log(calculateDisplayPrice(1000, 0.25));  // 1450
console.log(calculateTeacherNet(1000, 0.25));    // 750

// Farklı komisyon oranları
console.log(calculateDisplayPrice(1000, 0.20));  // 1400 (Standart)
console.log(calculateDisplayPrice(1000, 0.15));  // 1350 (Premium)
*/
