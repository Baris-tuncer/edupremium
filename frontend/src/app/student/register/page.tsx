'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Star, User, Mail, Lock, Phone, GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function StudentRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    gradeLevel: ''
  });

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
      // 1. Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        toast.error(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Kullanıcı oluşturulamadı');
        setIsLoading(false);
        return;
      }

      // 2. Student profile oluştur
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
        toast.error('Profil oluşturulamadı: ' + profileError.message);
        setIsLoading(false);
        return;
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
    <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7] overflow-hidden">

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
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
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
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
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
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
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
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all appearance-none"
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

          </div>
        </div>
      </div>
    </div>
  );
}
