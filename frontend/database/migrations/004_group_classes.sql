-- =============================================
-- GRUP DERSLERİ (SINIF SİSTEMİ) - DATABASE MIGRATION
-- EduPremium - Premium Vitrin Öğretmenleri İçin
-- =============================================
--
-- Bu SQL'i Supabase SQL Editor'de çalıştırın.
-- Mevcut tablolara DOKUNMAZ, sadece yeni tablolar oluşturur.
--
-- Tarih: 2026-02-16
-- =============================================

-- =============================================
-- 1. GRUP DERSLERİ TABLOSU
-- Öğretmenlerin oluşturduğu sınıflar
-- =============================================

CREATE TABLE IF NOT EXISTS group_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sınıf Bilgileri
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,

  -- Zamanlama
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60 CHECK (duration_minutes >= 30 AND duration_minutes <= 180),

  -- Kapasite (sabit: min 3, max 20)
  min_capacity INT NOT NULL DEFAULT 3 CHECK (min_capacity = 3),
  max_capacity INT NOT NULL DEFAULT 20 CHECK (max_capacity = 20),

  -- Fiyat (NET - öğretmenin alacağı)
  net_price INT NOT NULL CHECK (net_price >= 500),
  display_price INT NOT NULL, -- Öğrencinin ödeyeceği (hesaplanmış)

  -- Durum
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',       -- Kayıt açık
    'confirmed',  -- Min doldu, ders yapılacak
    'completed',  -- Ders tamamlandı
    'cancelled'   -- İptal edildi
  )),

  -- Meeting
  meeting_link TEXT,

  -- Kayıt için son tarih (ders saatinden 24 saat önce)
  enrollment_deadline TIMESTAMPTZ,

  -- Zaman damgaları
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_capacity CHECK (max_capacity >= min_capacity)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_group_classes_teacher ON group_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_group_classes_status ON group_classes(status);
CREATE INDEX IF NOT EXISTS idx_group_classes_scheduled ON group_classes(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_group_classes_open ON group_classes(status, scheduled_at) WHERE status = 'open';

-- =============================================
-- 2. GRUP DERSİ KAYITLARI TABLOSU
-- Öğrencilerin sınıf kayıtları
-- =============================================

CREATE TABLE IF NOT EXISTS group_class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_class_id UUID NOT NULL REFERENCES group_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ödeme
  order_id TEXT UNIQUE NOT NULL,
  amount_paid INT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending',    -- Ödeme bekliyor
    'completed',  -- Ödeme tamamlandı
    'failed',     -- Ödeme başarısız
    'refunded'    -- İade edildi
  )),
  payment_id TEXT, -- Paratika payment ID
  session_token TEXT, -- Paratika session token

  -- Durum
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN (
    'enrolled',   -- Kayıtlı
    'cancelled',  -- İptal edildi
    'attended',   -- Derse katıldı
    'no_show'     -- Derse katılmadı
  )),

  -- İptal bilgileri
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  refund_amount INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: Bir öğrenci bir sınıfa sadece bir kez kayıt olabilir
  UNIQUE(group_class_id, student_id)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_group_enrollments_class ON group_class_enrollments(group_class_id);
CREATE INDEX IF NOT EXISTS idx_group_enrollments_student ON group_class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_group_enrollments_order ON group_class_enrollments(order_id);
CREATE INDEX IF NOT EXISTS idx_group_enrollments_status ON group_class_enrollments(payment_status, status);

-- =============================================
-- 3. UPDATED_AT TRİGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_group_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS group_classes_updated_at ON group_classes;
CREATE TRIGGER group_classes_updated_at
  BEFORE UPDATE ON group_classes
  FOR EACH ROW
  EXECUTE FUNCTION update_group_classes_updated_at();

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Group Classes RLS
ALTER TABLE group_classes ENABLE ROW LEVEL SECURITY;

-- Öğretmen kendi sınıflarını yönetebilir
CREATE POLICY "Teachers can manage own group classes" ON group_classes
  FOR ALL USING (auth.uid() = teacher_id);

-- Herkes açık/onaylanmış sınıfları görebilir
CREATE POLICY "Anyone can view open or confirmed group classes" ON group_classes
  FOR SELECT USING (status IN ('open', 'confirmed'));

-- Group Class Enrollments RLS
ALTER TABLE group_class_enrollments ENABLE ROW LEVEL SECURITY;

-- Öğrenci kendi kayıtlarını yönetebilir
CREATE POLICY "Students can manage own enrollments" ON group_class_enrollments
  FOR ALL USING (auth.uid() = student_id);

-- Öğretmenler kendi sınıflarının kayıtlarını görebilir
CREATE POLICY "Teachers can view enrollments of own classes" ON group_class_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_classes gc
      WHERE gc.id = group_class_enrollments.group_class_id
      AND gc.teacher_id = auth.uid()
    )
  );

-- =============================================
-- 5. YARDIMCI FONKSİYONLAR
-- =============================================

-- Kayıt sayısını hesaplayan fonksiyon
CREATE OR REPLACE FUNCTION get_group_class_enrollment_count(class_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INT
    FROM group_class_enrollments
    WHERE group_class_id = class_id
    AND payment_status = 'completed'
    AND status = 'enrolled'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Minimum dolduğunda status'u confirmed yapan trigger
CREATE OR REPLACE FUNCTION check_group_class_min_capacity()
RETURNS TRIGGER AS $$
DECLARE
  class_record RECORD;
  enrolled_count INT;
BEGIN
  -- Sadece payment_status completed olduğunda çalış
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    -- Sınıf bilgilerini al
    SELECT * INTO class_record FROM group_classes WHERE id = NEW.group_class_id;

    -- Kayıtlı öğrenci sayısını hesapla
    SELECT COUNT(*) INTO enrolled_count
    FROM group_class_enrollments
    WHERE group_class_id = NEW.group_class_id
    AND payment_status = 'completed'
    AND status = 'enrolled';

    -- Minimum kapasite doldu ve sınıf hala open ise confirmed yap
    IF enrolled_count >= class_record.min_capacity AND class_record.status = 'open' THEN
      UPDATE group_classes
      SET status = 'confirmed'
      WHERE id = NEW.group_class_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_min_capacity_trigger ON group_class_enrollments;
CREATE TRIGGER check_min_capacity_trigger
  AFTER INSERT OR UPDATE ON group_class_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION check_group_class_min_capacity();

-- =============================================
-- 6. SERVICE ROLE POLICY (API için)
-- =============================================

-- Service role için insert/update izni (API callback'leri için)
CREATE POLICY "Service role can insert enrollments" ON group_class_enrollments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update enrollments" ON group_class_enrollments
  FOR UPDATE USING (true);

CREATE POLICY "Service role can insert group classes" ON group_classes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update group classes" ON group_classes
  FOR UPDATE USING (true);

-- =============================================
-- MIGRATION TAMAMLANDI
-- =============================================

-- Kontrol sorguları:
-- SELECT * FROM group_classes LIMIT 5;
-- SELECT * FROM group_class_enrollments LIMIT 5;
-- SELECT get_group_class_enrollment_count('some-uuid');
