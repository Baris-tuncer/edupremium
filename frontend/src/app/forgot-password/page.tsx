'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, ChevronRight, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/auth/manual-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu')
      }

      setStatus('success')
    } catch (error: any) {
      console.error('Reset Error:', error)
      setStatus('error')
      setErrorMessage(error.message)
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

      <div className="relative z-10 container mx-auto px-4">

        {/* Geri Dön */}
        <div className="absolute top-8 left-4 md:left-8">
          <Link href="/login" className="flex items-center gap-2 text-[#0F172A] font-bold text-sm hover:text-[#D4AF37] transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Geri Dön
          </Link>
        </div>

        <div className="max-w-md mx-auto">

          {/* Rozet */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest bg-white/40 backdrop-blur-md shadow-sm">
              <KeyRound className="w-3 h-3 text-[#D4AF37]" /> Şifre Sıfırlama
            </div>
          </div>

          {/* FORM KARTI */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">Şifre Sıfırlama</h1>
              <p className="text-slate-500 text-sm">E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.</p>
            </div>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-3">Bağlantı Gönderildi!</h3>
                <p className="text-slate-500 text-sm mb-2">
                  Şifre sıfırlama bağlantısı e-postanıza gönderildi.
                </p>
                <p className="text-slate-400 text-xs mb-8">
                  Spam / gereksiz posta kutunuzu da kontrol etmeyi unutmayın.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg group"
                >
                  Giriş Sayfasına Dön <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {status === 'error' && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}

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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
                >
                  {status === 'loading' ? 'Gönderiliyor...' : (
                    <>Sıfırlama Bağlantısı Gönder <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>

              </form>
            )}

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-slate-500 text-sm">
                Şifrenizi hatırladınız mı? <Link href="/login" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors">Giriş Yapın</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
