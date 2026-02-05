'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      }
    }
    getUser()
  }, [])

  const handleResend = async () => {
    if (!email) return

    setResending(true)
    setError('')
    setResent(false)

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })

      if (resendError) {
        setError(resendError.message)
      } else {
        setResent(true)
      }
    } catch (err) {
      setError('E-posta gönderilemedi. Lütfen tekrar deneyin.')
    } finally {
      setResending(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
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

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-md mx-auto">

          {/* Rozet */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest bg-white/40 backdrop-blur-md shadow-sm">
              <Mail className="w-3 h-3 text-[#D4AF37]" /> E-Posta Doğrulama
            </div>
          </div>

          {/* KART */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20">
                <Mail className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">E-Posta Doğrulaması Gerekli</h1>
              <p className="text-slate-500 text-sm">
                Hesabınızı aktif hale getirmek için e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.
              </p>
            </div>

            {/* Email Info */}
            {email && (
              <div className="bg-[#FDFBF7]/80 backdrop-blur-xl rounded-xl p-4 mb-6 border border-[#D4AF37]/20">
                <p className="text-xs text-slate-500 text-center uppercase tracking-wider font-bold mb-1">
                  Doğrulama e-postası şu adrese gönderildi:
                </p>
                <p className="text-sm font-bold text-[#0F172A] text-center">
                  {email}
                </p>
              </div>
            )}

            {/* Resent Success */}
            {resent && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl mb-6">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">Doğrulama e-postası tekrar gönderildi.</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
                <p className="text-sm text-slate-600">E-posta kutunuzu kontrol edin</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">2</span>
                </div>
                <p className="text-sm text-slate-600">EduPremium tarafından gönderilen e-postayı açın</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
                <p className="text-sm text-slate-600">Doğrulama bağlantısına tıklayın</p>
              </div>
            </div>

            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full py-3.5 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>E-Postayı Tekrar Gönder</span>
                </>
              )}
            </button>

            {/* Spam Notice */}
            <div className="mt-5 p-3 bg-[#FDFBF7]/80 backdrop-blur-xl rounded-xl border border-slate-200">
              <p className="text-xs text-slate-400 text-center">
                E-posta gelmediyse spam / gereksiz klasörünüzü kontrol edin. Bazen e-postalar bu klasöre düşebilir.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 font-medium hover:text-red-500 transition-colors"
              >
                Çıkış Yap
              </button>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Giriş Sayfası</span>
              </Link>
            </div>

          </div>

          {/* Destek */}
          <p className="text-center text-xs text-slate-400 mt-8">
            Yardıma mı ihtiyacınız var?{' '}
            <Link href="/iletisim" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors underline underline-offset-2">
              Destek alın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
