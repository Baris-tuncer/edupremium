-- =============================================
-- KAMPANYA SİSTEMİ - DATABASE MIGRATION
-- EduPremium - Premium Vitrin Öğretmenleri İçin
-- =============================================
--
-- Bu SQL'i Supabase SQL Editor'de çalıştırın.
-- Mevcut tablolara DOKUNMAZ, sadece yeni tablolar oluşturur.
--
-- Tarih: 2026-02-09
-- =============================================

-- =============================================
-- 1. KAMPANYALAR TABLOSU
-- Öğretmenlerin oluşturduğu kampanya tanımları
-- =============================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Kampanya tipi
  type TEXT NOT NULL CHECK (type IN ('package_discount', 'bonus_lesson', 'first_lesson')),
  name TEXT NOT NULL,
  description TEXT,

  -- Paket detayları
  lesson_count INT NOT NULL DEFAULT 10 CHECK (lesson_count >= 5 AND lesson_count <= 30),
  discount_percent INT DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 30),
  bonus_lessons INT DEFAULT 0 CHECK (bonus_lessons >= 0 AND bonus_lessons <= 5),

  -- Fiyat snapshot (kampanya oluşturma anında)
  net_price_per_lesson INT NOT NULL CHECK (net_price_per_lesson >= 1000),
  commission_rate DECIMAL(3,2) DEFAULT 0.25,

  -- Hesaplanmış değerler (cache)
  single_lesson_display_price INT NOT NULL, -- Tekil ders fiyatı (veli öder)
  package_total_price INT NOT NULL, -- Paket toplam fiyatı (veli öder)
  teacher_total_earnings INT NOT NULL, -- Öğretmen toplam kazancı

  -- Sınırlamalar
  max_purchases INT DEFAULT NULL, -- NULL = sınırsız
  purchase_count INT DEFAULT 0,

  -- Tarihler
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,

  -- Durum
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_campaigns_teacher ON campaigns(teacher_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active, ends_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);

-- =============================================
-- 2. PAKET ÖDEMELERİ TABLOSU
-- Satın alınan paketlerin kayıtları
-- =============================================

CREATE TABLE IF NOT EXISTS package_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL, -- EDU-PKG-xxxxx

  -- Taraflar
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Snapshot (satın alma anındaki değerler - değişmez)
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  lesson_count INT NOT NULL,
  bonus_lessons INT DEFAULT 0,
  total_lessons INT NOT NULL, -- lesson_count + bonus_lessons

  discount_percent INT DEFAULT 0,
  net_price_per_lesson INT NOT NULL, -- Öğretmen NET (ders başı)
  single_lesson_display_price INT NOT NULL, -- Tekil fiyat (iptal hesabı için)

  -- Ödeme bilgileri
  total_amount INT NOT NULL, -- Toplam ödenen (TL)
  teacher_total_earnings INT NOT NULL, -- Öğretmen toplam kazancı

  -- Durum
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),

  -- Ders durumu
  completed_lessons INT DEFAULT 0,
  cancelled_lessons INT DEFAULT 0,

  -- Paratika
  session_token TEXT,
  payment_id TEXT,

  -- İptal/İade bilgileri
  cancelled_at TIMESTAMPTZ,
  cancel_reason_category TEXT,
  cancel_reason_text TEXT,
  refund_amount INT DEFAULT 0,

  -- Tarihler
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Paket süresi (son ders tarihi + 30 gün)
  expires_at TIMESTAMPTZ
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_package_payments_student ON package_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_package_payments_teacher ON package_payments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_package_payments_status ON package_payments(status);
CREATE INDEX IF NOT EXISTS idx_package_payments_order ON package_payments(order_id);

-- =============================================
-- 3. DERS DEĞİŞİKLİKLERİ TABLOSU
-- İptal ve değişiklik geçmişi
-- =============================================

CREATE TABLE IF NOT EXISTS lesson_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- İlişkiler
  lesson_id UUID NOT NULL, -- lessons tablosuna referans (foreign key eklemiyoruz, izolasyon için)
  package_payment_id UUID REFERENCES package_payments(id) ON DELETE CASCADE,

  -- Değişiklik detayları
  change_type TEXT NOT NULL CHECK (change_type IN ('reschedule', 'cancel', 'package_cancel')),
  initiated_by TEXT NOT NULL CHECK (initiated_by IN ('student', 'teacher', 'admin', 'system')),

  -- Sebep
  reason_category TEXT NOT NULL CHECK (reason_category IN (
    'health', 'school', 'family', 'technical', 'financial',
    'schedule_conflict', 'not_satisfied', 'no_longer_needed', 'other'
  )),
  reason_text TEXT,

  -- Tarih değişiklikleri (reschedule için)
  old_scheduled_at TIMESTAMPTZ,
  new_scheduled_at TIMESTAMPTZ,

  -- Değişiklik hakkı takibi
  change_count_before INT DEFAULT 0, -- Bu değişiklikten önceki sayı

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_lesson_changes_lesson ON lesson_changes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_changes_package ON lesson_changes(package_payment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_changes_type ON lesson_changes(change_type);

-- =============================================
-- 4. LESSONS TABLOSUNA YENİ SÜTUNLAR
-- Mevcut tabloya ekleme (ALTER TABLE)
-- =============================================

-- Paket ilişkisi için
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS package_payment_id UUID REFERENCES package_payments(id) ON DELETE SET NULL;

-- Değişiklik hakkı takibi için
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS reschedule_count INT DEFAULT 0;

-- Paket dersi mi kontrolü için
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS is_package_lesson BOOLEAN DEFAULT false;

-- Index
CREATE INDEX IF NOT EXISTS idx_lessons_package ON lessons(package_payment_id) WHERE package_payment_id IS NOT NULL;

-- =============================================
-- 5. UPDATED_AT TRİGGER'LARI
-- =============================================

-- campaigns için updated_at trigger
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaigns_updated_at ON campaigns;
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Campaigns RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Öğretmen kendi kampanyalarını görebilir/düzenleyebilir
CREATE POLICY "Teachers can manage own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = teacher_id);

-- Herkes aktif kampanyaları görebilir
CREATE POLICY "Anyone can view active campaigns" ON campaigns
  FOR SELECT USING (is_active = true AND ends_at > NOW());

-- Package Payments RLS
ALTER TABLE package_payments ENABLE ROW LEVEL SECURITY;

-- Öğrenci kendi paketlerini görebilir
CREATE POLICY "Students can view own packages" ON package_payments
  FOR SELECT USING (auth.uid() = student_id);

-- Öğretmen kendi satışlarını görebilir
CREATE POLICY "Teachers can view own sales" ON package_payments
  FOR SELECT USING (auth.uid() = teacher_id);

-- Lesson Changes RLS
ALTER TABLE lesson_changes ENABLE ROW LEVEL SECURITY;

-- İlgili taraflar değişiklikleri görebilir (lesson üzerinden kontrol)
CREATE POLICY "Parties can view lesson changes" ON lesson_changes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = lesson_changes.lesson_id
      AND (l.teacher_id = auth.uid() OR l.student_id = auth.uid())
    )
  );

-- =============================================
-- 7. YARDIMCI FONKSİYONLAR
-- =============================================

-- Kampanya satın alma sayısını artır
CREATE OR REPLACE FUNCTION increment_campaign_purchase_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    UPDATE campaigns
    SET purchase_count = purchase_count + 1
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS package_payment_completed ON package_payments;
CREATE TRIGGER package_payment_completed
  AFTER UPDATE ON package_payments
  FOR EACH ROW
  EXECUTE FUNCTION increment_campaign_purchase_count();

-- =============================================
-- 8. ÖRNEK VERİ (TEST İÇİN - OPSIYONEL)
-- =============================================

-- Bu kısmı production'da çalıştırmayın!
-- Test için: Aşağıdaki satırların başındaki -- işaretlerini kaldırın

-- INSERT INTO campaigns (
--   teacher_id,
--   type,
--   name,
--   description,
--   lesson_count,
--   discount_percent,
--   net_price_per_lesson,
--   single_lesson_display_price,
--   package_total_price,
--   teacher_total_earnings,
--   ends_at
-- ) VALUES (
--   'TEACHER_UUID_HERE', -- Gerçek öğretmen UUID'si ile değiştirin
--   'package_discount',
--   '10 Derslik Matematik Paketi',
--   'LGS hazırlık için ideal paket',
--   10,
--   15,
--   1500,
--   2600,
--   22100,
--   12750,
--   NOW() + INTERVAL '30 days'
-- );

-- =============================================
-- MIGRATION TAMAMLANDI
-- =============================================

-- Kontrol sorguları:
-- SELECT * FROM campaigns LIMIT 5;
-- SELECT * FROM package_payments LIMIT 5;
-- SELECT * FROM lesson_changes LIMIT 5;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'lessons' AND column_name IN ('package_payment_id', 'reschedule_count', 'is_package_lesson');
