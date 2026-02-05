'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, ChevronRight, CheckCircle, AlertCircle, KeyRound, Loader2, XCircle } from 'lucide-react'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [checking, setChecking] = useState(true)
  const [sessionValid, setSessionValid] = useState(false)

  useEffect(() => {
    // Hash fragment'ten oturumu yakala (Supabase recovery link)
    const handleRecoverySession = async () => {
      // URL'de hash varsa Supabase otomatik işleyecek, biraz bekle
      if (window.location.hash) {
        // Supabase auth client hash'i otomatik parse eder
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionValid(true)
      }
      setChecking(false)
    }
    handleRecoverySession()
  }, [supabase.auth])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError('Şifre güncellenirken hata oluştu. Lütfen tekrar deneyin.')
      console.error('Update password error:', err)
    } finally {
      setLoading(false)
    }
  }

  // --- ARKA PLAN WRAPPER ---
  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
          }}
        ></div>
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest bg-white/40 backdrop-blur-md shadow-sm">
              <KeyRound className="w-3 h-3 text-[#D4AF37]" /> Şifre Güncelleme
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )

  // --- LOADING STATE ---
  if (checking) {
    return (
      <BackgroundWrapper>
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Oturum kontrol ediliyor...</p>
          </div>
        </div>
      </BackgroundWrapper>
    )
  }

  // --- INVALID SESSION ---
  if (!sessionValid) {
    return (
      <BackgroundWrapper>
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-3">Geçersiz veya Süresi Dolmuş Link</h2>
            <p className="text-slate-500 text-sm mb-8">
              Şifre sıfırlama linkinizin süresi dolmuş veya geçersiz. Lütfen tekrar deneyin.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg group"
            >
              Yeni Link İste <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </BackgroundWrapper>
    )
  }

  return (
    <BackgroundWrapper>
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">Yeni Şifre Belirle</h1>
          <p className="text-slate-500 text-sm">Lütfen yeni şifrenizi girin.</p>
        </div>

        {message && (
          <div className="mb-5 text-center py-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <CheckCircle className="w-8 h-8" />
            </div>
            <p className="text-green-700 text-sm font-medium mb-4">{message}</p>
            <div className="h-1 w-32 bg-slate-100 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#D4AF37] animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {!message && (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">Yeni Şifre</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
            >
              {loading ? 'Güncelleniyor...' : (
                <>Şifreyi Güncelle <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-slate-500 text-sm">
            <Link href="/login" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors">Giriş Sayfasına Dön</Link>
          </p>
        </div>

      </div>
    </BackgroundWrapper>
  )
}
