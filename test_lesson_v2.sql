-- EduPremium: Ders Testi v2
-- Önce mevcut durumu görelim, sonra güncelleyelim

-- 1. Mevcut ders durumu
SELECT id, subject, scheduled_at, status, meeting_link
FROM lessons
WHERE id = '4a0eaa8c-079c-4e94-8833-d8d2650f065c';

-- 2. Dersi şu andan 5 dakika sonrasına ayarla (daha kesin zaman)
UPDATE lessons
SET scheduled_at = (NOW() AT TIME ZONE 'UTC') + INTERVAL '5 minutes'
WHERE id = '4a0eaa8c-079c-4e94-8833-d8d2650f065c'
RETURNING id, subject, scheduled_at, status, meeting_link;
