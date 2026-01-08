'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
      <label className="input-label mb-3">{label}</label>
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
                  ? 'text-gold-400 fill-current'
                  : 'text-slate-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-3 text-lg font-semibold text-navy-900">{value}/5</span>
      </div>
    </div>
  );
};

// ============================================
// MAIN FEEDBACK FORM
// ============================================
export default function TeacherFeedbackPage() {
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

  const lesson = {
    student: 'Ali Yılmaz',
    subject: 'Matematik - 11. Sınıf',
    date: '14 Ocak 2026',
    time: '14:00 - 15:00',
  };

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
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Redirect or show success
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-8">
          <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-navy-900 mb-4">
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

        {/* Lesson Info Card */}
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-navy-100 rounded-2xl flex items-center justify-center font-display text-2xl font-semibold text-navy-700">
              {lesson.student.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-navy-900">{lesson.student}</h2>
              <p className="text-slate-500">{lesson.subject}</p>
              <p className="text-sm text-slate-400">{lesson.date} • {lesson.time}</p>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="card p-8">
          {/* Ratings Section */}
          <div className="mb-8">
            <h3 className="font-display text-lg font-semibold text-navy-900 mb-6">Performans Değerlendirmesi</h3>
            
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

          <div className="divider mb-8" />

          {/* Homework Status */}
          <div className="mb-8">
            <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Ödev Durumu</h3>
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
                      ? 'border-navy-600 bg-navy-50 text-navy-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divider mb-8" />

          {/* Topics Covered */}
          <div className="mb-8">
            <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">İşlenen Konular</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                className="input flex-1"
                placeholder="Konu ekle..."
              />
              <button type="button" onClick={handleAddTopic} className="btn-secondary px-4">
                Ekle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, i) => (
                <span key={i} className="badge badge-navy flex items-center gap-2 py-2 px-3">
                  {topic}
                  <button
                    type="button"
                    onClick={() => setTopics(topics.filter((_, idx) => idx !== i))}
                    className="hover:text-navy-900"
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
            <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Geliştirilmesi Gereken Alanlar</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImprovement())}
                className="input flex-1"
                placeholder="Alan ekle..."
              />
              <button type="button" onClick={handleAddImprovement} className="btn-secondary px-4">
                Ekle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {improvements.map((item, i) => (
                <span key={i} className="badge badge-warning flex items-center gap-2 py-2 px-3">
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

          <div className="divider mb-8" />

          {/* Teacher Notes */}
          <div className="mb-8">
            <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Öğretmen Notları</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input resize-none h-32"
              placeholder="Ders hakkında eklemek istediğiniz notlar... (Opsiyonel)"
            />
          </div>

          {/* AI Report Preview */}
          <div className="bg-navy-50 border border-navy-100 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center text-navy-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-navy-900">AI Rapor Oluşturma</h4>
                <p className="text-sm text-navy-600">
                  Bu değerlendirme gönderildikten sonra, yapay zeka tarafından veliye yönelik 
                  profesyonel bir rapor otomatik olarak oluşturulacak ve e-posta ile gönderilecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/teacher/dashboard" className="btn-secondary flex-1 py-4">
              İptal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !comprehension || !engagement || !participation || !homeworkStatus || topics.length === 0}
              className="btn-primary flex-1 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
