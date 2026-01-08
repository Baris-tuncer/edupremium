'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ============================================
// BOOKING MODAL
// ============================================
const BookingModal = ({ isOpen, onClose, teacher }: { isOpen: boolean; onClose: () => void; teacher: any }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const dates = [
    { date: '2026-01-15', day: 'Çar', dayNum: '15' },
    { date: '2026-01-16', day: 'Per', dayNum: '16' },
    { date: '2026-01-17', day: 'Cum', dayNum: '17' },
    { date: '2026-01-18', day: 'Cmt', dayNum: '18' },
    { date: '2026-01-19', day: 'Paz', dayNum: '19' },
    { date: '2026-01-20', day: 'Pzt', dayNum: '20' },
    { date: '2026-01-21', day: 'Sal', dayNum: '21' },
  ];

  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy-900">Randevu Al</h2>
            <p className="text-slate-500">{teacher.name} ile ders</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <>
              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Tarih Seçin</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {dates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 transition-all shrink-0 ${
                        selectedDate === d.date
                          ? 'border-navy-600 bg-navy-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs text-slate-500 mb-1">{d.day}</span>
                      <span className="text-xl font-semibold text-navy-900">{d.dayNum}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-8">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Saat Seçin</h3>
                <div className="grid grid-cols-4 gap-3">
                  {times.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                        selectedTime === time
                          ? 'border-navy-600 bg-navy-50 text-navy-900'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Selection */}
              <div className="mb-8">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Ders Seçin</h3>
                <select className="input">
                  <option>Matematik - 11. Sınıf</option>
                  <option>Geometri - 11. Sınıf</option>
                  <option>Analitik Geometri - 11. Sınıf</option>
                </select>
              </div>

              {/* Note */}
              <div className="mb-8">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Not (Opsiyonel)</h3>
                <textarea
                  className="input resize-none h-24"
                  placeholder="Öğretmene iletmek istediğiniz not..."
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedDate || !selectedTime}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Randevu Özeti</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Öğretmen</span>
                    <span className="font-medium text-navy-900">{teacher.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ders</span>
                    <span className="font-medium text-navy-900">Matematik - 11. Sınıf</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tarih</span>
                    <span className="font-medium text-navy-900">15 Ocak 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saat</span>
                    <span className="font-medium text-navy-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Süre</span>
                    <span className="font-medium text-navy-900">60 dakika</span>
                  </div>
                  <div className="border-t border-slate-200 my-3" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-navy-900">Toplam</span>
                    <span className="font-display font-bold text-navy-900">₺{teacher.hourlyRate}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8">
                <h3 className="font-display font-semibold text-navy-900 mb-4">Ödeme Yöntemi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === 'card'
                        ? 'border-navy-600 bg-navy-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-semibold text-navy-900">Kredi Kartı</span>
                    </div>
                    <p className="text-sm text-slate-500">3D Secure ile güvenli ödeme</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-navy-600 bg-navy-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      <span className="font-semibold text-navy-900">Havale/EFT</span>
                    </div>
                    <p className="text-sm text-slate-500">24 saat içinde onay</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">
                  Geri
                </button>
                <button className="btn-primary flex-1 py-4 text-lg">
                  {paymentMethod === 'card' ? 'Ödemeye Geç' : 'Randevuyu Onayla'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================
export default function TeacherProfilePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const teacher = {
    id: '1',
    name: 'Mehmet Öztürk',
    initials: 'MÖ',
    branch: 'Matematik Öğretmeni',
    bio: '12 yıllık deneyimle ortaokul ve lise öğrencilerine matematik dersi veriyorum. İstanbul Üniversitesi Matematik Bölümü mezunuyum. Yüksek lisansımı matematik eğitimi alanında tamamladım.\n\nÖğretmenlik kariyerim boyunca binlerce öğrencinin LGS ve YKS sınavlarına hazırlanmasına yardımcı oldum. Öğrenci odaklı, interaktif ders anlayışımla karmaşık konuları anlaşılır hale getiriyorum.\n\nDerslerimde görselleştirme ve pratik problem çözme tekniklerini aktif olarak kullanıyorum. Her öğrencinin öğrenme hızına ve tarzına uygun bireysel çalışma planları hazırlıyorum.',
    rating: 4.9,
    reviewCount: 128,
    experience: 12,
    completedLessons: 1240,
    hourlyRate: 450,
    subjects: ['Matematik', 'Geometri', 'Analitik Geometri'],
    education: 'İstanbul Üniversitesi - Matematik (Lisans), Marmara Üniversitesi - Matematik Eğitimi (Yüksek Lisans)',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  };

  const reviews = [
    {
      id: 1,
      name: 'Ahmet Y.',
      date: '2 hafta önce',
      rating: 5,
      text: 'Mehmet Hoca, matematiği çok anlaşılır ve eğlenceli bir şekilde anlatıyor. Oğlum derslerden çok memnun ve notları gözle görülür şekilde yükseldi.',
    },
    {
      id: 2,
      name: 'Zeynep K.',
      date: '1 ay önce',
      rating: 5,
      text: 'Geometri konusunda çok zorlanıyordum ama Mehmet Hoca\'nın anlatımıyla konuları çok daha iyi kavradım. Sabırlı ve anlayışlı bir öğretmen.',
    },
    {
      id: 3,
      name: 'Emre D.',
      date: '1 ay önce',
      rating: 4,
      text: 'YKS hazırlığı için aldığım dersler çok faydalı oldu. Soru çözüm teknikleri ve zaman yönetimi konusunda çok yardımcı oldu.',
    },
  ];

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Header */}
              <div className="card p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="shrink-0">
                    <div className="w-32 h-32 bg-gradient-navy rounded-3xl flex items-center justify-center text-white font-display text-5xl font-semibold shadow-elegant">
                      {teacher.initials}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl mb-2">{teacher.name}</h1>
                        <p className="text-lg text-slate-500">{teacher.branch}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-gold-50 px-4 py-2 rounded-full">
                        <svg className="w-5 h-5 text-gold-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-lg font-bold text-gold-700">{teacher.rating}</span>
                        <span className="text-gold-600">({teacher.reviewCount} değerlendirme)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {teacher.experience} yıl deneyim
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {teacher.completedLessons}+ ders tamamlandı
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        {teacher.education.split(',')[0]}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {teacher.subjects.map((subject, i) => (
                        <span key={i} className="badge badge-navy">{subject}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Tanıtım Videosu</h2>
                <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden">
                  <iframe
                    src={teacher.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* About */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Hakkında</h2>
                <div className="prose prose-slate max-w-none">
                  {teacher.bio.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-slate-600 leading-relaxed mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold text-navy-900">Değerlendirmeler</h2>
                  <span className="text-slate-500">{teacher.reviewCount} değerlendirme</span>
                </div>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center font-display font-semibold text-navy-700">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-navy-900">{review.name}</div>
                            <div className="text-sm text-slate-500">{review.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-gold-400 fill-current' : 'text-slate-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="font-display text-4xl font-bold text-navy-900">
                    ₺{teacher.hourlyRate}
                  </div>
                  <div className="text-slate-500">/saat</div>
                </div>

                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="btn-primary w-full py-4 text-lg mb-4"
                >
                  Randevu Al
                </button>

                <button className="btn-secondary w-full py-3">
                  Mesaj Gönder
                </button>

                <div className="divider my-6" />

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600">Ücretsiz iptal (24 saat öncesine kadar)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600">Microsoft Teams ile online ders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600">AI destekli ders raporları</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600">Güvenli ödeme altyapısı</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        teacher={teacher}
      />
    </>
  );
}
