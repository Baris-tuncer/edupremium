'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { EDUCATION_LEVELS, LevelKey } from '@/lib/constants';
import { calculateDisplayPrice } from '@/lib/price-calculator';

// ============================================
// INTERFACES
// ============================================
interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subjects: string[];
  base_price: number;
  hourly_rate_display: number | null;  // Veliye gösterilecek fiyat (öncelikli)
  bio: string | null;
  experience_years: number | null;
  completed_lessons_count: number;
  is_verified: boolean;
  avatar_url: string | null;
  rating: number | null;
}

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
  hourly_rate_display: number | null;
  base_price: number | null;
}

// ============================================
// ICONS
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
// FEATURED TEACHER CARD
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
        <div className="bg-white/80 backdrop-blur-xl rounded-[14px] p-5 h-full flex flex-col gap-4 relative overflow-hidden">
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

          {/* Price */}
          <div className="bg-gradient-to-r from-amber-50 to-gold-50 border border-gold-200/40 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-navy-900">
              ₺{(teacher.hourly_rate_display || calculateDisplayPrice(teacher.base_price || 0, 0.25)).toLocaleString('tr-TR')}
            </div>
            <div className="text-[10px] text-slate-500">/saat <span className="text-slate-400">(KDV Dahil)</span></div>
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
const FeaturedTeachersSection = () => {
  const [teachers, setTeachers] = useState<FeaturedTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollRef.current.scrollLeft;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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

  if (loading) return null;
  if (teachers.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-gold-50 border border-gold-200/30 rounded-full px-4 py-1.5">
          <DiamondIcon />
          <span className="text-[13px] font-bold text-amber-700 uppercase tracking-wider">Editörün Seçimi</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-gold-200 to-transparent" />
      </div>

      {/* Cards with Navigation */}
      <div className="relative px-12">
        {/* Sol Ok */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#0F172A] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center rounded-full hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Sağ Ok */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#0F172A] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center rounded-full hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {teachers.map((teacher, index) => (
            <FeaturedCard key={teacher.id} teacher={teacher} index={index} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mt-8 mb-2">
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tüm Öğretmenler</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    </div>
  );
};

// ============================================
// TEACHERS CONTENT
// ============================================
function TeachersContent() {
  const searchParams = useSearchParams();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    fetchTeachers();
  }, [selectedLevel, selectedSubject, searchTerm, sortBy]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('teacher_profiles')
        .select('*')
        .eq('is_verified', true).eq('is_approved', true);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching teachers:', error);
        return;
      }

      let filteredTeachers = data || [];

      if (selectedLevel && selectedSubject) {
        const searchKey = selectedLevel + ':' + selectedSubject;
        filteredTeachers = filteredTeachers.filter(t => 
          t.subjects?.some((s: string) => s === searchKey)
        );
      } else if (selectedLevel) {
        filteredTeachers = filteredTeachers.filter(t => 
          t.subjects?.some((s: string) => s.startsWith(selectedLevel + ':'))
        );
      } else if (selectedSubject) {
        filteredTeachers = filteredTeachers.filter(t => 
          t.subjects?.some((s: string) => s.endsWith(':' + selectedSubject))
        );
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredTeachers = filteredTeachers.filter(t => 
          t.full_name?.toLowerCase().includes(term)
        );
      }

      if (sortBy === 'price-low') {
        filteredTeachers.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
      } else if (sortBy === 'price-high') {
        filteredTeachers.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
      } else if (sortBy === 'experience') {
        filteredTeachers.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
      }

      setTeachers(filteredTeachers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedLevel('');
    setSelectedSubject('');
    setSearchTerm('');
    setSortBy('recommended');
  };

  const currentSubjects = selectedLevel 
    ? EDUCATION_LEVELS[selectedLevel as LevelKey]?.subjects || []
    : [];

  const getSubjectDisplay = (subjects: string[]) => {
    if (!subjects || subjects.length === 0) return [];
    return subjects.map(s => {
      const parts = s.split(':');
      return parts.length === 2 ? parts[1] : s;
    }).slice(0, 3);
  };

  const getLevelDisplay = (subjects: string[]) => {
    if (!subjects || subjects.length === 0) return '';
    const levels = new Set<string>();
    subjects.forEach(s => {
      const parts = s.split(':');
      if (parts.length === 2) {
        const levelData = EDUCATION_LEVELS[parts[0] as LevelKey];
        if (levelData) levels.add(levelData.label);
      }
    });
    return Array.from(levels).join(', ');
  };

  return (
    <>
      {/* Featured Teachers */}
      <FeaturedTeachersSection />

      {/* Regular listing */}
      <div className="flex gap-8">
        <aside className="w-72 shrink-0 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-5 shadow-2xl shadow-[#0F172A]/5">
            <h3 className="font-semibold text-[#0F172A] mb-4">Öğretmen Ara</h3>
            <input
              type="text"
              placeholder="İsim ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-5 shadow-2xl shadow-[#0F172A]/5">
            <h3 className="font-semibold text-[#0F172A] mb-4">Eğitim Seviyesi</h3>
            <select
              value={selectedLevel}
              onChange={(e) => { setSelectedLevel(e.target.value); setSelectedSubject(''); }}
              className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            >
              <option value="">Tümü</option>
              {Object.entries(EDUCATION_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          {selectedLevel && currentSubjects.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-5 shadow-2xl shadow-[#0F172A]/5">
              <h3 className="font-semibold text-[#0F172A] mb-4">Ders</h3>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              >
                <option value="">Tümü</option>
                {currentSubjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          )}

          <button onClick={clearFilters} className="w-full py-3 border-2 border-[#0F172A]/20 rounded-xl font-bold text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all">
            Filtreleri Temizle
          </button>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600">
              <span className="font-semibold text-navy-900">{teachers.length}</span> öğretmen bulundu
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-2 px-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            >
              <option value="recommended">Önerilen</option>
              <option value="price-low">Fiyat: Düşükten Yükseğe</option>
              <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
              <option value="experience">Deneyim</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center shadow-2xl shadow-[#0F172A]/5">
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Öğretmen bulunamadı</h3>
              <p className="text-slate-500">Filtreleri değiştirerek tekrar deneyin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teachers.map((teacher) => {
                // Önce hourly_rate_display varsa onu kullan, yoksa hesapla
                const parentPrice = teacher.hourly_rate_display || calculateDisplayPrice(teacher.base_price || 0, 0.25);
                const initials = teacher.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';
                const subjectDisplay = getSubjectDisplay(teacher.subjects || []);
                const levelDisplay = getLevelDisplay(teacher.subjects || []);

                return (
                  <Link 
                    href={'/teachers/' + teacher.id} 
                    key={teacher.id} 
                    className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 flex gap-6 hover:bg-white hover:shadow-lg hover:shadow-[#D4AF37]/10 transition-all duration-300"
                  >
                    <div className="shrink-0">
                      {teacher.avatar_url ? (
                        <img 
                          src={teacher.avatar_url} 
                          alt={teacher.full_name} 
                          className="w-24 h-24 rounded-2xl object-cover" 
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-navy-800 to-navy-600 rounded-2xl flex items-center justify-center text-white text-2xl font-semibold">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-navy-900 mb-1">
                            {teacher.full_name}
                          </h3>
                          <p className="text-slate-500">{levelDisplay || 'Öğretmen'}</p>
                        </div>
                      </div>

                      {teacher.bio && (
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{teacher.bio}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        {teacher.experience_years && (
                          <span className="text-slate-500">{teacher.experience_years} yıl deneyim</span>
                        )}
                        {teacher.completed_lessons_count > 0 && (
                          <span className="text-slate-500">{teacher.completed_lessons_count} ders</span>
                        )}
                        <div className="flex gap-2">
                          {subjectDisplay.map((subject, i) => (
                            <span key={i} className="bg-navy-100 text-navy-700 px-2 py-1 rounded text-xs">{subject}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right flex flex-col justify-between">
                      <div>
                        <div className="text-2xl font-bold text-navy-900">
                          ₺{parentPrice.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-sm text-slate-500">/saat</div>
                        <div className="text-[10px] text-slate-400">(KDV Dahil)</div>
                      </div>
                      <span className="bg-[#0F172A] text-white font-bold py-2 px-4 text-sm rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all">
                        Profili Gör
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function TeachersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen relative bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">
        {/* --- ARKA PLAN --- */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')` }}></div>
          <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
        </div>
        <div className="relative z-10 pt-28 pb-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] font-serif mb-4">Öğretmenler</h1>
            <p className="text-lg text-slate-600">
              Alanında uzman, titizlikle seçilmiş öğretmenlerimizle tanışın.
            </p>
          </div>
          <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>}>
            <TeachersContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
