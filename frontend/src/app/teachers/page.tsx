'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { EDUCATION_LEVELS, LevelKey } from '@/lib/constants';

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subjects: string[];
  base_price: number;
  bio: string | null;
  experience_years: number | null;
  completed_lessons_count: number;
  is_verified: boolean;
  avatar_url: string | null;
  rating: number | null;
}

const calculateParentPrice = (basePrice: number) => {
  const commission = basePrice * 0.20;
  const subtotal = basePrice + commission;
  const tax = subtotal * 0.20;
  return Math.round((subtotal + tax) / 100) * 100;
};

export default function TeachersPage() {
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
        .eq('is_verified', true);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching teachers:', error);
        return;
      }

      let filteredTeachers = data || [];

      // Filter by level and subject
      if (selectedLevel && selectedSubject) {
        const searchKey = `${selectedLevel}:${selectedSubject}`;
        filteredTeachers = filteredTeachers.filter(t => 
          t.subjects?.some((s: string) => s === searchKey)
        );
      } else if (selectedLevel) {
        filteredTeachers = filteredTeachers.filter(t => 
          t.subjects?.some((s: string) => s.startsWith(`${selectedLevel}:`))
        );
      } else if (selectedSubject) {
        filteredTeachers = filteredTeachers.filter(t => 
          t.subjects?.some((s: string) => s.endsWith(`:${selectedSubject}`))
        );
      }

      // Search by name
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredTeachers = filteredTeachers.filter(t => 
          t.full_name?.toLowerCase().includes(term)
        );
      }

      // Sorting
      if (sortBy === 'price-low') {
        filteredTeachers.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
      } else if (sortBy === 'price-high') {
        filteredTeachers.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
      } else if (sortBy === 'rating') {
        filteredTeachers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
      <Header />
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container-wide">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Öğretmenler</h1>
            <p className="text-lg text-slate-600">
              Alanında uzman, titizlikle seçilmiş öğretmenlerimizle tanışın.
            </p>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="w-72 shrink-0 space-y-6">
              <div className="card p-5">
                <h3 className="font-semibold text-navy-900 mb-4">Öğretmen Ara</h3>
                <input
                  type="text"
                  placeholder="İsim ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-navy-900 mb-4">Eğitim Seviyesi</h3>
                <select
                  value={selectedLevel}
                  onChange={(e) => { setSelectedLevel(e.target.value); setSelectedSubject(''); }}
                  className="input-field w-full"
                >
                  <option value="">Tümü</option>
                  {Object.entries(EDUCATION_LEVELS).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              {selectedLevel && currentSubjects.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-semibold text-navy-900 mb-4">Ders</h3>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tümü</option>
                    {currentSubjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              )}

              <button onClick={clearFilters} className="btn-secondary w-full">
                Filtreleri Temizle
              </button>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-600">
                  <span className="font-semibold text-navy-900">{teachers.length}</span> öğretmen bulundu
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field w-auto py-2"
                >
                  <option value="recommended">Önerilen</option>
                  <option value="rating">En Yüksek Puan</option>
                  <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                  <option value="experience">Deneyim</option>
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : teachers.length === 0 ? (
                <div className="card p-12 text-center">
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">Öğretmen bulunamadı</h3>
                  <p className="text-slate-500">Filtreleri değiştirerek tekrar deneyin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers.map((teacher) => {
                    const parentPrice = calculateParentPrice(teacher.base_price || 0);
                    const initials = teacher.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';
                    const subjectDisplay = getSubjectDisplay(teacher.subjects || []);
                    const levelDisplay = getLevelDisplay(teacher.subjects || []);

                    return (
                      <Link 
                        href={`/teachers/${teacher.id}`} 
                        key={teacher.id} 
                        className="card p-6 flex gap-6 hover:shadow-lg transition-shadow"
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
                            {teacher.rating && (
                              <div className="flex items-center gap-1 bg-gold-50 px-3 py-1 rounded-full">
                                <span className="text-gold-500">★</span>
                                <span className="font-semibold text-gold-700">{teacher.rating}</span>
                              </div>
                            )}
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
                          </div>
                          <span className="btn-primary py-2 px-4 text-sm">
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
        </div>
      </main>
      <Footer />
    </>
  );
}