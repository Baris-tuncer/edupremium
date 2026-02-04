'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Award, ArrowRight } from 'lucide-react';

// ============================================
// INTERFACES (Same as /teachers page)
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

// ============================================
// ICONS (Same as /teachers page)
// ============================================
const DiamondIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8960c" strokeWidth="2">
    <path d="M6 3h12l4 6-10 13L2 9z" fill="#d4af37" fillOpacity="0.15" />
    <path d="M6 3h12l4 6-10 13L2 9z" />
    <path d="M2 9h20" />
    <path d="M10 3l-2 6 4 13 4-13-2-6" />
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="#d4af37">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedBadge = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#d4af37" stroke="#b8960c" strokeWidth="1">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ============================================
// FEATURED CARD (Same as /teachers page)
// ============================================
const FeaturedCard = ({ teacher, index }: { teacher: FeaturedTeacher; index: number }) => {
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
    <Link
      href={'/teachers/' + teacher.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 w-[280px] transition-all duration-300 block"
      style={{ transform: hovered ? 'translateY(-4px)' : 'translateY(0)' }}
    >
      <div className={`rounded-2xl p-[2px] transition-all duration-300 ${
        hovered
          ? 'bg-gradient-to-br from-gold-500 via-gold-300 to-gold-500 shadow-xl'
          : 'bg-gradient-to-br from-navy-200/30 via-gold-400/30 to-navy-200/30 shadow-md'
      }`}>
        <div className="bg-white rounded-[14px] p-5 h-full flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-[100px] h-[100px] rounded-full bg-gold-100/20" />

          {/* Badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-gold-50 border border-gold-200/40 rounded-full px-2.5 py-0.5 w-fit">
            <DiamondIcon />
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Editörün Seçimi</span>
          </div>

          {/* Profile */}
          <div className="flex gap-3 items-center">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarGradients[index % 5]} flex items-center justify-center text-white text-base font-bold shadow flex-shrink-0`}>
              {teacher.avatar_url ? (
                <img src={teacher.avatar_url} alt={teacher.full_name} className="w-full h-full rounded-xl object-cover" />
              ) : initials}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-bold text-navy-900 leading-tight truncate">{teacher.full_name}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <StarIcon />
                <span className="text-xs font-bold text-amber-700">{teacher.rating || '4.5'}</span>
              </div>
            </div>
          </div>

          {/* Headline */}
          {teacher.featured_headline && (
            <p className="text-[13px] font-medium text-navy-700 italic border-l-[3px] border-gold-400 pl-2.5 leading-relaxed line-clamp-2">
              &ldquo;{teacher.featured_headline}&rdquo;
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-base font-extrabold text-navy-900">{teacher.experience_years || '-'}</div>
              <div className="text-[10px] text-slate-500 font-medium">Yıl Deneyim</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-center flex flex-col items-center justify-center gap-0.5">
              {teacher.university ? (
                <>
                  <div className="text-[11px] font-bold text-navy-900 leading-tight truncate w-full">{teacher.university}</div>
                  <div className="text-[9px] text-slate-500 font-medium">Mezun</div>
                </>
              ) : (
                <>
                  <VerifiedBadge />
                  <div className="text-[10px] text-amber-700 font-bold">Onaylı</div>
                </>
              )}
            </div>
          </div>

          {/* Subjects */}
          <div className="flex gap-1 flex-wrap">
            {subjectDisplay.map((s, i) => (
              <span key={i} className="bg-navy-50 border border-navy-100 text-navy-700 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                {s}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className={`w-full py-2.5 rounded-xl text-center text-[13px] font-bold transition-all duration-300 ${
            hovered
              ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900'
              : 'bg-gradient-to-r from-navy-900 to-navy-700 text-white'
          }`}>
            {hovered ? 'Randevu Al' : 'Profili İncele'}
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================
// FEATURED TEACHERS SECTION
// ============================================
const FeaturedTeachers = () => {
  const [teachers, setTeachers] = useState<FeaturedTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('teacher_profiles')
          .select('*')
          .eq('is_featured', true)
          .gte('featured_until', now);

        if (error) {
          console.error('Error:', error);
          return;
        }

        const shuffled = (data || []).sort(() => Math.random() - 0.5);
        setTeachers(shuffled);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Don't render anything if no featured teachers
  if (!loading && teachers.length === 0) return null;

  return (
    <section className="relative py-24 overflow-hidden">

      {/* --- ARKA PLAN (Kütüphane + Koyu Perde) --- */}
      <div className="absolute inset-0 z-0">
        <div
           className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
           style={{ backgroundImage: `url('/hero-library.jpg')` }}
        />
        <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-[2px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.15),_transparent_70%)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* Başlık */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-6 bg-[#D4AF37]/5 backdrop-blur-sm">
            <Award className="w-4 h-4" /> Editörün Seçimi
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white font-serif mb-6 leading-tight">
            Seçkin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FDFBF7]">Eğitmenler</span>
          </h2>
          <p className="text-slate-300 text-lg font-light max-w-2xl mx-auto">
            Alanında uzman, titizlikle seçilmiş ve öğrenci başarısını kanıtlamış eğitmenlerimiz.
          </p>
        </div>

        {/* Kartlar */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex justify-center gap-6 flex-wrap">
            {teachers.map((teacher, index) => (
              <FeaturedCard key={teacher.id} teacher={teacher} index={index} />
            ))}
          </div>
        )}

        {/* Alt Buton */}
        <div className="text-center mt-16">
          <Link
            href="/teachers"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#D4AF37] text-[#0F172A] font-bold rounded-full hover:bg-white transition-colors shadow-xl"
          >
            Tüm Eğitmenleri Gör
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedTeachers;
