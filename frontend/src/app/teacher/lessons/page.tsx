'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Kayıt onay modalı
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);
  const [joiningMeeting, setJoiningMeeting] = useState(false);

  useEffect(() => {
    fetchLessons();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
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
        setLessons([]);
      } else {
        setLessons(data || []);
      }
    } catch (error) {
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
        toast.error('Ders tamamlanamadı');
        return;
      }
      setLessons(prev => prev.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, status: 'COMPLETED', completed_at: new Date().toISOString() }
          : lesson
      ));
      toast.success('Ders başarıyla tamamlandı!');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setCompletingId(null);
    }
  };

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
    return lessonDate <= currentTime && lesson.status !== 'COMPLETED' && lesson.status !== 'CANCELLED';
  };

  const canJoinMeeting = (lesson: any) => {
    if (!lesson.meeting_link) return false;
    if (lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED') return false;
    const lessonStart = new Date(lesson.scheduled_at);
    const fifteenMinsBefore = new Date(lessonStart.getTime() - 15 * 60 * 1000);
    const fifteenMinsAfter = new Date(lessonStart.getTime() + 15 * 60 * 1000);
    return currentTime >= fifteenMinsBefore && currentTime <= fifteenMinsAfter;
  };

  // Derse katıl butonuna tıklandığında önce onay modalı göster
  const handleJoinClick = (lessonId: string) => {
    setPendingLessonId(lessonId);
    setConsentChecked(false);
    setShowConsentModal(true);
  };

  // Onay verildikten sonra derse katıl (token ile)
  const handleConsentAndJoin = async () => {
    if (!consentChecked || !pendingLessonId) return;

    const lesson = lessons.find(l => l.id === pendingLessonId);
    if (!lesson?.meeting_link) {
      toast.error('Meeting linki bulunamadı');
      return;
    }

    setJoiningMeeting(true);
    try {
      const response = await fetch('/api/lessons/meeting-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: pendingLessonId })
      });

      const data = await response.json();

      if (response.ok && data.meetingUrl) {
        // Token'lı URL ile derse katıl
        window.open(data.meetingUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Token alınamazsa direkt meeting link ile gir
        console.warn('Token alınamadı, direkt link kullanılıyor:', data.error);
        window.open(lesson.meeting_link, '_blank', 'noopener,noreferrer');
      }

      setShowConsentModal(false);
      setPendingLessonId(null);
      setConsentChecked(false);
    } catch (error) {
      // Hata durumunda da direkt meeting link ile gir
      console.error('API hatası, direkt link kullanılıyor:', error);
      window.open(lesson.meeting_link, '_blank', 'noopener,noreferrer');
      setShowConsentModal(false);
      setPendingLessonId(null);
      setConsentChecked(false);
    } finally {
      setJoiningMeeting(false);
    }
  };

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const lessonDate = new Date(scheduledAt);
    const isPast = lessonDate < currentTime;
    if (status === 'COMPLETED') {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Tamamlandı</span>;
    }
    if (status === 'CANCELLED') {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">İptal Edildi</span>;
    }
    if (isPast) {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Tamamlanmadı</span>;
    }
    return <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#D4AF37]/10 text-[#0F172A]">Planlandı</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Derslerim</h1>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'upcoming' ? 'bg-[#0F172A] text-white' : 'bg-white/80 backdrop-blur-xl text-slate-600 hover:bg-slate-50'}`}
        >
          Gelecek Dersler
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed' ? 'bg-[#0F172A] text-white' : 'bg-white/80 backdrop-blur-xl text-slate-600 hover:bg-slate-50'}`}
        >
          Tamamlanan Dersler
        </button>
      </div>
      <div className="space-y-4">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div key={lesson.id} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl shadow-[#0F172A]/5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center font-semibold text-[#0F172A]/70">
                    {lesson.subject?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">{lesson.subject || 'Ders'}</h3>
                    <p className="text-sm text-slate-600">{lesson.duration_minutes} dakika • {lesson.price} ₺</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-[#0F172A]">
                      {new Date(lesson.scheduled_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(lesson.scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {getStatusBadge(lesson.status, lesson.scheduled_at)}
                  {canJoinMeeting(lesson) && (
                    <button
                      onClick={() => handleJoinClick(lesson.id)}
                      className="px-4 py-2 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors flex items-center gap-2"
                    >
                      🎥 Derse Katıl
                    </button>
                  )}
                  {canComplete(lesson) && (
                    <button onClick={() => completeLesson(lesson.id)} disabled={completingId === lesson.id} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                      {completingId === lesson.id ? 'Tamamlanıyor...' : 'Dersi Tamamla'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl shadow-[#0F172A]/5 p-12 text-center">
            <p className="text-slate-500">{filter === 'upcoming' ? 'Henüz planlanmış ders bulunmuyor' : 'Henüz tamamlanmış ders bulunmuyor'}</p>
          </div>
        )}
      </div>

      {/* Kayıt Onay Modalı */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Güvenlik Bildirimi</h2>
                <p className="text-sm text-slate-500">Derse katılmadan önce lütfen okuyun</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-amber-800 text-sm leading-relaxed">
                Bu online ders, <strong>tarafların ve platformun hukuki haklarını korumak amacıyla</strong> ses ve görüntü olarak kaydedilmektedir.
              </p>
            </div>

            <div className="space-y-3 mb-6 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Kayıtlar yalnızca güvenlik ve hukuki süreçler için kullanılır</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Kayıtlar 7 gün süreyle saklanır, ardından otomatik silinir</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Üçüncü taraflarla paylaşılmaz (yasal zorunluluk hariç)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>KVKK kapsamında korunur</span>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer mb-6 border-2 border-transparent hover:border-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-[#0F172A] rounded border-slate-300 focus:ring-[#D4AF37]"
              />
              <span className="text-slate-700 text-sm">
                Bu dersin ses ve görüntü olarak kaydedileceğini okudum, anladım ve <strong>kabul ediyorum</strong>.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConsentModal(false); setPendingLessonId(null); }}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConsentAndJoin}
                disabled={!consentChecked || joiningMeeting}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {joiningMeeting ? (
                  <span>Bağlanıyor...</span>
                ) : (
                  <>
                    <span>🎥</span>
                    Kabul Et ve Derse Katıl
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
