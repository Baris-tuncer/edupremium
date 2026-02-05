'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight, Presentation } from 'lucide-react'

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      setSuccess('E-posta doğrulaması başarılı! Şimdi giriş yapabilirsiniz.')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        router.refresh()
        router.push('/teacher/dashboard')
      }

    } catch (err: any) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
      console.error('Login error:', err)
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
              <Presentation className="w-3 h-3 text-[#D4AF37]" /> Eğitmen Paneli
            </div>
          </div>

          {/* FORM KARTI */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">Öğretmen Girişi</h1>
              <p className="text-slate-500 text-sm">Derslerinizi yönetmek için giriş yapın</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

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

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Şifre</label>
                  <Link href="/forgot-password" className="text-xs text-[#D4AF37] font-bold hover:underline">Şifremi Unuttum?</Link>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
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
                {loading ? 'Giriş Yapılıyor...' : (
                  <>Panele Git <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-slate-500 text-sm">
                Aramıza katılmak mı istiyorsunuz? <Link href="/teacher/register" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors">Başvuru Yapın</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
