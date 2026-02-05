'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Lock, Eye, EyeOff, ChevronRight, CheckCircle, XCircle, AlertCircle, KeyRound, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setIsValidSession(true)
    }
    setChecking(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw new Error(error.message)

      setSuccess(true)

      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Şifre güncellenemedi.')
    } finally {
      setIsLoading(false)
    }
  }

  // --- ARKA PLAN WRAPPER ---
  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7] overflow-hidden">
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
          {/* Rozet */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest bg-white/40 backdrop-blur-md shadow-sm">
              <KeyRound className="w-3 h-3 text-[#D4AF37]" /> Şifre Sıfırlama
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
  if (!isValidSession) {
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
              href="/login"
              className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg group"
            >
              Giriş Sayfasına Dön <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </BackgroundWrapper>
    )
  }

  // --- SUCCESS STATE ---
  if (success) {
    return (
      <BackgroundWrapper>
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A] font-serif mb-3">Şifreniz Güncellendi!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Yeni şifreniz başarıyla kaydedildi. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
            <div className="h-1 w-32 bg-slate-100 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#D4AF37] animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      </BackgroundWrapper>
    )
  }

  // --- FORM ---
  return (
    <BackgroundWrapper>
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">Yeni Şifre Belirle</h1>
          <p className="text-slate-500 text-sm">Hesabınız için yeni bir şifre oluşturun</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Yeni Şifre */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">Yeni Şifre</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
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

          {/* Şifre Tekrar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">Yeni Şifre (Tekrar)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPasswordConfirm ? "text" : "password"}
                required
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors"
              >
                {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Kaydediliyor...' : (
              <>Şifreyi Güncelle <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>

        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-slate-500 text-sm">
            <Link href="/login" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors">Giriş Sayfasına Dön</Link>
          </p>
        </div>

      </div>
    </BackgroundWrapper>
  )
}
