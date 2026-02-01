'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
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
// HERO SECTION
// ============================================
const HeroSection = () => (
  <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-navy-50" />
    <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-navy-100/30 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-100/40 rounded-full blur-3xl" />
    
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a365d' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }} />

    <div className="container-wide relative z-10">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-50 rounded-full mb-6 animate-fade-up">
          <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse-soft" />
          <span className="text-sm font-medium text-navy-700">Türkiye&apos;nin Premium Eğitim Platformu</span>
        </div>
        
        <h1 className="mb-6 animate-fade-up delay-100">
          Eğitimde <span className="text-gradient">Mükemmelliğe</span> Giden Yol
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed animate-fade-up delay-200 max-w-2xl mx-auto">
          Alanında uzman, titizlikle seçilmiş öğretmenlerle birebir online ders deneyimi. 
          Çocuğunuzun akademik başarısı için en doğru adım.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up delay-300">
          <Link href="/register" className="btn-primary text-lg px-8 py-4">
            Hemen Başla
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="/teachers" className="btn-secondary text-lg px-8 py-4">
            Öğretmenleri Keşfet
          </Link>
        </div>
      </div>
    </div>

    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
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
  const [hovered, setHovered] = useState(false);
  const initials = teacher.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';
  const avatarGradients = [
    'from-[#1e3a5f] to-[#2a5080]',
    'from-[#0d1b2a] to-[#1e3a5f]',
    'from-[#2a5080] to-[#3a6098]',
    'from-[#1a3050] to-[#2a5080]',
    'from-[#0d1b2a] to-[#2a5080]',
  ];

  const subjectDisplay = (teacher.subjects || []).map(s => {
    const parts = s.split(':');
    return parts.length === 2 ? parts[1] : s;
  }).slice(0, 3);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 w-[320px] transition-all duration-400 cursor-pointer"
      style={{
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
    >
      <div className={`rounded-[20px] p-[2px] transition-all duration-400 ${
        hovered 
          ? 'bg-gradient-to-br from-gold-500 via-gold-300 to-gold-500 shadow-2xl' 
          : 'bg-gradient-to-br from-navy-200/30 via-gold-400/30 to-navy-200/30 shadow-lg'
      }`}>
        <div className="bg-white rounded-[18px] p-7 h-full flex flex-col gap-5 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-[120px] h-[120px] rounded-full bg-gold-100/20" />

          {/* Badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-gold-50 border border-gold-200/40 rounded-full px-3 py-1 w-fit">
            <DiamondIcon />
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Editörün Seçimi</span>
          </div>

          {/* Profile */}
          <div className="flex gap-4 items-start">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarGradients[index % 5]} flex items-center justify-center text-white text-[22px] font-bold shadow-md flex-shrink-0`}>
              {teacher.avatar_url ? (
                <img src={teacher.avatar_url} alt={teacher.full_name} className="w-full h-full rounded-2xl object-cover" />
              ) : initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-bold text-navy-900 leading-tight mb-1">{teacher.full_name}</h3>
              <div className="flex items-center gap-1">
                <StarIcon />
                <span className="text-sm font-bold text-amber-700">{teacher.rating || '4.5'}</span>
              </div>
            </div>
          </div>

          {/* Headline */}
          {teacher.featured_headline && (
            <p className="text-sm font-medium text-navy-700 italic border-l-[3px] border-gold-400 pl-3 leading-relaxed">
              &ldquo;{teacher.featured_headline}&rdquo;
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-navy-900">{teacher.experience_years || '-'}</div>
              <div className="text-[11px] text-slate-500 font-medium">Yıl Deneyim</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-0.5">
              {teacher.university ? (
                <>
                  <div className="text-[12px] font-bold text-navy-900 leading-tight">{teacher.university}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Mezun</div>
                </>
              ) : (
                <>
                  <VerifiedBadge />
                  <div className="text-[11px] text-amber-700 font-bold">Onaylı Öğretmen</div>
                </>
              )}
            </div>
          </div>

          {/* Subjects */}
          <div className="flex gap-1.5 flex-wrap">
            {subjectDisplay.map((s, i) => (
              <span key={i} className="bg-navy-50 border border-navy-100 text-navy-700 rounded-lg px-2.5 py-1 text-[12px] font-semibold">
                {s}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={'/teachers/' + teacher.id}
            className={`w-full py-3.5 rounded-xl text-center text-sm font-bold transition-all duration-300 block ${
              hovered
                ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900'
                : 'bg-gradient-to-r from-navy-900 to-navy-700 text-white'
            }`}
          >
            {hovered ? 'Randevu Al' : 'Profili İncele'}
          </Link>
        </div>
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
        .select('id, full_name, featured_headline, rating, experience_years, university, subjects, avatar_url, is_verified, featured_category')
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
    <section className="section bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-gold-50 border border-gold-200/30 rounded-full px-5 py-2 mb-6">
            <DiamondIcon />
            <span className="text-[13px] font-bold text-amber-700 uppercase tracking-[1.5px]">Editörün Seçimi</span>
            <DiamondIcon />
          </div>

          <h2 className="mb-4">
            Alanında <span className="text-gradient">En İyi</span> Öğretmenler
          </h2>

          <p className="text-lg text-slate-600">
            Titizlikle değerlendirilen, minimum 4.5 puan ve yüksek deneyime sahip uzman öğretmenlerimiz.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 justify-center flex-wrap mb-10">
          <div className="inline-flex gap-1.5 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
            {FEATURED_CATEGORIES.map((cat) => {
              const Icon = CategoryIcons[cat.key];
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-navy-900 to-navy-700 text-white shadow-md'
                      : 'text-slate-500 hover:text-navy-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon active={isActive} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        <div className={`flex gap-6 justify-center flex-wrap transition-all duration-200 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Bu kategoride henüz öğretmen yok</h3>
              <p className="text-slate-500 text-sm">Yakında bu alanda da uzman öğretmenlerimiz yer alacak.</p>
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
          <Link href="/dersler" className="btn-ghost mt-4 lg:mt-0">
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
        <Link href="/register" className="btn-gold text-lg px-8 py-4">
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