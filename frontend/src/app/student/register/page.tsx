'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Star, User, Mail, Lock, Phone, GraduationCap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Turnstile from '@/components/Turnstile';

export default function StudentRegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    gradeLevel: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptKvkk, setAcceptKvkk] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const gradeLevels = [
    'İlkokul (1-4)',
    'Ortaokul (5-8)',
    'Lise (9-12)',
    'Üniversite Hazırlık',
    'Üniversite',
    'Mezun / Yetişkin'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      toast.error('Lütfen güvenlik doğrulamasını tamamlayın.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Supabase Auth ile kullanıcı oluştur (metadata ile)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'student',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      });

      // "Email not confirmed" hatası = kayıt başarılı, doğrulama gerekiyor
      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          setRegisteredEmail(formData.email);
          setShowVerifyEmail(true);
          setIsLoading(false);
          return;
        }
        toast.error(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Kullanıcı oluşturulamadı');
        setIsLoading(false);
        return;
      }

      // Email doğrulama gerekiyorsa (session null döner)
      if (!authData.session) {
        setRegisteredEmail(formData.email);
        setShowVerifyEmail(true);
        setIsLoading(false);
        return;
      }

      // 2. Session varsa (email doğrulama kapalıysa) student profile oluştur
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          grade_level: formData.gradeLevel,
        });

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      router.push('/student/login');

    } catch (error) {
      console.error('Register error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Öğrenci Portalı
            </div>
          </div>

          {/* FORM KARTI */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">

            {showVerifyEmail ? (
              /* E-POSTA DOĞRULAMA BAŞARI EKRANI */
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-3">Kayıt Başarılı!</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Hesabınızı aktif hale getirmek için e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.
                </p>

                {registeredEmail && (
                  <div className="bg-[#FDFBF7]/80 backdrop-blur-xl rounded-xl p-4 mb-6 border border-[#D4AF37]/20">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                      Doğrulama e-postası gönderildi:
                    </p>
                    <p className="text-sm font-bold text-[#0F172A]">{registeredEmail}</p>
                  </div>
                )}

                <div className="space-y-3 text-left mb-8">
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
                    <p className="text-sm text-slate-600">Doğrulama bağlantısına tıklayın</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <p className="text-sm text-slate-600">Ardından giriş yapabilirsiniz</p>
                  </div>
                </div>

                <Link
                  href="/student/login"
                  className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold py-3.5 px-8 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg"
                >
                  Giriş Sayfasına Git <ChevronRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-slate-400 mt-6">
                  E-posta gelmediyse spam klasörünüzü kontrol edin.
                </p>
              </div>
            ) : (
            <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">Öğrenci Kaydı</h1>
              <p className="text-slate-500 text-sm">EduPremium hesabınızı oluşturun</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

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
                    placeholder="Adınız Soyadınız"
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

              {/* Eğitim Seviyesi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">Eğitim Seviyesi</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <select
                    required
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all appearance-none"
                  >
                    <option value="">Seçiniz</option>
                    {gradeLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
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

              {/* Şifre Tekrar */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">Şifre Tekrar</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    required
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
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
                disabled={isLoading || !acceptTerms || !acceptKvkk || !turnstileToken}
                className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg flex items-center justify-center gap-2 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Kayıt Yapılıyor...' : (
                  <>Kayıt Ol <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-slate-500 text-sm">
                Zaten hesabınız var mı? <Link href="/student/login" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors">Giriş Yapın</Link>
              </p>
              <p className="text-slate-400 text-xs mt-3">
                Öğretmen misiniz? <Link href="/teacher/register" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors">Başvuru Yapın</Link>
              </p>
            </div>
            </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
