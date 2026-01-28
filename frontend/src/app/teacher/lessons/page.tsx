'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.log('Error:', error.message);
        setLessons([]);
      } else {
        setLessons(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const completeLesson = async (lessonId: string) => {
    setCompletingId(lessonId);
    
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId);

      if (error) {
        toast.error('Ders tamamlanamadı: ' + error.message);
        return;
      }

      setLessons(prev => prev.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, status: 'COMPLETED', completed_at: new Date().toISOString() }
          : lesson
      ));

      toast.success('Ders başarıyla tamamlandı!');
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setCompletingId(null);
    }
  };

  const now = new Date();

  const filteredLessons = lessons.filter((lesson) => {
    if (filter === 'upcoming') {
      return lesson.status !== 'COMPLETED' && lesson.status !== 'CANCELLED';
    } else if (filter === 'completed') {
      return lesson.status === 'COMPLETED';
    }
    return true;
  });

  const canComplete = (lesson: any) => {
    const lessonDate = new Date(lesson.scheduled_at);
    return lessonDate <= now && lesson.status !== 'COMPLETED' && lesson.status !== 'CANCELLED';
  };

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const lessonDate = new Date(scheduledAt);
    const isPast = lessonDate < now;

    if (status === 'COMPLETED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Tamamlandı
        </span>
      );
    } else if (status === 'CANCELLED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          İptal Edildi
        </span>
      );
    } else if (isPast) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Bekliyor
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Planlandı
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Derslerim</h1>
        <p className="text-slate-600">Tüm derslerinizi ve randevularınızı görüntüleyin</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-navy-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Gelecek Dersler
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-navy-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tamamlanan Dersler
        </button>
      </div>

      <div className="space-y-4">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center font-semibold text-navy-600">
                    {lesson.subject?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">
                      {lesson.subject || 'Ders'}
                    </h3>
                    <p className="text-sm text-slate-600">{lesson.duration_minutes} dakika • {lesson.price} ₺</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-navy-900">
                      {new Date(lesson.scheduled_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(lesson.scheduled_at).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  
                  {getStatusBadge(lesson.status, lesson.scheduled_at)}
                  
                  {canComplete(lesson) && (
                    <button
                      onClick={() => completeLesson(lesson.id)}
                      disabled={completingId === lesson.id}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {completingId === lesson.id ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Tamamlanıyor...
                        </span>
                      ) : (
                        'Dersi Tamamla'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-slate-500">
              {filter === 'upcoming' ? 'Henüz planlanmış ders bulunmuyor' : 'Henüz tamamlanmış ders bulunmuyor'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
