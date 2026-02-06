'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// ============================================
// RATING STARS
// ============================================
const RatingStars = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="mb-6">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <svg
              className={`w-10 h-10 transition-colors ${
                star <= (hover || value)
                  ? 'text-[#D4AF37] fill-current'
                  : 'text-slate-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-3 text-lg font-semibold text-[#0F172A]">{value}/5</span>
      </div>
    </div>
  );
};

// ============================================
// MAIN FEEDBACK FORM
// ============================================
export default function TeacherFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [comprehension, setComprehension] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [participation, setParticipation] = useState(0);
  const [homeworkStatus, setHomeworkStatus] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [newImprovement, setNewImprovement] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ders bilgilerini yükle
  useEffect(() => {
    async function fetchLesson() {
      if (!lessonId) {
        setError('Ders ID bulunamadı');
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // Önce oturum kontrolü
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/teacher/login');
        return;
      }

      // Ders bilgilerini al
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          *,
          student:student_profiles(id, full_name, email),
          teacher:teacher_profiles(id, full_name, user_id)
        `)
        .eq('id', lessonId)
        .single();

      if (lessonError || !lessonData) {
        setError('Ders bulunamadı');
        setLoading(false);
        return;
      }

      // Bu öğretmenin dersi mi kontrol et
      if (lessonData.teacher?.user_id !== user.id) {
        setError('Bu derse erişim yetkiniz yok');
        setLoading(false);
        return;
      }

      setLesson(lessonData);
      setLoading(false);
    }

    fetchLesson();
  }, [lessonId, router]);

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleAddImprovement = () => {
    if (newImprovement.trim()) {
      setImprovements([...improvements, newImprovement.trim()]);
      setNewImprovement('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const supabase = createClient();

      // Feedback kaydı oluştur
      const { error: feedbackError } = await supabase
        .from('lesson_feedback')
        .insert({
          lesson_id: lessonId,
          teacher_id: lesson.teacher_id,
          student_id: lesson.student_id,
          comprehension_rating: comprehension,
          engagement_rating: engagement,
          participation_rating: participation,
          homework_status: homeworkStatus,
          topics_covered: topics,
          areas_for_improvement: improvements,
          teacher_notes: notes,
          created_at: new Date().toISOString(),
        });

      if (feedbackError) {
        // Tablo yoksa veya hata varsa, lessons tablosuna feedback bilgisi ekle
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            feedback_submitted: true,
            feedback_data: {
              comprehension,
              engagement,
              participation,
              homeworkStatus,
              topics,
              improvements,
              notes,
              submittedAt: new Date().toISOString(),
            }
          })
          .eq('id', lessonId);

        if (updateError) {
          throw new Error('Değerlendirme kaydedilemedi: ' + updateError.message);
        }
      }

      setSuccessMessage('Değerlendirme başarıyla kaydedildi!');

      // 2 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        router.push('/teacher/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tarih formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Istanbul'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Ders bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/teacher/dashboard" className="text-[#D4AF37] hover:underline">
              Dashboard'a Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#0F172A] mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri Dön
          </Link>
          <h1 className="text-3xl mb-2">Ders Değerlendirmesi</h1>
          <p className="text-slate-600">
            Bu değerlendirme, AI tarafından veliye gönderilecek raporun oluşturulmasında kullanılacaktır.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-700 text-center font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Lesson Info Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center font-serif text-2xl font-semibold text-[#D4AF37]">
              {lesson?.student?.full_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                {lesson?.student?.full_name || 'Öğrenci'}
              </h2>
              <p className="text-slate-500">{lesson?.subject || 'Ders'}</p>
              <p className="text-sm text-slate-400">
                {lesson?.scheduled_at ? formatDate(lesson.scheduled_at) : ''} • {lesson?.scheduled_at ? formatTime(lesson.scheduled_at) : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-8">
          {/* Ratings Section */}
          <div className="mb-8">
            <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-6">Performans Değerlendirmesi</h3>

            <RatingStars
              label="Konuyu Anlama Düzeyi"
              value={comprehension}
              onChange={setComprehension}
            />

            <RatingStars
              label="Derse İlgi ve Motivasyon"
              value={engagement}
              onChange={setEngagement}
            />

            <RatingStars
              label="Aktif Katılım"
              value={participation}
              onChange={setParticipation}
            />
          </div>

          <div className="border-t border-slate-200/50 mb-8" />

          {/* Homework Status */}
          <div className="mb-8">
            <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-4">Ödev Durumu</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'NOT_ASSIGNED', label: 'Ödev Verilmedi' },
                { id: 'FULLY_DONE', label: 'Tam Yapıldı' },
                { id: 'PARTIALLY_DONE', label: 'Kısmen Yapıldı' },
                { id: 'NOT_DONE', label: 'Yapılmadı' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setHomeworkStatus(option.id)}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    homeworkStatus === option.id
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#0F172A]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200/50 mb-8" />

          {/* Topics Covered */}
          <div className="mb-8">
            <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-4">İşlenen Konular</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                className="flex-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                placeholder="Konu ekle..."
              />
              <button type="button" onClick={handleAddTopic} className="px-4 py-2.5 border border-[#0F172A] text-[#0F172A] rounded-xl font-medium hover:bg-[#0F172A] hover:text-white transition-all">
                Ekle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, i) => (
                <span key={i} className="bg-[#0F172A]/10 text-[#0F172A] rounded-full flex items-center gap-2 py-2 px-3 text-sm font-medium">
                  {topic}
                  <button
                    type="button"
                    onClick={() => setTopics(topics.filter((_, idx) => idx !== i))}
                    className="hover:text-[#0F172A]"
                  >
                    ×
                  </button>
                </span>
              ))}
              {topics.length === 0 && (
                <span className="text-sm text-slate-400">Henüz konu eklenmedi</span>
              )}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="mb-8">
            <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-4">Geliştirilmesi Gereken Alanlar</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImprovement())}
                className="flex-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                placeholder="Alan ekle..."
              />
              <button type="button" onClick={handleAddImprovement} className="px-4 py-2.5 border border-[#0F172A] text-[#0F172A] rounded-xl font-medium hover:bg-[#0F172A] hover:text-white transition-all">
                Ekle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {improvements.map((item, i) => (
                <span key={i} className="bg-amber-100 text-amber-800 rounded-full flex items-center gap-2 py-2 px-3 text-sm font-medium">
                  {item}
                  <button
                    type="button"
                    onClick={() => setImprovements(improvements.filter((_, idx) => idx !== i))}
                    className="hover:text-amber-900"
                  >
                    ×
                  </button>
                </span>
              ))}
              {improvements.length === 0 && (
                <span className="text-sm text-slate-400">Henüz alan eklenmedi</span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200/50 mb-8" />

          {/* Teacher Notes */}
          <div className="mb-8">
            <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-4">Öğretmen Notları</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none resize-none h-32"
              placeholder="Ders hakkında eklemek istediğiniz notlar... (Opsiyonel)"
            />
          </div>

          {/* AI Report Preview */}
          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#0F172A]/70">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-serif font-semibold text-[#0F172A]">AI Rapor Oluşturma</h4>
                <p className="text-sm text-[#0F172A]/70">
                  Bu değerlendirme gönderildikten sonra, yapay zeka tarafından veliye yönelik
                  profesyonel bir rapor otomatik olarak oluşturulacak ve e-posta ile gönderilecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/teacher/dashboard" className="flex-1 py-4 border border-[#0F172A] text-[#0F172A] rounded-xl font-medium hover:bg-[#0F172A] hover:text-white transition-all text-center">
              İptal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !comprehension || !engagement || !participation || !homeworkStatus || topics.length === 0}
              className="flex-1 py-4 text-lg bg-[#0F172A] text-white rounded-xl font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Gönderiliyor...
                </span>
              ) : (
                'Değerlendirmeyi Gönder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
