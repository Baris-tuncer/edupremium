'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { EDUCATION_LEVELS, LevelKey } from '@/lib/constants';

// ============================================
// FEATURED CATEGORIES & ICONS
// ============================================
const CategoryIcons: Record<string, React.FC<{active?: boolean}>> = {
  ilkokul: ({active}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  ),
  ortaokul: ({active}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
    </svg>
  ),
  lise: ({active}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M12 6v7" /><path d="M9 10h6" />
    </svg>
  ),
  lgs: ({active}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  'tyt-ayt': ({active}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
    </svg>
  ),
  'yabanci-dil': ({active}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
};

const FEATURED_CATEGORIES = [
  { key: 'ilkokul', label: 'İlkokul' },
  { key: 'ortaokul', label: 'Ortaokul' },
  { key: 'lise', label: 'Lise' },
  { key: 'lgs', label: 'LGS Hazırlık' },
  { key: 'tyt-ayt', label: 'TYT-AYT' },
  { key: 'yabanci-dil', label: 'Yabancı Dil' },
];

// ============================================
// HERO SECTION - Premium Dark Academia Style
// ============================================
const HeroSection = () => (
  <section className="relative min-h-screen bg-[#1a1a2e] flex items-center justify-center p-3 pt-20">
    {/* Grid Pattern Background */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }}
    />

    {/* Floating Hero Card */}
    <div className="relative w-full h-[calc(100vh-5rem)] rounded-[2rem] overflow-hidden shadow-2xl">
      {/* Background Image - Library/Study Room */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2940&auto=format&fit=crop')`,
        }}
      />

      {/* Subtle Cream Overlay - More transparent to show image */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(253,251,247,0.88) 0%, rgba(253,251,247,0.7) 50%, rgba(253,251,247,0.4) 100%)`,
        }}
      />

      {/* Content Container - CENTERED */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
        {/* Logo - Top Center */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#0F172A] tracking-tight">EduPremium</span>
        </div>

        {/* Headline - Centered */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] mb-6 font-serif leading-[1.15] tracking-tight max-w-3xl">
          Eğitimde<br />
          Mükemmelliğe<br />
          Giden Yol
        </h1>

        {/* Subtext - Centered */}
        <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
          Alanında uzman, titizlikle seçilmiş öğretmenlerle birebir online ders deneyimi.
          Çocuğunuzun akademik başarısı için en doğru adım.
        </p>

        {/* Buttons - Centered */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-[#1E293B] transition-all duration-300 shadow-lg shadow-[#0F172A]/20 active:scale-[0.98]"
          >
            Hemen Başla
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/teachers"
            className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-[#0F172A] px-8 py-3.5 rounded-lg text-base font-semibold border border-[#0F172A]/20 hover:bg-white hover:border-[#0F172A]/40 transition-all duration-300 active:scale-[0.98]"
          >
            Öğretmenleri Keşfet
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#0F172A]/70 uppercase tracking-widest">Keşfet</span>
          <svg className="w-4 h-4 text-[#0F172A]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// EDITORS CHOICE SECTION
// ============================================
interface FeaturedTeacher {
  id: string;
  full_name: string;
  featured_headline: string | null;
  rating: number | null;
  experience_years: number | null;
  university: string | null;
  subjects: string[];
  avatar_url: string | null;
  is_verified: boolean;
  featured_category: string | null;
}

const DiamondIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8960c" strokeWidth="2">
    <path d="M6 3h12l4 6-10 13L2 9z" fill="#d4af37" fillOpacity="0.15" />
    <path d="M6 3h12l4 6-10 13L2 9z" />
    <path d="M2 9h20" />
    <path d="M10 3l-2 6 4 13 4-13-2-6" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="#d4af37">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedBadge = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#d4af37" stroke="#b8960c" strokeWidth="1">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TeacherCard = ({ teacher, index }: { teacher: FeaturedTeacher; index: number }) => {
  const router = useRouter();

  const subjectDisplay = (teacher.subjects || []).map(s => {
    const parts = s.split(':');
    return parts.length === 2 ? parts[1] : s;
  }).slice(0, 2).join(' • ');

  const handleClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirect=/teachers/' + teacher.id);
    } else {
      router.push('/teachers/' + teacher.id);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[#D4AF37]/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(212,175,55,0.15)] transition-all duration-300 mt-8 flex flex-col items-center">

      {/* Profil Fotoğrafı (Taşan Kısım) */}
      <div className="absolute -top-12">
        <div className="relative w-24 h-24 rounded-full p-1 bg-white shadow-xl ring-1 ring-[#D4AF37]/30 group-hover:ring-[#D4AF37] transition-all duration-300">
          {teacher.avatar_url ? (
            <img src={teacher.avatar_url} alt={teacher.full_name} className="rounded-full object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5080] flex items-center justify-center text-white text-2xl font-bold">
              {teacher.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
            </div>
          )}
          {/* Puan Rozeti */}
          <div className="absolute bottom-0 right-0 bg-[#D4AF37] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
            {teacher.rating || '5.0'}
          </div>
        </div>
      </div>

      {/* Kart İçeriği */}
      <div className="pt-16 pb-6 px-6 text-center w-full flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-1 group-hover:text-[#D4AF37] transition-colors">
          {teacher.full_name}
        </h3>
        <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-4">
          {subjectDisplay || 'Uzman Öğretmen'}
        </p>

        {/* Yıldızlar */}
        <div className="flex justify-center items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 20 20" className={i < Math.floor(teacher.rating || 5) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-gray-200 text-gray-200'}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-400 ml-1 font-medium">{teacher.experience_years || 0} yıl</span>
        </div>

        {/* Headline/Bio */}
        {teacher.featured_headline && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6 font-light border-t border-gray-50 pt-4">
            {teacher.featured_headline}
          </p>
        )}

        {/* Buton */}
        <button
          onClick={handleClick}
          className="mt-auto w-full py-3 bg-[#0F172A] text-white text-sm font-medium rounded-xl hover:bg-[#1E293B] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#0F172A]/20"
        >
          Profili İncele
        </button>
      </div>
    </div>
  );
};

const EditorsChoiceSection = () => {
  const [activeCategory, setActiveCategory] = useState('lgs');
  const [teachers, setTeachers] = useState<FeaturedTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchFeaturedTeachers = useCallback(async (category: string) => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('is_featured', true)
        .eq('featured_category', category)
        .gte('featured_until', now)
        .limit(5);

      if (error) {
        console.error('Error:', error);
        return;
      }

      // Random shuffle for fairness
      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      setTeachers(shuffled);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedTeachers(activeCategory);
  }, [activeCategory, fetchFeaturedTeachers]);

  const handleCategoryChange = (key: string) => {
    if (key === activeCategory) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveCategory(key);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  return (
    <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
      {/* Arka Plan Deseni */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B49120] text-xs font-bold tracking-widest uppercase mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>EDİTÖRÜN SEÇİMİ</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6 font-serif tracking-tight">
            Alanında En İyi Öğretmenler
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            Titizlikle değerlendirilen, minimum 4.5 puan ve yüksek deneyime sahip,
            öğrenci başarısını kanıtlamış uzman eğitmenlerimiz.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {FEATURED_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  ${isActive
                    ? 'bg-[#0F172A] text-white shadow-xl shadow-[#0F172A]/20 scale-105'
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-[#D4AF37] hover:text-[#0F172A]'
                  }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-20 transition-all duration-200 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="col-span-full text-center py-16 max-w-md mx-auto">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Bu kategoride henüz öğretmen yok</h3>
              <p className="text-gray-500 text-sm">Yakında bu alanda da uzman öğretmenlerimiz yer alacak.</p>
            </div>
          ) : (
            teachers.map((teacher, index) => (
              <TeacherCard key={teacher.id} teacher={teacher} index={index} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FEATURES SECTION
// ============================================
const FeaturesSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Seçkin Öğretmenler',
      description: 'Titiz bir değerlendirme sürecinden geçmiş, alanında uzman öğretmenler. Her öğretmen davet usulü sisteme dahil edilir.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Profesyonel Altyapı',
      description: 'Yüksek kaliteli video altyapısı ile kesintisiz online dersler. Otomatik ders bağlantısı oluşturma ve hatırlatmalar.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Güvenli Ödeme',
      description: '3D Secure kredi kartı ile güvenli ödeme. Şeffaf fiyatlandırma, gizli ücret yok.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Esnek Zamanlama',
      description: 'Öğretmen müsaitlik takvimine göre size uygun saati seçin. 7/24 randevu alma imkanı.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Anlık Bildirimler',
      description: 'Ders hatırlatmaları, randevu onayları ve ilerleme raporları e-posta ile anında iletilir.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Kişisel Yaklaşım',
      description: 'Öğrencinin seviyesine ve hedeflerine göre özelleştirilmiş ders planları. Birebir ilgi ve takip.',
    },
  ];

  return (
    <section className="section bg-white">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-gold-600 uppercase tracking-wider mb-4">
            Neden Biz?
          </span>
          <h2 className="mb-6">Eğitimde Fark Yaratan Özellikler</h2>
          <p className="text-lg text-slate-600">
            Geleneksel özel ders deneyimini modern teknoloji ile birleştirerek 
            eğitimde yeni bir standart belirliyoruz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-2xl border border-slate-100 hover:border-navy-100 hover:bg-navy-50/30 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-navy-100 rounded-2xl flex items-center justify-center text-navy-600 mb-6 group-hover:bg-navy-900 group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// HOW IT WORKS SECTION
// ============================================
const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Öğretmen Seçin',
      description: 'İhtiyacınıza uygun branşta, değerlendirmeleri inceleyerek öğretmeninizi belirleyin.',
    },
    {
      number: '02',
      title: 'Randevu Alın',
      description: 'Öğretmenin müsait olduğu saatlerden size uygun olanı seçin ve güvenli ödeme ile onaylayın.',
    },
    {
      number: '03',
      title: 'Derse Katılın',
      description: 'Ders saatinde otomatik oluşturulan video bağlantısı ile online dersinize tek tıkla katılın.',
    },
    {
      number: '04',
      title: 'İlerlemeyi Takip Edin',
      description: 'Ders sonrası raporlarla öğrencinizin gelişimini takip edin.',
    },
  ];

  return (
    <section className="section bg-slate-50">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-gold-600 uppercase tracking-wider mb-4">
            Nasıl Çalışır?
          </span>
          <h2 className="mb-6">4 Kolay Adımda Başlayın</h2>
          <p className="text-lg text-slate-600">
            Birkaç dakika içinde ilk dersinizi ayarlayabilirsiniz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-navy-200 to-transparent z-0" />
              )}
              <div className="relative bg-white rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300">
                <div className="font-display text-5xl font-bold text-navy-100 mb-4">
                  {step.number}
                </div>
                <h3 className="font-display text-xl font-semibold text-navy-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// SUBJECTS SECTION
// ============================================
const SubjectsSection = () => {
  const subjects = [
    { name: 'Matematik', icon: '∑', href: '/teachers?level=lise&subject=Matematik' },
    { name: 'Fizik', icon: 'ƒ', href: '/teachers?level=lise&subject=Fizik' },
    { name: 'Kimya', icon: 'Ω', href: '/teachers?level=lise&subject=Kimya' },
    { name: 'Biyoloji', icon: 'β', href: '/teachers?level=lise&subject=Biyoloji' },
    { name: 'Türkçe', icon: 'A', href: '/teachers?level=ortaokul&subject=Türkçe' },
    { name: 'İngilizce', icon: 'EN', href: '/teachers?level=yabanci_dil&subject=İngilizce' },
    { name: 'LGS Hazırlık', icon: 'Δ', href: '/dersler' },
    { name: 'TYT-AYT', icon: 'π', href: '/dersler' },
  ];

  return (
    <section className="section bg-white">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <span className="inline-block text-sm font-semibold text-gold-600 uppercase tracking-wider mb-4">
              Branşlar
            </span>
            <h2>Tüm Dersler İçin Uzman Öğretmenler</h2>
          </div>
          <Link href="/courses" className="btn-ghost mt-4 lg:mt-0">
            Tüm Branşları Gör
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((subject, index) => (
            <Link
              key={index}
              href={subject.href}
              className="group card-interactive p-6"
            >
              <div className="text-3xl mb-4 font-display text-navy-300 group-hover:text-navy-600 transition-colors">{subject.icon}</div>
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-1 group-hover:text-navy-700">
                {subject.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA SECTION
// ============================================
const CTASection = () => (
  <section className="section bg-gradient-navy relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
    
    <div className="container-narrow relative z-10 text-center">
      <h2 className="text-white mb-6">
        Çocuğunuzun Geleceğine Yatırım Yapın
      </h2>
      <p className="text-xl text-navy-200 mb-10 max-w-2xl mx-auto">
        Akademik başarıda fark yaratmak için ilk adımı bugün atın. 
        Uzman öğretmenlerimiz öğrencinizi bekliyor.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/student/register" className="btn-gold text-lg px-8 py-4">
          Ücretsiz Kayıt Ol
        </Link>
        <Link href="/teachers" className="btn-secondary text-lg px-8 py-4 !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
          Öğretmenleri İncele
        </Link>
      </div>
    </div>
  </section>
);

// ============================================
// MAIN PAGE
// ============================================
export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <EditorsChoiceSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SubjectsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
