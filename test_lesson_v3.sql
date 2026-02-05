-- EduPremium: Ders Testi v3
-- İlk dersi (6 Şubat 11:00) şu andan 5 dakika sonrasına ayarla

-- 1. Dersi güncelle
UPDATE lessons
SET scheduled_at = NOW() + INTERVAL '5 minutes'
WHERE id = '64a4c215-c74a-4c44-b782-2ede6378f46e';

-- 2. Ayrıca meeting_link ekle (eğer yoksa)
UPDATE lessons
SET meeting_link = 'https://edupremium.daily.co/ders-64a4c215'
WHERE id = '64a4c215-c74a-4c44-b782-2ede6378f46e'
  AND meeting_link IS NULL;

-- 3. Sonucu kontrol et
SELECT
  id,
  subject,
  scheduled_at,
  scheduled_at AT TIME ZONE 'Europe/Istanbul' as tr_saati,
  NOW() AT TIME ZONE 'Europe/Istanbul' as simdi_tr,
  status,
  meeting_link
FROM lessons
WHERE id = '64a4c215-c74a-4c44-b782-2ede6378f46e';
