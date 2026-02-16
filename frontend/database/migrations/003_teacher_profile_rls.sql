-- ============================================================
-- EDUPREMIUM - Öğretmen Profili RLS Politikaları
-- Öğretmenler sadece kendi profillerini görebilir
-- ============================================================

-- RLS'yi etkinleştir (eğer zaten aktif değilse)
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Public profiles for students and visitors" ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can only view own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Admin full access" ON teacher_profiles;

-- 1. Öğrenciler ve ziyaretçiler onaylı profilleri görebilir
-- Ama sadece öğretmen OLMAYAN kullanıcılar (öğrenciler, misafirler)
CREATE POLICY "Public profiles for non-teachers" ON teacher_profiles
  FOR SELECT
  USING (
    is_approved = true
    AND is_verified = true
    AND (
      -- Oturum açmamış kullanıcılar (ziyaretçiler)
      auth.uid() IS NULL
      OR
      -- Oturum açmış ama öğretmen OLMAYAN kullanıcılar (öğrenciler)
      NOT EXISTS (
        SELECT 1 FROM teacher_profiles tp
        WHERE tp.id = auth.uid()
      )
    )
  );

-- 2. Öğretmenler SADECE kendi profilini görebilir
CREATE POLICY "Teachers can only view own profile" ON teacher_profiles
  FOR SELECT
  USING (
    -- Kendi profili mi?
    id = auth.uid()
  );

-- 3. Öğretmenler sadece kendi profilini güncelleyebilir
CREATE POLICY "Teachers can update own profile" ON teacher_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. Öğretmenler kendi profilini oluşturabilir
CREATE POLICY "Teachers can insert own profile" ON teacher_profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- 5. Admin tam erişim (user metadata'da role = admin olanlar)
-- Not: Admin kontrolü için raw_user_meta_data kullanılıyor
CREATE POLICY "Admin full access to teacher profiles" ON teacher_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR auth.users.raw_user_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- Kontrol: Politikaları listele
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'teacher_profiles';
