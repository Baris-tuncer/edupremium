'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

export default function Register() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    inviteCode: ''
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
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
          },
        },
      })

      if (authError) throw authError

      // 3. ADIM: Otomatik Giriş
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

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
      
      // 6. ADIM: Yönlendirme
      setTimeout(() => {
        router.refresh()
        router.push('/teacher/profile')
      }, 1500)

    } catch (err: any) {
      console.error('İşlem Hatası:', err)
      setError(err.message || 'Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-4 font-sans">
      <div className="bg-white w-full max-w-[480px] p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a237e] tracking-tight">EduPremium</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Seçkin Eğitmen Başvuru Formu</p>
        </div>

        {success ? (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Başarıyla Katıldınız!</h3>
            <p className="text-gray-600 mb-6">Profiliniz oluşturuluyor, yönlendiriliyorsunuz...</p>
            <div className="h-1 w-32 bg-gray-100 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-green-500 animate-pulse w-full"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100 shadow-sm">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="grid gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ad Soyad</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a237e] focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400"
                  placeholder="Örn: Dr. Barış Tuncer"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">E-posta</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a237e] focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Şifre</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a237e] focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400"
                  placeholder="En az 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Telefon</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a237e] focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400"
                  placeholder="05..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-bold text-[#1a237e] mb-2">Öğretmen Davet Kodu</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-dashed border-[#1a237e]/40 rounded-xl focus:ring-2 focus:ring-[#1a237e] focus:border-transparent transition-all outline-none bg-blue-50/30 font-mono text-center tracking-[0.2em] uppercase text-lg text-[#1a237e]"
                  placeholder="KODU GİRİN"
                  value={formData.inviteCode}
                  onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a237e] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  İşleniyor...
                </>
              ) : (
                <>
                  Başvuruyu Tamamla
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-500 mt-6">
              Zaten hesabın var mı?{' '}
              <Link href="/login" className="text-[#1a237e] font-bold hover:underline">
                Giriş Yap
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
