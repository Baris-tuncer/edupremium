-- EduPremium: Kayıt Trigger v4 (Sadeleştirilmiş - Varsayılanlara Güvenen Sürüm)
-- Amaç: Yeni öğretmen kaydında sadece kimlik ve güvenlik (is_approved=false) bilgisini girer.
-- Fiyat, komisyon vb. alanlar veritabanındaki DEFAULT değerlerden gelir.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. EĞER KULLANICI ÖĞRETMENSE
  IF (NEW.raw_user_meta_data->>'role' = 'teacher') THEN

    -- Teacher Profiles: Sadece zorunlu kimlik ve kilit (onay) bilgileri.
    INSERT INTO public.teacher_profiles (id, full_name, email, is_approved, is_verified)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email,
      false, -- Onay KAPALI (Admin onayı gerekir)
      false  -- Doğrulama KAPALI
    )
    ON CONFLICT (id) DO NOTHING;

    -- Profiles Tablosu (Genel)
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'teacher',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

  -- 2. ÖĞRENCİ ve DİĞERLERİ
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
