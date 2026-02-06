# ⚠️ KRİTİK DOSYALAR - DİKKATLİ OL

> **Son çalışan tarih:** 6 Şubat 2026
> **Durum:** Tüm sistemler çalışıyor

Bu dosyalarda değişiklik yapmadan önce **2 kez düşün**.
Sistem çalışıyor, bozma riski yüksek.

---

## 🔴 VIDEO / KAYIT SİSTEMİ

| Dosya | Açıklama |
|-------|----------|
| `frontend/src/lib/daily.ts` | Daily.co API, token oluşturma, kayıt fonksiyonları |
| `frontend/src/app/api/lessons/meeting-token/route.ts` | Öğretmen/öğrenci token API'si |

**Özellikler:**
- Öğretmen girince otomatik kayıt başlıyor (`start_cloud_recording: true`)
- Kayıtlar 7 gün Daily.co cloud'da saklanıyor
- Dashboard: https://dashboard.daily.co/recordings

---

## 🔴 DERSE KATILMA

| Dosya | Açıklama |
|-------|----------|
| `frontend/src/app/teacher/lessons/page.tsx` | Öğretmen ders sayfası, "Derse Katıl" butonu |
| `frontend/src/app/student/lessons/page.tsx` | Öğrenci ders sayfası, "Derse Katıl" butonu |

**Önemli:**
- Popup blocker bypass için `window.open('about:blank')` kullanılıyor
- 15 dakika kuralı: Ders başlangıcından 15 dk önce/sonra katılım

---

## 🔴 AUTHENTICATION

| Dosya | Açıklama |
|-------|----------|
| `frontend/src/middleware.ts` | Route koruması, public paths |
| `frontend/src/app/update-password/page.tsx` | Şifre sıfırlama sayfası |
| `frontend/src/app/api/auth/manual-reset/route.ts` | Şifre sıfırlama API |

**Public Paths (middleware.ts):**
- `/`, `/login`, `/register`, `/forgot-password`
- `/update-password`, `/reset-password`
- `/student/login`, `/student/register`
- `/teacher/login`, `/teacher/register`

---

## 🔴 ÖDEME SİSTEMİ

| Dosya | Açıklama |
|-------|----------|
| `frontend/src/app/api/payment/create-session/route.ts` | Ödeme oturumu oluşturma |
| `frontend/src/app/api/payment/callback/route.ts` | Ödeme callback |
| `frontend/src/app/api/payment/featured-session/route.ts` | Featured ödeme |
| `frontend/src/app/api/payment/featured-callback/route.ts` | Featured callback |

---

## 🟡 FEATURED ÖĞRETMENLER

| Dosya | Açıklama |
|-------|----------|
| `frontend/src/app/student/dashboard/page.tsx` | Featured gruplandırma, filtre |

---

## 🟢 GÜVENLİ DEĞİŞİKLİK YAPILABİLİR

- Stil/CSS değişiklikleri
- Statik sayfalar (about, contact, faq, terms, privacy)
- Admin panel görünüm değişiklikleri
- Yeni sayfa ekleme (mevcut dosyalara dokunmadan)

---

## 🔧 ACİL DURUMDA

### Vercel Rollback
```
Vercel Dashboard → Deployments → Çalışan eski deployment → "..." → Promote to Production
```

### Supabase Backup
```
Supabase Dashboard → Settings → Database → Backups
```

### Daily.co Kayıtlar
```
https://dashboard.daily.co/recordings
```

---

## 📋 ENV DEĞİŞKENLERİ (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DAILY_API_KEY`
- `RESEND_API_KEY`
- (diğerleri...)

---

## 📝 NOTLAR

- Branch protection aktif: PR olmadan main'e push yasak
- Her değişiklik öncesi local'de test et
- Kritik dosyalarda değişiklik = önce yedek al
