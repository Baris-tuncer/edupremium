-- EduPremium: Ders Testi için Zaman Güncelleme
-- Bu SQL, mevcut bir dersi şu andan 10 dakika sonrasına ayarlar.
-- Böylece "Derse Katıl" butonu 15 dakika kuralını test edebilirsiniz.

-- 1. Mevcut dersi güncelle (meeting_link'i olan)
UPDATE lessons
SET
  scheduled_at = NOW() + INTERVAL '10 minutes',
  status = 'CONFIRMED'
WHERE id = '4a0eaa8c-079c-4e94-8833-d8d2650f065c';

-- 2. Güncellenen dersi kontrol et
SELECT
  id,
  subject,
  scheduled_at,
  scheduled_at AT TIME ZONE 'Europe/Istanbul' as "TR_Saati",
  status,
  meeting_link
FROM lessons
WHERE id = '4a0eaa8c-079c-4e94-8833-d8d2650f065c';

-- 3. İlgili öğrenci ve öğretmen bilgileri
SELECT
  l.id as lesson_id,
  tp.full_name as teacher_name,
  tp.email as teacher_email,
  sp.full_name as student_name,
  sp.email as student_email
FROM lessons l
JOIN teacher_profiles tp ON l.teacher_id = tp.id
JOIN student_profiles sp ON l.student_id = sp.id
WHERE l.id = '4a0eaa8c-079c-4e94-8833-d8d2650f065c';
