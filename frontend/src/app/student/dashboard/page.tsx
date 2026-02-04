'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EDUCATION_LEVELS, LevelKey, parseSubject } from '@/lib/constants';
import { Search, Star, Bell, User, Calendar, Clock, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [featuredTeachers, setFeaturedTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');

  // Sayfalama
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/student/login');
      return;
    }
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (!studentProfile) {
      toast.error('Öğrenci profili bulunamadı');
      router.push('/student/login');
      return;
    }
    setStudentName(studentProfile.full_name || 'Öğrenci');
    await fetchTeachers();
    setIsLoading(false);
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .not('full_name', 'is', null);
    if (error) {
      console.error('Error:', error);
      return;
    }
    const allData = data || [];
    const now = new Date().toISOString();
    const featured = allData.filter(t => t.is_featured === true && t.featured_until && t.featured_until >= now);
    setFeaturedTeachers(featured);
    setTeachers(allData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/student/login');
  };

  const availableSubjects = useMemo(() => {
    if (!selectedLevel) return [];
    const levelData = EDUCATION_LEVELS[selectedLevel as LevelKey];
    return levelData ? levelData.subjects : [];
  }, [selectedLevel]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = teacher.full_name?.toLowerCase().includes(query);
        const titleMatch = teacher.title?.toLowerCase().includes(query);
        if (!nameMatch && !titleMatch) return false;
      }
      if (selectedLevel && selectedSubject) {
        const searchKey = selectedLevel + ':' + selectedSubject;
        if (!teacher.subjects || !teacher.subjects.includes(searchKey)) {
          return false;
        }
      } else if (selectedLevel) {
        const prefix = selectedLevel + ':';
        const hasLevel = teacher.subjects?.some(function(s: string) {
          return s.startsWith(prefix);
        });
        if (!hasLevel) return false;
      }
      if (priceRange) {
        const price = teacher.price_per_hour || 0;
        if (priceRange === '0-300' && price > 300) return false;
        if (priceRange === '300-500' && (price < 300 || price > 500)) return false;
        if (priceRange === '500-1000' && (price < 500 || price > 1000)) return false;
        if (priceRange === '1000+' && price < 1000) return false;
      }
      return true;
    });
  }, [teachers, searchQuery, selectedLevel, selectedSubject, priceRange]);

  // Sayfalama Hesabı
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const currentItems = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filtre değiştiğinde sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, selectedSubject, priceRange]);

  // Featured öğretmenleri seviyeye göre grupla
  const featuredByLevel = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    featuredTeachers.forEach((teacher) => {
      const levels = new Set<string>();
      if (teacher.subjects && teacher.subjects.length > 0) {
        teacher.subjects.forEach((s: string) => {
          const parsed = parseSubject(s);
          if (parsed) levels.add(parsed.level);
        });
      }
      if (levels.size === 0) {
        if (!grouped['diger']) grouped['diger'] = [];
        grouped['diger'].push(teacher);
      } else {
        levels.forEach((level) => {
          if (!grouped[level]) grouped[level] = [];
          grouped[level].push(teacher);
        });
      }
    });
    return grouped;
  }, [featuredTeachers]);

  const displaySubjectTags = (subjects: string[] | null) => {
    if (!subjects || subjects.length === 0) return null;
    const displayed = subjects.slice(0, 3).map((s) => {
      const parsed = parseSubject(s);
      if (parsed) return parsed.name;
      return s;
    });
    return (
      <div className="flex flex-wrap gap-1.5">
        {displayed.map((subject, idx) => (
          <span key={idx} className="text-[10px] font-bold bg-[#FDFBF7] text-slate-600 px-2 py-1 rounded border border-slate-100 whitespace-nowrap">
            {subject}
          </span>
        ))}
        {subjects.length > 3 && (
          <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded border border-slate-100">
            +{subjects.length - 3}
          </span>
        )}
      </div>
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedSubject('');
    setPriceRange('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* --- HEADER --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-[#D4AF37]">
              <span className="font-serif font-bold text-xl">E</span>
            </div>
            <span className="font-serif font-bold text-xl text-[#0F172A] hidden md:block">EduPremium</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/student/lessons" className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors hidden md:block">
              Derslerim
            </Link>
            <button className="relative p-2 text-slate-500 hover:text-[#D4AF37] transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#0F172A]">{studentName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Öğrenci</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-500">
                <User className="w-5 h-5" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">

        {/* --- 1. BÖLÜM: PREMİUM VİTRİN (KATEGORİ KATEGORİ) --- */}
        {featuredTeachers.length > 0 && !searchQuery && !selectedLevel && !priceRange && (
          <div className="mb-20">
            <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">Öne Çıkan Eğitmenler</h1>
            <p className="text-slate-500 mb-10">Alanında uzman, seçkin eğitmenlerimizi inceleyin.</p>

            {Object.entries(EDUCATION_LEVELS).map(([levelKey, levelData]) => {
              const categoryTeachers = featuredByLevel[levelKey];
              if (!categoryTeachers || categoryTeachers.length === 0) return null;

              return (
                <div key={levelKey} className="mb-12 border-b border-slate-100 pb-12 last:border-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-[#D4AF37] rounded-full"></div>
                    <h2 className="text-xl font-bold text-[#0F172A] font-serif">{levelData.label}</h2>
                    <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded font-bold uppercase tracking-wider">Özel Koleksiyon</span>
                  </div>

                  {/* PREMIUM KART GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryTeachers.map((teacher: any) => (
                      <div key={teacher.id} className="bg-white rounded-3xl p-5 border border-[#D4AF37]/30 shadow-xl shadow-[#D4AF37]/5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        {/* Altın Işık */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37]"></div>
                        <div className="absolute top-4 right-4 z-10">
                          <Star className="w-5 h-5 text-[#D4AF37] fill-current drop-shadow-sm" />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/20 flex-shrink-0">
                            {teacher.avatar_url ? (
                              <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                                <span className="text-xl font-bold text-[#D4AF37]">{teacher.full_name?.charAt(0) || '?'}</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-[#0F172A] leading-tight truncate">{teacher.full_name}</h3>
                            <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider mt-1 truncate">{teacher.title || 'Eğitmen'}</p>
                          </div>
                        </div>

                        {teacher.featured_headline && (
                          <p className="text-xs text-slate-500 italic mb-3 line-clamp-2 border-l-2 border-[#D4AF37]/30 pl-2">&ldquo;{teacher.featured_headline}&rdquo;</p>
                        )}

                        <div className="mb-4 overflow-hidden">
                          {displaySubjectTags(teacher.subjects)}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="font-bold text-[#0F172A]">
                            {teacher.hourly_rate_display || teacher.price_per_hour || '—'} <span className="text-xs font-normal text-slate-400">TL/s</span>
                          </div>
                          <Link
                            href={'/student/teacher/' + teacher.id}
                            className="px-4 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
                          >
                            İncele
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- 2. BÖLÜM: ARAMA VE FİLTRELEME --- */}
        <div id="search-section" className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] font-serif">Tüm Eğitmenlerde Ara</h2>
              <p className="text-slate-500 text-sm mt-1">
                <span className="font-bold text-[#0F172A]">{filteredTeachers.length}</span> eğitmen bulundu
              </p>
            </div>
            {(searchQuery || selectedLevel || selectedSubject || priceRange) && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#D4AF37] hover:text-[#0F172A] font-bold transition-colors"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          {/* FİLTRE ÇUBUĞU */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 bg-[#FDFBF7] p-4 rounded-2xl border border-slate-200">

            {/* 1. İsim ile Ara */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">İsim ile Ara</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Öğretmen adı..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[#0F172A] font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* 2. Eğitim Seviyesi */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Eğitim Seviyesi</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-[#0F172A] font-medium focus:border-[#D4AF37] outline-none"
                value={selectedLevel}
                onChange={(e) => { setSelectedLevel(e.target.value); setSelectedSubject(''); }}
              >
                <option value="">Tüm Seviyeler</option>
                {Object.entries(EDUCATION_LEVELS).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            {/* 3. Ders / Branş */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Ders / Branş</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-[#0F172A] font-medium focus:border-[#D4AF37] outline-none disabled:bg-slate-50 disabled:text-slate-400"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedLevel}
              >
                <option value="">Tüm Dersler</option>
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* 4. Fiyat Aralığı */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Fiyat Aralığı</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-[#0F172A] font-medium focus:border-[#D4AF37] outline-none"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="">Tümü</option>
                <option value="0-300">0 - 300 TL</option>
                <option value="300-500">300 - 500 TL</option>
                <option value="500-1000">500 - 1.000 TL</option>
                <option value="1000+">1.000 TL ve üzeri</option>
              </select>
            </div>

          </div>

          {/* ÖĞRETMEN LİSTE GRID */}
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {currentItems.map((teacher) => (
                <div key={teacher.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                      {teacher.avatar_url ? (
                        <img src={teacher.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-slate-400">{teacher.full_name?.charAt(0) || '?'}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#0F172A] text-sm group-hover:text-[#D4AF37] transition-colors truncate">{teacher.full_name}</h3>
                      <p className="text-xs text-slate-500 truncate">{teacher.title || 'Eğitmen'}</p>
                    </div>
                  </div>

                  <div className="mb-4 h-8 overflow-hidden">
                    {displaySubjectTags(teacher.subjects)}
                  </div>

                  {teacher.bio && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{teacher.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-sm font-bold text-[#0F172A]">{teacher.hourly_rate_display || teacher.price_per_hour || '—'}</span>
                      <span className="text-xs text-slate-400"> TL/s</span>
                    </div>
                    <Link
                      href={'/student/teacher/' + teacher.id}
                      className="px-4 py-2 bg-white border border-[#0F172A] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#0F172A] hover:text-white transition-colors"
                    >
                      İncele
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center mb-12">
              <p className="text-slate-400 font-medium mb-4">Aramanıza uygun eğitmen bulunamadı</p>
              <button
                onClick={clearFilters}
                className="text-sm text-[#D4AF37] hover:text-[#0F172A] font-bold transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}

          {/* SAYFALAMA */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-bold">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
