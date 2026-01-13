'use client';

import { useState } from 'react';
import Link from 'next/link';

const tabs = [
  { id: 'upcoming', label: 'Yaklaşan Dersler' },
  { id: 'completed', label: 'Tamamlanan Dersler' },
  { id: 'cancelled', label: 'İptal Edilen' },
];

const mockLessons = {
  upcoming: [
    { id: 1, student: 'Ali Yılmaz', subject: 'Matematik', date: '2026-01-12', time: '10:00', duration: 60, status: 'confirmed' },
    { id: 2, student: 'Zeynep Kaya', subject: 'Geometri', date: '2026-01-12', time: '14:00', duration: 60, status: 'confirmed' },
    { id: 3, student: 'Emre Demir', subject: 'Matematik', date: '2026-01-13', time: '11:00', duration: 90, status: 'pending' },
    { id: 4, student: 'Ayşe Çelik', subject: 'Matematik', date: '2026-01-14', time: '16:00', duration: 60, status: 'confirmed' },
  ],
  completed: [
    { id: 5, student: 'Mehmet Öz', subject: 'Matematik', date: '2026-01-08', time: '10:00', duration: 60, status: 'completed', rating: 5 },
    { id: 6, student: 'Selin Ak', subject: 'Geometri', date: '2026-01-07', time: '15:00', duration: 60, status: 'completed', rating: 4 },
    { id: 7, student: 'Can Yıldız', subject: 'Matematik', date: '2026-01-06', time: '09:00', duration: 90, status: 'completed', rating: 5 },
  ],
  cancelled: [
    { id: 8, student: 'Deniz Koç', subject: 'Matematik', date: '2026-01-09', time: '13:00', duration: 60, status: 'cancelled', reason: 'Öğrenci iptal etti' },
  ],
};

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700 border border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  completed: 'bg-blue-100 text-blue-700 border border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border border-red-200',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Onaylandı',
  pending: 'Bekliyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

export default function TeacherLessonsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const lessons = mockLessons[activeTab as keyof typeof mockLessons];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/teacher" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <h1 className="font-semibold text-xl text-slate-900">Derslerim</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-slate-900">{mockLessons.upcoming.length}</div>
            <div className="text-slate-600 text-sm">Yaklaşan Ders</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600">{mockLessons.completed.length}</div>
            <div className="text-slate-600 text-sm">Bu Hafta Tamamlanan</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-amber-500">4.8</div>
            <div className="text-slate-600 text-sm">Ortalama Puan</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-slate-900">₺2,450</div>
            <div className="text-slate-600 text-sm">Bu Hafta Kazanç</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Bu kategoride ders bulunmuyor.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    {/* Sol: Öğrenci bilgisi */}
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-600 font-semibold text-sm">
                          {lesson.student.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{lesson.student}</h3>
                        <p className="text-slate-500 text-sm">{lesson.subject}</p>
                      </div>
                    </div>
                    
                    {/* Orta: Tarih */}
                    <div className="text-right min-w-[160px]">
                      <div className="font-medium text-slate-900">
                        {new Date(lesson.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                      </div>
                      <div className="text-slate-500 text-sm">{lesson.time} - {lesson.duration} dakika</div>
                    </div>
                    
                    {/* Sağ: Durum ve Butonlar */}
                    <div className="flex items-center gap-3 min-w-[240px] justify-end">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[lesson.status]}`}>
                        {statusLabels[lesson.status]}
                      </span>

                      {lesson.status === 'confirmed' && (
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                          Derse Başla
                        </button>
                      )}

                      {lesson.status === 'pending' && (
                        <>
                          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                            Onayla
                          </button>
                          <button className="text-red-600 text-sm font-medium hover:text-red-700">
                            Reddet
                          </button>
                        </>
                      )}

                      {lesson.status === 'completed' && 'rating' in lesson && (
                        <div className="flex items-center gap-1">
                          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-medium text-slate-900">{lesson.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {'reason' in lesson && lesson.reason && (
                    <div className="mt-3 text-sm text-slate-500 bg-slate-100 rounded-lg px-4 py-2">
                      İptal sebebi: {lesson.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
