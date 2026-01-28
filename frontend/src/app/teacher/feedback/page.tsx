'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student_name: string;
  subject: string;
}

export default function TeacherFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, student_id, lesson_id')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setStats({ average: 0, total: 0 });
        return;
      }

      // Ogrenci bilgilerini al
      const studentIds = [...new Set(reviewsData.map(r => r.student_id).filter(Boolean))];
      const lessonIds = [...new Set(reviewsData.map(r => r.lesson_id).filter(Boolean))];

      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, subject')
        .in('id', lessonIds);

      const studentMap = new Map();
      (students || []).forEach(s => studentMap.set(s.id, s.full_name));

      const lessonMap = new Map();
      (lessons || []).forEach(l => lessonMap.set(l.id, l.subject));

      const formattedReviews = reviewsData.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        student_name: studentMap.get(r.student_id) || 'Ogrenci',
        subject: lessonMap.get(r.lesson_id) || 'Ders'
      }));

      setReviews(formattedReviews);

      // Ortalama hesapla
      const total = reviewsData.length;
      const average = reviewsData.reduce((sum, r) => sum + r.rating, 0) / total;
      setStats({ average, total });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-slate-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">Degerlendirmeler</h1>
        <p className="text-slate-600 mt-1">Ogrencilerinizden gelen yorumlar</p>
      </div>

      {/* Ozet Kartlari */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Ortalama Puan</span>
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {stats.average > 0 ? stats.average.toFixed(1) : '-'}
          </p>
          <p className="text-sm text-slate-400 mt-1">5 uzerinden</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Toplam Degerlendirme</span>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-400 mt-1">yorum</p>
        </div>
      </div>

      {/* Degerlendirme Listesi */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-slate-600">Henuz degerlendirme bulunmuyor.</p>
          <p className="text-sm text-slate-400 mt-2">Derslerinizi tamamladiktan sonra ogrencileriniz yorum yapabilir.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">
                      {review.student_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{review.student_name}</p>
                    <p className="text-sm text-slate-500">{review.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              {review.comment && (
                <p className="text-slate-600 mb-4">{review.comment}</p>
              )}
              <p className="text-sm text-slate-400">{formatDate(review.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
