'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Branch {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  branchId: string;
}

interface ExamType {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastNameInitial: string;
  profilePhotoUrl?: string;
  bio?: string;
  hourlyRate: number;
  parentPrice: number;
  branches: string[];
  subjects: string[];
  completedLessons?: number;
  averageRating?: number;
}

interface PricingConfig {
  commissionRate: number;
  taxRate: number;
}

// En yakın 100'e yuvarlama
const roundToNearest100 = (value: number) => Math.round(value / 100) * 100;

// Veli fiyatı hesaplama
const calculateParentPrice = (teacherRate: number, config: PricingConfig) => {
  const commission = teacherRate * (config.commissionRate / 100);
  const subtotal = teacherRate + commission;
  const tax = subtotal * (config.taxRate / 100);
  return roundToNearest100(subtotal + tax);
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({ commissionRate: 20, taxRate: 20 });
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [selectedBranch, selectedSubject, selectedExamType, minPrice, maxPrice, searchTerm, sortBy]);

  useEffect(() => {
    // Branch değişince subject'leri filtrele
    if (selectedBranch) {
      fetchSubjects(selectedBranch);
      setSelectedSubject('');
    } else {
      fetchSubjects();
    }
  }, [selectedBranch]);

  const fetchInitialData = async () => {
    try {
      const [branchesRes, subjectsRes, examTypesRes, pricingRes] = await Promise.all([
        fetch(`${baseUrl}/branches`),
        fetch(`${baseUrl}/subjects`),
        fetch(`${baseUrl}/exam-types`),
        fetch(`${baseUrl}/pricing/config`),
      ]);

      if (branchesRes.ok) {
        const data = await branchesRes.json();
        setBranches(data.data || []);
      }
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data.data || []);
      }
      if (examTypesRes.ok) {
        const data = await examTypesRes.json();
        setExamTypes(data.data || []);
      }
      if (pricingRes.ok) {
        const data = await pricingRes.json();
        if (data.data) {
          setPricingConfig({
            commissionRate: data.data.commissionRate || 20,
            taxRate: data.data.taxRate || 20,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchSubjects = async (branchId?: string) => {
    try {
      const url = branchId ? `${baseUrl}/subjects?branchId=${branchId}` : `${baseUrl}/subjects`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedBranch) params.append('branchId', selectedBranch);
      if (selectedSubject) params.append('subjectId', selectedSubject);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (searchTerm) params.append('search', searchTerm);

      const url = `${baseUrl}/teachers?${params.toString()}`;
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        let teacherList = data.data || [];
        
        // Sorting
        if (sortBy === 'price-low') {
          teacherList.sort((a: Teacher, b: Teacher) => a.hourlyRate - b.hourlyRate);
        } else if (sortBy === 'price-high') {
          teacherList.sort((a: Teacher, b: Teacher) => b.hourlyRate - a.hourlyRate);
        } else if (sortBy === 'rating') {
          teacherList.sort((a: Teacher, b: Teacher) => (b.averageRating || 0) - (a.averageRating || 0));
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBranch('');
    setSelectedSubject('');
    setSelectedExamType('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recommended');
  };

  const filteredSubjects = selectedBranch 
    ? subjects.filter(s => s.branchId === selectedBranch)
    : subjects;

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container-wide">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl mb-4">Öğretmenler</h1>
            <p className="text-lg text-slate-600">
              Alanında uzman, titizlikle seçilmiş öğretmenlerimizle tanışın.
            </p>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="w-72 shrink-0 space-y-6">
              {/* Search */}
              <div className="card p-5">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Öğretmen Ara</h3>
                <div className="relative">
                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="İsim ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Branch Filter */}
              <div className="card p-5">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Eğitim Seviyesi</h3>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Tümü</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div className="card p-5">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Ders</h3>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input w-full"
                  disabled={filteredSubjects.length === 0}
                >
                  <option value="">Tümü</option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              {/* Exam Type Filter */}
              {examTypes.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-display font-semibold text-navy-900 mb-4">Sınav Türü</h3>
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Tümü</option>
                    {examTypes.map((exam) => (
                      <option key={exam.id} value={exam.id}>{exam.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range */}
              <div className="card p-5">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Fiyat Aralığı</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min ₺"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="input w-full text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max ₺"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button onClick={clearFilters} className="btn-secondary w-full">
                Filtreleri Temizle
              </button>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {/* Sort & Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-600">
                  <span className="font-semibold text-navy-900">{totalCount}</span> öğretmen bulundu
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-auto py-2"
                >
                  <option value="recommended">Önerilen</option>
                  <option value="rating">En Yüksek Puan</option>
                  <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                  <option value="experience">Deneyim</option>
                </select>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : teachers.length === 0 ? (
                <div className="card p-12 text-center">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">Öğretmen bulunamadı</h3>
                  <p className="text-slate-500">Filtreleri değiştirerek tekrar deneyin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers.map((teacher) => {
                    const parentPrice = teacher.parentPrice;
                    const initials = `${teacher.firstName?.charAt(0) || ''}${teacher.lastNameInitial?.charAt(0) || ''}`;
                    const branchNames = teacher.branches?.join(", ") || "";
                    const subjectNames = teacher.subjects || [];

                    return (
                      <Link 
                        href={`/teachers/${teacher.id}`} 
                        key={teacher.id} 
                        className="card-interactive p-6 flex gap-6"
                      >
                        {/* Avatar */}
                        <div className="shrink-0">
                          {teacher.profilePhotoUrl ? (
                            <img 
                              src={teacher.profilePhotoUrl} 
                              alt={`${teacher.firstName} ${teacher.lastNameInitial}`} 
                              className="w-24 h-24 rounded-2xl object-cover shadow-elegant" 
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-navy rounded-2xl flex items-center justify-center text-white font-display text-3xl font-semibold shadow-elegant">
                              {initials}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-display text-xl font-semibold text-navy-900 mb-1">
                                {teacher.firstName} {teacher.lastNameInitial}
                              </h3>
                              <p className="text-slate-500">{branchNames || 'Öğretmen'}</p>
                            </div>
                            {teacher.rating && (
                              <div className="flex items-center gap-1 bg-gold-50 px-3 py-1 rounded-full">
                                <svg className="w-4 h-4 text-gold-500 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold text-gold-700">{teacher.rating}</span>
                                {teacher.reviewCount && (
                                  <span className="text-gold-600 text-sm">({teacher.reviewCount})</span>
                                )}
                              </div>
                            )}
                          </div>

                          {teacher.bio && (
                            <p className="text-slate-600 text-sm line-clamp-2 mb-4">{teacher.bio}</p>
                          )}

                          <div className="flex items-center gap-6 text-sm flex-wrap">
                            {teacher.experience && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {teacher.experience} yıl deneyim
                              </div>
                            )}
                            {teacher.completedLessons && teacher.completedLessons > 0 && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {teacher.completedLessons} ders
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {subjectNames.slice(0, 3).map((subject, i) => (
                                <span key={i} className="badge badge-navy">{subject}</span>
                              ))}
                              {subjectNames.length > 3 && (
                                <span className="text-slate-400">+{subjectNames.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="shrink-0 text-right flex flex-col justify-between">
                          <div>
                            <div className="font-display text-2xl font-bold text-navy-900">
                              ₺{parentPrice.toLocaleString('tr-TR')}
                            </div>
                            <div className="text-sm text-slate-500">/saat</div>
                          </div>
                          <button className="btn-primary py-2 px-4 text-sm">
                            Profili Gör
                          </button>
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
