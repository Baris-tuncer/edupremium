-- =============================================
-- PREMIUM AYARLARI - DATABASE MIGRATION
-- EduPremium - Platform Ayarları
-- =============================================
--
-- Bu SQL'i Supabase SQL Editor'de çalıştırın.
--
-- Tarih: 2026-02-16
-- =============================================

-- =============================================
-- 1. PREMIUM PLANLARI TABLOSU
-- Düzenlenebilir fiyatlandırma planları
-- =============================================

CREATE TABLE IF NOT EXISTS premium_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan bilgileri
  plan_key TEXT UNIQUE NOT NULL,  -- '30', '90', '180', '365'
  label TEXT NOT NULL,            -- '1 Ay', '3 Ay', etc.
  days INT NOT NULL,              -- 30, 90, 180, 365
  price INT NOT NULL,             -- Baz fiyat (KDV hariç) - kuruş
  per_day INT NOT NULL,           -- Günlük fiyat (hesaplanmış)

  -- Özellikler
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan planları ekle
INSERT INTO premium_plans (plan_key, label, days, price, per_day, is_popular, sort_order) VALUES
  ('30', '1 Ay', 30, 4500, 150, false, 1),
  ('90', '3 Ay', 90, 12000, 133, true, 2),
  ('180', '6 Ay', 180, 21000, 117, false, 3),
  ('365', '1 Yıl', 365, 37000, 101, false, 4)
ON CONFLICT (plan_key) DO UPDATE SET
  label = EXCLUDED.label,
  days = EXCLUDED.days,
  price = EXCLUDED.price,
  per_day = EXCLUDED.per_day,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;

-- =============================================
-- 2. PREMIUM ÖZELLİKLERİ TABLOSU
-- Premium üyelik avantajları
-- =============================================

CREATE TABLE IF NOT EXISTS premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Özellik bilgileri
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,  -- SVG path veya icon adı

  -- Sıralama ve durum
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan özellikleri ekle
INSERT INTO premium_features (title, description, icon, sort_order) VALUES
  ('Ana Sayfa Vitrini', 'Ziyaretçilerin ilk gördüğü premium bölümde yer alın', 'home', 1),
  ('Editörün Seçimi Rozeti', 'Profilinizde güven veren altın rozet', 'star', 2),
  ('Arama Sonuçlarında Üst Sıra', 'Öğretmenler sayfasında öncelikli gösterim', 'trending-up', 3),
  ('Öğrenci Portalı Vitrini', 'Kayıtlı öğrencilerin ana ekranında öne çıkın', 'users', 4),
  ('Grup Dersleri Oluşturma', 'Birden fazla öğrenciye aynı anda ders verin', 'user-group', 5),
  ('Düşük Komisyon Oranı', 'Standart %20 yerine sadece %15 komisyon', 'percent', 6),
  ('Öncelikli Destek', 'Sorularınıza hızlı yanıt garantisi', 'support', 7),
  ('Güvenilirlik Artışı', 'Velilerin gözünde daha güvenilir profil', 'shield', 8)
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. PLATFORM AYARLARI TABLOSU
-- Genel platform ayarları (KDV oranı vb.)
-- =============================================

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, json
  description TEXT,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan ayarları ekle
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description) VALUES
  ('premium_vat_rate', '20', 'number', 'Premium üyelik KDV oranı (%)'),
  ('premium_bank_name', 'AKBANK', 'string', 'Havale için banka adı'),
  ('premium_bank_iban', 'TR06 0004 6000 2088 8000 5930 60', 'string', 'Havale için IBAN'),
  ('premium_bank_holder', 'Mac Elt Özel Eğitim Yayıncılık Dağ. Paz. ve Tic. Ltd. Şti.', 'string', 'Hesap sahibi adı'),
  ('standard_commission_rate', '20', 'number', 'Standart öğretmen komisyon oranı (%)'),
  ('premium_commission_rate', '15', 'number', 'Premium öğretmen komisyon oranı (%)')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- =============================================
-- 4. INDEX'LER
-- =============================================

CREATE INDEX IF NOT EXISTS idx_premium_plans_active ON premium_plans(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_premium_features_active ON premium_features(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);

-- =============================================
-- 5. UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_premium_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS premium_plans_updated_at ON premium_plans;
CREATE TRIGGER premium_plans_updated_at
  BEFORE UPDATE ON premium_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_premium_plans_updated_at();

CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS platform_settings_updated_at ON platform_settings;
CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_updated_at();

-- =============================================
-- 6. RLS POLİTİKALARI
-- =============================================

-- Premium Plans RLS
ALTER TABLE premium_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active premium plans" ON premium_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage premium plans" ON premium_plans
  FOR ALL USING (true);

-- Premium Features RLS
ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active premium features" ON premium_features
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage premium features" ON premium_features
  FOR ALL USING (true);

-- Platform Settings RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform settings" ON platform_settings
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage platform settings" ON platform_settings
  FOR ALL USING (true);

-- =============================================
-- MIGRATION TAMAMLANDI
-- =============================================
