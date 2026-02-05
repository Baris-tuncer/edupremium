-- ============================================
-- EduPremium: Profiles Tablosu Trigger Fix
-- ============================================
-- Bu SQL, yeni kullanıcı kaydı olduğunda
-- public.profiles tablosuna otomatik kayıt ekler.
-- Supabase SQL Editor'de çalıştırın.
-- ============================================

-- 1. Mevcut trigger'ı kaldır (varsa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Profiles tablosunu oluştur (yoksa)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS'yi etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS politikaları (yoksa oluştur)
DO $$
BEGIN
  -- Kullanıcı kendi profilini okuyabilir
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Kullanıcı kendi profilini güncelleyebilir
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Service role her şeyi yapabilir (trigger için gerekli)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role has full access'
  ) THEN
    CREATE POLICY "Service role has full access" ON public.profiles
      FOR ALL USING (true);
  END IF;
END
$$;

-- 5. Trigger fonksiyonunu oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 6. Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Doğrulama: Trigger'ın oluştuğunu kontrol et
SELECT tgname, tgrelid::regclass, tgtype
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
