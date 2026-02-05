-- ============================================
-- EduPremium: Kayıt Trigger v2
-- ============================================
-- Yeni kullanıcı kaydı olduğunda:
--   Öğretmen → teacher_profiles (is_approved=false, is_verified=false) + profiles
--   Öğrenci  → profiles
-- Supabase SQL Editor'de çalıştırın.
-- ============================================

-- 1. teacher_profiles varsayılan değerleri
ALTER TABLE public.teacher_profiles
ALTER COLUMN is_approved SET DEFAULT false;

ALTER TABLE public.teacher_profiles
ALTER COLUMN is_verified SET DEFAULT false;

-- 2. Mevcut trigger'ı kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Profiles tablosunu oluştur (yoksa)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Güncellenmiş Trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Eğer Kullanıcı Öğretmense
  IF (NEW.raw_user_meta_data->>'role' = 'teacher') THEN
    -- teacher_profiles'a kayıt ekle (ONAYSIZ)
    INSERT INTO public.teacher_profiles (id, is_approved, is_verified)
    VALUES (NEW.id, false, false)
    ON CONFLICT (id) DO NOTHING;

    -- profiles tablosuna da ekle
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'teacher',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

  -- Eğer Kullanıcı Öğrenciyse
  ELSIF (NEW.raw_user_meta_data->>'role' = 'student') THEN
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'student',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

  -- Varsayılan (role belirtilmemişse öğrenci kabul et)
  ELSE
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'student',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Doğrulama
SELECT tgname, tgrelid::regclass, tgtype
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
