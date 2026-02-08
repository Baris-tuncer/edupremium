// src/lib/package-calculator.ts
// EduPremium Kampanya/Paket Fiyat Hesaplayıcı
//
// Bu dosya kampanya ve paket fiyatlarını hesaplar.
// Mevcut price-calculator.ts'e DOKUNMAZ, tamamen ayrı çalışır.
//
// Algoritma:
// 1. Öğretmen NET fiyatına indirim uygulanır
// 2. İndirimli NET üzerine vergiler/komisyon eklenir
// 3. Toplam paket fiyatı hesaplanır

import { PRICE_CONSTANTS, calculatePriceFromNet, formatPrice } from './price-calculator';

// =====================================================
// SABİTLER
// =====================================================

export const PACKAGE_CONSTANTS = {
  MIN_LESSONS: 5,
  MAX_LESSONS: 30,
  MAX_DISCOUNT_PERCENT: 30,
  MAX_BONUS_LESSONS: 5,
  MIN_NET_AFTER_DISCOUNT: 1000, // İndirimden sonra minimum NET
  MAX_RESCHEDULE_PER_LESSON: 2, // Her ders max 2 kez değiştirilebilir
  RESCHEDULE_DEADLINE_HOURS: 24, // Değişiklik için minimum saat
  PACKAGE_VALIDITY_DAYS: 180, // Paket geçerlilik süresi (6 ay)
};

// Kampanya tipleri
export type CampaignType = 'package_discount' | 'bonus_lesson' | 'first_lesson';

export const CAMPAIGN_TYPES = {
  package_discount: {
    name: 'Paket İndirimi',
    description: 'Toplu ders alımında indirim',
    icon: '📦',
    example: '10 ders al, %15 indirim kazan',
  },
  bonus_lesson: {
    name: 'Bonus Ders',
    description: 'Belirli sayıda derse ek ders hediye',
    icon: '🎁',
    example: '5 ders al, 1 ders hediye',
  },
  first_lesson: {
    name: 'Tanışma Paketi',
    description: 'İlk ders için özel indirim',
    icon: '👋',
    example: 'İlk dersiniz %50 indirimli',
  },
};

// İptal/Değişiklik sebepleri
export const CHANGE_REASONS = {
  student: [
    { value: 'health', label: 'Sağlık/Doktor randevusu' },
    { value: 'school', label: 'Okul/Sınav programı' },
    { value: 'family', label: 'Aile ziyareti/etkinlik' },
    { value: 'schedule_conflict', label: 'Zaman uyuşmazlığı' },
    { value: 'other', label: 'Diğer' },
  ],
  teacher: [
    { value: 'health', label: 'Sağlık sorunu' },
    { value: 'family', label: 'Acil aile durumu' },
    { value: 'technical', label: 'Teknik/internet sorunu' },
    { value: 'schedule_conflict', label: 'Randevu çakışması' },
    { value: 'other', label: 'Diğer' },
  ],
  cancel: [
    { value: 'financial', label: 'Maddi sebepler' },
    { value: 'not_satisfied', label: 'Öğretmenden memnun kalmadım' },
    { value: 'no_longer_needed', label: 'Artık derse ihtiyacım yok' },
    { value: 'schedule_conflict', label: 'Zaman uyuşmazlığı' },
    { value: 'other', label: 'Diğer' },
  ],
};

// =====================================================
// TİP TANIMLARI
// =====================================================

export interface PackagePriceBreakdown {
  // Temel bilgiler
  lessonCount: number;
  bonusLessons: number;
  totalLessons: number;
  discountPercent: number;

  // Ders başı fiyatlar
  netPricePerLesson: number; // Orijinal NET
  discountedNetPerLesson: number; // İndirimli NET
  displayPricePerLesson: number; // İndirimli display (ders başı)

  // Toplam fiyatlar
  originalTotalPrice: number; // İndirimsiz toplam (tekil × ders sayısı)
  packageTotalPrice: number; // Paket fiyatı (indirimli)
  savings: number; // Veli tasarrufu

  // Öğretmen kazancı
  teacherEarningsPerLesson: number; // Ders başı NET kazanç
  teacherTotalEarnings: number; // Toplam NET kazanç

  // Tekil fiyat (iptal hesabı için)
  singleLessonDisplayPrice: number;

  // Komisyon bilgileri
  commissionRate: number;
  platformTotalCommission: number;
}

export interface CampaignData {
  type: CampaignType;
  name: string;
  description?: string;
  lessonCount: number;
  discountPercent: number;
  bonusLessons: number;
  netPricePerLesson: number;
  commissionRate: number;
  endsAt: Date;
}

export interface RefundCalculation {
  originalPayment: number;
  completedLessons: number;
  remainingLessons: number;
  completedLessonsCharge: number; // Tekil fiyattan hesaplanan
  refundAmount: number;
  platformFee: number; // Opsiyonel işlem ücreti
  netRefund: number; // Veliye iade edilecek
}

// =====================================================
// ANA FİYAT HESAPLAMA FONKSİYONLARI
// =====================================================

/**
 * Paket fiyatını hesaplar (Paket İndirimi tipi için)
 */
export function calculatePackagePrice(
  netPricePerLesson: number,
  lessonCount: number,
  discountPercent: number,
  commissionRate: number = 0.25
): PackagePriceBreakdown {
  // Validasyon
  if (lessonCount < PACKAGE_CONSTANTS.MIN_LESSONS || lessonCount > PACKAGE_CONSTANTS.MAX_LESSONS) {
    throw new Error(`Ders sayısı ${PACKAGE_CONSTANTS.MIN_LESSONS}-${PACKAGE_CONSTANTS.MAX_LESSONS} arasında olmalı`);
  }

  if (discountPercent < 0 || discountPercent > PACKAGE_CONSTANTS.MAX_DISCOUNT_PERCENT) {
    throw new Error(`İndirim oranı %0-%${PACKAGE_CONSTANTS.MAX_DISCOUNT_PERCENT} arasında olmalı`);
  }

  // İndirimli NET hesapla
  const discountedNetPerLesson = Math.round(netPricePerLesson * (1 - discountPercent / 100));

  // Minimum NET kontrolü
  if (discountedNetPerLesson < PACKAGE_CONSTANTS.MIN_NET_AFTER_DISCOUNT) {
    throw new Error(`İndirimli ders bedeli minimum ${formatPrice(PACKAGE_CONSTANTS.MIN_NET_AFTER_DISCOUNT)} olmalı`);
  }

  // Tekil (indirimsiz) fiyatı hesapla
  const singleLessonBreakdown = calculatePriceFromNet(netPricePerLesson, commissionRate);
  const singleLessonDisplayPrice = singleLessonBreakdown.displayPrice;

  // Paket (indirimli) fiyatı hesapla
  const discountedBreakdown = calculatePriceFromNet(discountedNetPerLesson, commissionRate);
  const displayPricePerLesson = discountedBreakdown.displayPrice;

  // Toplam fiyatlar
  const originalTotalPrice = singleLessonDisplayPrice * lessonCount;
  const packageTotalPrice = displayPricePerLesson * lessonCount;
  const savings = originalTotalPrice - packageTotalPrice;

  // Öğretmen kazancı
  const teacherTotalEarnings = discountedNetPerLesson * lessonCount;

  // Platform komisyonu
  const platformTotalCommission = Math.round(discountedBreakdown.komisyon * lessonCount);

  return {
    lessonCount,
    bonusLessons: 0,
    totalLessons: lessonCount,
    discountPercent,

    netPricePerLesson,
    discountedNetPerLesson,
    displayPricePerLesson,

    originalTotalPrice,
    packageTotalPrice,
    savings,

    teacherEarningsPerLesson: discountedNetPerLesson,
    teacherTotalEarnings,

    singleLessonDisplayPrice,

    commissionRate,
    platformTotalCommission,
  };
}

/**
 * Bonus ders paketini hesaplar (X al Y hediye tipi için)
 */
export function calculateBonusPackage(
  netPricePerLesson: number,
  paidLessonCount: number,
  bonusLessons: number,
  commissionRate: number = 0.25
): PackagePriceBreakdown {
  // Validasyon
  const totalLessons = paidLessonCount + bonusLessons;
  if (totalLessons > PACKAGE_CONSTANTS.MAX_LESSONS) {
    throw new Error(`Toplam ders sayısı ${PACKAGE_CONSTANTS.MAX_LESSONS}'u geçemez`);
  }

  if (bonusLessons > PACKAGE_CONSTANTS.MAX_BONUS_LESSONS) {
    throw new Error(`Bonus ders sayısı ${PACKAGE_CONSTANTS.MAX_BONUS_LESSONS}'i geçemez`);
  }

  // Tekil fiyat
  const singleLessonBreakdown = calculatePriceFromNet(netPricePerLesson, commissionRate);
  const singleLessonDisplayPrice = singleLessonBreakdown.displayPrice;

  // Toplam fiyatlar (sadece ücretli dersler için ödeme)
  const originalTotalPrice = singleLessonDisplayPrice * totalLessons; // Bonus dahil olsaydı
  const packageTotalPrice = singleLessonDisplayPrice * paidLessonCount; // Sadece ücretli
  const savings = originalTotalPrice - packageTotalPrice;

  // Öğretmen kazancı (ücretli dersler için)
  const teacherTotalEarnings = netPricePerLesson * paidLessonCount;

  // Efektif indirim oranı
  const effectiveDiscount = Math.round((savings / originalTotalPrice) * 100);

  // Platform komisyonu
  const platformTotalCommission = Math.round(singleLessonBreakdown.komisyon * paidLessonCount);

  return {
    lessonCount: paidLessonCount,
    bonusLessons,
    totalLessons,
    discountPercent: effectiveDiscount,

    netPricePerLesson,
    discountedNetPerLesson: netPricePerLesson, // Bonus'ta NET değişmez
    displayPricePerLesson: singleLessonDisplayPrice,

    originalTotalPrice,
    packageTotalPrice,
    savings,

    teacherEarningsPerLesson: netPricePerLesson,
    teacherTotalEarnings,

    singleLessonDisplayPrice,

    commissionRate,
    platformTotalCommission,
  };
}

// =====================================================
// İADE HESAPLAMA
// =====================================================

/**
 * Paket iptali için iade tutarını hesaplar
 * Kural: Yapılan dersler TEKİL fiyattan hesaplanır
 */
export function calculateRefund(
  originalPayment: number,
  singleLessonDisplayPrice: number,
  totalLessons: number,
  completedLessons: number,
  platformFeePercent: number = 0 // Opsiyonel işlem ücreti
): RefundCalculation {
  const remainingLessons = totalLessons - completedLessons;

  // Yapılan dersler tekil fiyattan
  const completedLessonsCharge = singleLessonDisplayPrice * completedLessons;

  // İade tutarı
  let refundAmount = originalPayment - completedLessonsCharge;

  // Negatif olamaz (çok ders yapılmışsa iade yok)
  if (refundAmount < 0) {
    refundAmount = 0;
  }

  // Platform işlem ücreti (opsiyonel)
  const platformFee = Math.round(refundAmount * platformFeePercent / 100);
  const netRefund = refundAmount - platformFee;

  return {
    originalPayment,
    completedLessons,
    remainingLessons,
    completedLessonsCharge,
    refundAmount,
    platformFee,
    netRefund,
  };
}

// =====================================================
// VALİDASYON FONKSİYONLARI
// =====================================================

/**
 * Kampanya verilerini doğrular
 */
export function validateCampaign(data: Partial<CampaignData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.type) {
    errors.push('Kampanya tipi seçilmeli');
  }

  if (!data.name || data.name.length < 5) {
    errors.push('Kampanya adı en az 5 karakter olmalı');
  }

  if (!data.lessonCount || data.lessonCount < PACKAGE_CONSTANTS.MIN_LESSONS) {
    errors.push(`Minimum ${PACKAGE_CONSTANTS.MIN_LESSONS} ders seçilmeli`);
  }

  if (data.lessonCount && data.lessonCount > PACKAGE_CONSTANTS.MAX_LESSONS) {
    errors.push(`Maksimum ${PACKAGE_CONSTANTS.MAX_LESSONS} ders seçilebilir`);
  }

  if (data.discountPercent && data.discountPercent > PACKAGE_CONSTANTS.MAX_DISCOUNT_PERCENT) {
    errors.push(`Maksimum %${PACKAGE_CONSTANTS.MAX_DISCOUNT_PERCENT} indirim yapılabilir`);
  }

  if (data.bonusLessons && data.bonusLessons > PACKAGE_CONSTANTS.MAX_BONUS_LESSONS) {
    errors.push(`Maksimum ${PACKAGE_CONSTANTS.MAX_BONUS_LESSONS} bonus ders verilebilir`);
  }

  if (!data.netPricePerLesson || data.netPricePerLesson < PRICE_CONSTANTS.MIN_NET_PRICE) {
    errors.push(`Ders bedeli minimum ${formatPrice(PRICE_CONSTANTS.MIN_NET_PRICE)} olmalı`);
  }

  // İndirimli NET kontrolü
  if (data.netPricePerLesson && data.discountPercent) {
    const discountedNet = data.netPricePerLesson * (1 - data.discountPercent / 100);
    if (discountedNet < PACKAGE_CONSTANTS.MIN_NET_AFTER_DISCOUNT) {
      errors.push(`İndirimli ders bedeli minimum ${formatPrice(PACKAGE_CONSTANTS.MIN_NET_AFTER_DISCOUNT)} olmalı`);
    }
  }

  if (!data.endsAt) {
    errors.push('Kampanya bitiş tarihi seçilmeli');
  } else if (new Date(data.endsAt) <= new Date()) {
    errors.push('Bitiş tarihi gelecekte olmalı');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Ders değişikliği yapılabilir mi kontrol eder
 */
export function canRescheduleLesson(
  scheduledAt: Date,
  currentRescheduleCount: number
): { allowed: boolean; reason?: string } {
  const now = new Date();
  const hoursUntilLesson = (new Date(scheduledAt).getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilLesson < PACKAGE_CONSTANTS.RESCHEDULE_DEADLINE_HOURS) {
    return {
      allowed: false,
      reason: `Derse ${PACKAGE_CONSTANTS.RESCHEDULE_DEADLINE_HOURS} saatten az kaldığı için değişiklik yapılamaz`,
    };
  }

  if (currentRescheduleCount >= PACKAGE_CONSTANTS.MAX_RESCHEDULE_PER_LESSON) {
    return {
      allowed: false,
      reason: `Bu ders için değişiklik hakkınız (${PACKAGE_CONSTANTS.MAX_RESCHEDULE_PER_LESSON}) dolmuştur`,
    };
  }

  return { allowed: true };
}

// =====================================================
// FORMAT FONKSİYONLARI
// =====================================================

/**
 * Paket özetini metin olarak döndürür
 */
export function formatPackageSummary(breakdown: PackagePriceBreakdown): string {
  if (breakdown.bonusLessons > 0) {
    return `${breakdown.lessonCount} ders + ${breakdown.bonusLessons} hediye`;
  }
  return `${breakdown.totalLessons} derslik paket (%${breakdown.discountPercent} indirim)`;
}

/**
 * Tasarrufu metin olarak döndürür
 */
export function formatSavings(savings: number, originalPrice: number): string {
  const percent = Math.round((savings / originalPrice) * 100);
  return `${formatPrice(savings)} tasarruf (%${percent})`;
}
