'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ============================================
// FILTER SIDEBAR
// ============================================
const FilterSidebar = () => {
  const [priceRange, setPriceRange] = useState([500, 5000]);

  const branches = [
    { id: 'matematik', name: 'Matematik', count: 85 },
    { id: 'fizik', name: 'Fizik', count: 42 },
    { id: 'kimya', name: 'Kimya', count: 38 },
    { id: 'biyoloji', name: 'Biyoloji', count: 35 },
    { id: 'turkce', name: 'Türkçe', count: 56 },
    { id: 'ingilizce', name: 'İngilizce', count: 78 },
  ];

  const grades = [
    { id: '5', name: '5. Sınıf' },
    { id: '6', name: '6. Sınıf' },
    { id: '7', name: '7. Sınıf' },
    { id: '8', name: '8. Sınıf' },
    { id: '9', name: '9. Sınıf' },
    { id: '10', name: '10. Sınıf' },
    { id: '11', name: '11. Sınıf' },
    { id: '12', name: '12. Sınıf' },
  ];

  return (
    <aside className="w-72 shrink-0 space-y-6">
      {/* Search */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-900 mb-4">Ara</h3>
        <div className="relative">
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Öğretmen adı..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Branch Filter */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-900 mb-4">Branş</h3>
        <div className="space-y-3">
          {branches.map((branch) => (
            <label key={branch.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                />
                <span className="text-slate-700 group-hover:text-navy-900">{branch.name}</span>
              </div>
              <span className="text-sm text-slate-400">{branch.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Grade Filter */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-900 mb-4">Sınıf Seviyesi</h3>
        <div className="grid grid-cols-2 gap-2">
          {grades.map((grade) => (
            <label key={grade.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
              />
              <span className="text-sm text-slate-700">{grade.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-900 mb-4">Ücret Aralığı</h3>
        <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
          <span>₺{priceRange[0]}</span>
          <span>₺{priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="100"
          max="1000"
          step="50"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-600"
        />
      </div>

      {/* Rating Filter */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-900 mb-4">Minimum Puan</h3>
        <div className="flex gap-2">
          {[4, 4.5, 5].map((rating) => (
            <button
              key={rating}
              className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-navy-300 hover:text-navy-900 transition-colors"
            >
              {rating}+
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button className="btn-secondary w-full">
        Filtreleri Temizle
      </button>
    </aside>
  );
};

// ============================================
// TEACHER CARD
// ============================================
const TeacherCard = ({ teacher }: { teacher: any }) => (
  <Link href={`/teachers/${teacher.id}`} className="card-interactive p-6 flex gap-6">
    {/* Avatar */}
    <div className="shrink-0">
      <div className="w-24 h-24 bg-gradient-navy rounded-2xl flex items-center justify-center text-white font-display text-3xl font-semibold shadow-elegant">
        {teacher.initials}
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-display text-xl font-semibold text-navy-900 mb-1 flex items-center gap-2">
            {teacher.name}{teacher.isNative && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">Native</span>}
          </h3>
          <p className="text-slate-500">{teacher.branch}</p>
        </div>
        <div className="flex items-center gap-1 bg-gold-50 px-3 py-1 rounded-full">
          <svg className="w-4 h-4 text-gold-500 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-semibold text-gold-700">{teacher.rating}</span>
          <span className="text-gold-600 text-sm">({teacher.reviewCount})</span>
        </div>
      </div>

      <p className="text-slate-600 text-sm line-clamp-2 mb-4">{teacher.bio}</p>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5 text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {teacher.experience} yıl deneyim
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {teacher.completedLessons} ders
        </div>
        <div className="flex items-center gap-1.5">
          {teacher.subjects.slice(0, 3).map((subject: string, i: number) => (
            <span key={i} className="badge badge-navy">{subject}</span>
          ))}
          {teacher.subjects.length > 3 && (
            <span className="text-slate-400">+{teacher.subjects.length - 3}</span>
          )}
        </div>
      </div>
    </div>

    {/* Price & Action */}
    <div className="shrink-0 text-right flex flex-col justify-between">
      <div>
        <div className="font-display text-2xl font-bold text-navy-900">
          ₺{teacher.hourlyRate}
        </div>
        <div className="text-sm text-slate-500">/saat</div>
      </div>
      <button className="btn-primary py-2 px-4 text-sm">
        Profili Gör
      </button>
    </div>
  </Link>
);

// ============================================
// MAIN PAGE
// ============================================
export default function TeachersPage() {
  const [sortBy, setSortBy] = useState('recommended');

  const teachers = [
    {
      id: '1',
      name: 'Mehmet Öztürk',
      initials: 'MÖ',
      branch: 'Matematik Öğretmeni',
      bio: '12 yıllık deneyimle LGS ve YKS sınavlarına hazırlık. İstanbul Üniversitesi Matematik Bölümü mezunu. Öğrenci odaklı, sonuç garantili eğitim.',
      rating: 4.9,
      reviewCount: 128,
      experience: 12,
      completedLessons: 1240,
      hourlyRate: 450,
      subjects: ['Matematik', 'Geometri', 'Analitik Geometri'],
    },
    {
      id: '2',
      name: 'Ayşe Kaya',
      initials: 'AK',
      branch: 'Fizik Öğretmeni',
      bio: 'Boğaziçi Üniversitesi Fizik Bölümü mezunu. Karmaşık konuları anlaşılır hale getirme konusunda uzman. TÜBİTAK proje danışmanlığı.',
      rating: 4.8,
      reviewCount: 95,
      experience: 8,
      completedLessons: 890,
      hourlyRate: 400,
      subjects: ['Fizik', 'Mekanik', 'Elektrik'],
    },
    {
      id: '3',
      name: 'Can Demir',
      initials: 'CD',
      branch: 'İngilizce Öğretmeni',
      bio: 'CELTA sertifikalı, 10 yıl yurt dışı deneyimi. Speaking ve Writing odaklı dersler. YDS, YÖKDİL, TOEFL, IELTS hazırlık.',
      rating: 5.0,
      reviewCount: 156,
      experience: 15,
      completedLessons: 2100,
      hourlyRate: 500,
      subjects: ['İngilizce', 'YDS', 'IELTS'],
    },
    {
      id: '4',
      name: 'Zeynep Yıldız',
      initials: 'ZY',
      branch: 'Kimya Öğretmeni',
      bio: 'ODTÜ Kimya mezunu, yüksek lisans. Organik kimya ve biyokimya uzmanı. Deney odaklı, görsel anlatım teknikleri.',
      rating: 4.7,
      reviewCount: 73,
      experience: 6,
      completedLessons: 520,
      hourlyRate: 380,
      subjects: ['Kimya', 'Organik Kimya', 'Biyokimya'],
    },
  ];

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
            {/* Filters */}
            <FilterSidebar />

            {/* Results */}
            <div className="flex-1">
              {/* Sort & Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-600">
                  <span className="font-semibold text-navy-900">248</span> öğretmen bulundu
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

              {/* Teacher List */}
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:border-navy-300 hover:text-navy-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === 1
                        ? 'bg-navy-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:border-navy-300 hover:text-navy-900'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="px-2 text-slate-400">...</span>
                <button className="w-10 h-10 rounded-lg border border-slate-200 font-medium text-slate-600 hover:border-navy-300 hover:text-navy-900 transition-colors">
                  25
                </button>
                <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:border-navy-300 hover:text-navy-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
