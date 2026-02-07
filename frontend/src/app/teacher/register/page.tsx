'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, ChevronRight, Presentation, User, Mail, Lock, Phone, Ticket, Eye, EyeOff } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

export default function Register() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    inviteCode: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptKvkk, setAcceptKvkk] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!turnstileToken) {
      setError('Lütfen güvenlik doğrulamasını tamamlayın.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. ADIM: Davet Kodu Kontrolü
      const { data: codeData, error: codeError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', formData.inviteCode.trim())
        .eq('is_used', false)
        .single()

      if (codeError || !codeData) {
        throw new Error('Geçersiz veya kullanılmış davet kodu!')
      }

      // 2. ADIM: Kayıt Ol (Sign Up)
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'teacher',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })

      if (authError) throw authError

      // 3. ADIM: Otomatik Giriş (email doğrulama kapalıysa)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        // Email doğrulama gerekiyorsa, kullanıcıyı doğrulama sayfasına yönlendir
        if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setSuccess(true)
          setTimeout(() => {
            window.location.href = '/verify-email'
          }, 1500)
          // Davet kodunu yak (kullanıcı zaten oluştu)
          await supabase
            .from('invitation_codes')
            .update({ is_used: true })
            .eq('id', codeData.id)
          return
        }
        throw signInError
      }

      // 4. ADIM: Teacher Profile Oluştur
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error: profileError } = await supabase
          .from('teacher_profiles')
          .upsert({
            id: user.id,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            title: 'Eğitmen',
          })

        if (profileError) {
          console.error('Profil oluşturma hatası:', profileError)
        }
      }

      // 5. ADIM: Davet Kodunu Yak
      await supabase
        .from('invitation_codes')
        .update({ is_used: true })
        .eq('id', codeData.id)

      setSuccess(true)

      // 6. ADIM: Yönlendirme (Hard navigation)
      setTimeout(() => {
        window.location.href = '/teacher/profile'
      }, 1500)

    } catch (err: any) {
      console.error('İşlem Hatası:', err)
      setError(err.message || 'Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">

      {/* --- ARKA PLAN --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
          }}
        ></div>
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">

        {/* Geri Dön */}
        <div className="absolute top-8 left-4 md:left-8">
          <Link href="/register" className="flex items-center gap-2 text-[#0F172A] font-bold text-sm hover:text-[#D4AF37] transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Geri Dön
          </Link>
        </div>

        <div className="max-w-md mx-auto">

          {/* Rozet */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest bg-white/40 backdrop-blur-md shadow-sm">
              <Presentation className="w-3 h-3 text-[#D4AF37]" /> Eğitmen Başvurusu
            </div>
          </div>

          {/* FORM KARTI */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">Eğitmen Kaydı</h1>
              <p className="text-slate-500 text-sm">EduPremium ailesine katılın</p>
            </div>

            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] font-serif mb-2">Başarıyla Katıldınız!</h3>
                <p className="text-slate-500 text-sm mb-6">Profiliniz oluşturuluyor, yönlendiriliyorsunuz...</p>
                <div className="h-1 w-32 bg-slate-100 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-[#D4AF37] animate-pulse w-full"></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* Ad Soyad */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">Ad Soyad</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Dr. Barış Tuncer"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* E-Posta */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">E-Posta</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="ornek@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Şifre */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">Şifre</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="En az 6 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Telefon */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">Telefon</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Davet Kodu */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider ml-1">Öğretmen Davet Kodu</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="KODU GİRİN"
                      value={formData.inviteCode}
                      onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                      className="w-full bg-[#FDFBF7]/80 backdrop-blur-xl border-2 border-dashed border-[#D4AF37]/40 rounded-xl py-3.5 pl-12 pr-4 text-[#0F172A] font-mono text-center tracking-[0.2em] uppercase text-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300 placeholder:text-sm placeholder:tracking-normal placeholder:font-sans"
                    />
                  </div>
                  {/* WhatsApp İletişim */}
                  <div className="text-center pt-2">
                    <a
                      href="https://wa.me/905332951303?text=Merhaba%2C%20EduPremium%20platformuna%20%C3%B6%C4%9Fretmen%20olarak%20kat%C4%B1lmak%20istiyorum%2C%20davet%20kodu%20alabilir%20miyim%3F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#25D366] transition-colors group"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="group-hover:underline">Davet kodunuz yok mu? Bizimle iletişime geçin</span>
                    </a>
                  </div>
                </div>

                {/* Yasal Onaylar */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptKvkk}
                      onChange={(e) => setAcceptKvkk(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                    />
                    <span className="text-sm text-slate-600">
                      <Link href="/privacy" target="_blank" className="text-[#0F172A] font-semibold hover:text-[#D4AF37] underline">KVKK Aydınlatma Metni</Link>'ni okudum ve kabul ediyorum.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                    />
                    <span className="text-sm text-slate-600">
                      <Link href="/terms" target="_blank" className="text-[#0F172A] font-semibold hover:text-[#D4AF37] underline">Kullanım Şartları</Link>'nı okudum ve kabul ediyorum.
                    </span>
                  </label>
                </div>

                <Turnstile onVerify={handleTurnstileVerify} />

                <button
                  type="submit"
                  disabled={loading || !acceptTerms || !acceptKvkk || !turnstileToken}
                  className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg flex items-center justify-center gap-2 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      İşleniyor...
                    </>
                  ) : (
                    <>Başvuruyu Tamamla <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>

              </form>
            )}

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-slate-500 text-sm">
                Zaten hesabınız var mı? <Link href="/teacher/login" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors">Giriş Yapın</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
