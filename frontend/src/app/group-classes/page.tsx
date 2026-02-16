'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatPrice } from '@/lib/price-calculator';

interface GroupClass {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  min_capacity: number;
  max_capacity: number;
  display_price: number;
  status: string;
  enrolled_count: number;
  spots_left: number;
  teacher: {
    id: string;
    full_name: string;
    profile_photo_url: string | null;
    total_lessons_completed: number;
  };
}

const SUBJECTS = [
  'Tumu', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Turkce', 'Edebiyat',
  'Tarih', 'Cografya', 'Ingilizce', 'Almanca', 'Fransizca', 'Felsefe',
];

export default function GroupClassesPage() {
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('Tumu');

  useEffect(() => {
    fetchClasses();
  }, [selectedSubject]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      let url = '/api/group-classes';
      if (selectedSubject !== 'Tumu') {
        url += `?subject=${encodeURIComponent(selectedSubject)}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.classes) {
        setClasses(result.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (groupClass: GroupClass) => {
    if (groupClass.status === 'confirmed') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
          Onaylandı
        </span>
      );
    }
    if (groupClass.enrolled_count >= groupClass.min_capacity) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
          Kesin Yapılacak
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
        Kayıt Acık
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-serif text-xl font-semibold text-[#0F172A]">EduPremium</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/student/my-group-classes"
                className="text-slate-600 hover:text-[#0F172A] font-medium"
              >
                Grup Derslerim
              </Link>
              <Link
                href="/student/dashboard"
                className="bg-[#0F172A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
              >
                Giris Yap
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Grup Dersleri</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Uzman ogretmenlerle birden fazla ogrenciyle birlikte ders alın.
            Daha uygun fiyatlarla kaliteli egitim.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map(subject => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSubject === subject
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Class List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Acık grup dersi bulunamadı</h3>
            <p className="text-slate-500">
              {selectedSubject !== 'Tumu'
                ? `${selectedSubject} konusunda henuz acık ders yok. Diger konuları inceleyin.`
                : 'Yakında yeni grup dersleri eklenecektir.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((groupClass) => {
              const scheduledDate = new Date(groupClass.scheduled_at);

              return (
                <Link
                  key={groupClass.id}
                  href={`/group-classes/${groupClass.id}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-slate-100 hover:border-[#D4AF37]/30 group"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] p-4">
                    <div className="flex items-center gap-3">
                      {groupClass.teacher.profile_photo_url ? (
                        <img
                          src={groupClass.teacher.profile_photo_url}
                          alt={groupClass.teacher.full_name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0F172A] font-semibold ring-2 ring-white/20">
                          {groupClass.teacher.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{groupClass.teacher.full_name}</p>
                        <p className="text-xs text-white/60">
                          {groupClass.teacher.total_lessons_completed || 0} ders tamamladı
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-[#0F172A] group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                        {groupClass.title}
                      </h3>
                      {getStatusBadge(groupClass)}
                    </div>

                    {groupClass.description && (
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                        {groupClass.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {scheduledDate.toLocaleDateString('tr-TR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {scheduledDate.toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} - {groupClass.duration_minutes} dk
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {groupClass.enrolled_count}/{groupClass.max_capacity} katılımcı
                          {groupClass.spots_left > 0 && (
                            <span className="text-emerald-600 ml-1">
                              ({groupClass.spots_left} yer kaldı)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                        {groupClass.subject}
                      </span>
                      <span className="text-xl font-bold text-[#D4AF37]">
                        {formatPrice(groupClass.display_price)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
