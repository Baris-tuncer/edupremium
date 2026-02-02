'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'react-hot-toast';

interface Teacher {
  id: string;
  full_name: string;
  avatar_url: string | null;
  video_url: string | null;
  diploma_url: string | null;
  bio: string | null;
  base_price: number;
  subjects: string[];
  education_levels: string[];
  experience_years: number | null;
  rating: number | null;
  university: string | null;
  is_featured: boolean;
  featured_headline: string | null;
  total_lessons: number;
}

interface AvailabilitySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<AvailabilitySlot | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (teacherId) fetchTeacher();
  }, [teacherId]);

  const fetchTeacher = async () => {
    try {
      // Öğretmen bilgisi
      const { data: teacherData, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (error || !teacherData) {
        setLoading(false);
        return;
      }

      // Tamamlanan ders sayısı
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('status', 'COMPLETED');

      setTeacher({
        ...teacherData,
        total_lessons: count || 0,
      });

      // Müsaitlik
      const today = new Date().toISOString().split('T')[0];
      const { data: availData } = await supabase
        .from('availabilities')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('date', today)
        .eq('is_booked', false)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(50);

      setAvailability(availData || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedTime || !teacher) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Randevu almak için giriş yapmalısınız');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledAt = `${selectedTime.date}T${selectedTime.start_time}`;
      const subject = selectedSubject || teacher.subjects?.[0] || 'Ders';
      const amount = teacher.base_price || 500;

      // Paratika ödeme session oluştur
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacher.id,
          studentId: user.id,
          studentEmail: studentProfile?.email || user.email,
          studentName: studentProfile?.full_name || 'Öğrenci',
          studentPhone: '',
          subject,
          scheduledAt,
          amount,
          availabilityId: selectedTime.id,
        }),
      });

      const result = await response.json();

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast.error('Ödeme sayfası oluşturulamadı');
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Benzersiz tarihler
  const uniqueDates = Array.from(new Set(availability.map(a => a.date))).slice(0, 7);
  const availableTimes = availability.filter(a => a.date === selectedDate && !a.is_booked);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return {
      day: days[date.getDay()],
      dayNum: date.getDate().toString(),
      month: months[date.getMonth()],
    };
  };

  const initials = teacher?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
          <div className="container-wide flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!teacher) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
          <div className="container-wide text-center py-20">
            <h1 className="text-2xl font-bold text-navy-900 mb-4">Öğretmen bulunamadı</h1>
            <Link href="/teachers" className="text-navy-600 hover:underline">← Öğretmenlere Dön</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const basePrice = teacher.base_price || 0;
  const commission = basePrice * 0.20;
  const subtotal = basePrice + commission;
  const tax = subtotal * 0.20;
  const price = Math.round((subtotal + tax) / 100) * 100;

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-navy-900">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/teachers" className="hover:text-navy-900">Öğretmenler</Link>
            <span>/</span>
            <span className="text-navy-900">{teacher.full_name}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sol Kolon - Profil */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ana Bilgiler */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex gap-6">
                  {teacher.avatar_url ? (
                    <img
                      src={teacher.avatar_url}
                      alt={teacher.full_name}
                      className="w-32 h-32 rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-navy-800 to-navy-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-md">
                      {initials}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {teacher.is_featured && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            EDİTÖRÜN SEÇİMİ
                          </span>
                        )}
                        <h1 className="text-3xl font-bold text-navy-900 mb-1">{teacher.full_name}</h1>
                        <p className="text-lg text-slate-500">
                          {teacher.education_levels?.join(', ') || 'Öğretmen'}
                        </p>
                      </div>
                      {teacher.rating && (
                        <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-full">
                          <svg className="w-5 h-5 text-amber-500 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-semibold text-amber-700">{teacher.rating}</span>
                        </div>
                      )}
                    </div>

                    {teacher.featured_headline && teacher.is_featured && (
                      <p className="text-amber-700 italic mt-2">&quot;{teacher.featured_headline}&quot;</p>
                    )}

                    <div className="flex gap-6 mt-4 text-sm text-slate-600">
                      {teacher.experience_years && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {teacher.experience_years} yıl deneyim
                        </span>
                      )}
                      {teacher.university && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          {teacher.university}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {teacher.total_lessons} ders tamamlandı
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tanıtım Videosu */}
              {teacher.video_url && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tanıtım Videosu
                  </h2>
                  <video
                    src={teacher.video_url}
                    controls
                    className="w-full rounded-xl border border-slate-200"
                    style={{ maxHeight: '400px' }}
                  >
                    Tarayıcınız video oynatmayı desteklemiyor.
                  </video>
                </div>
              )}

              {/* Hakkında */}
              {teacher.bio && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-4">Hakkında</h2>
                  <p className="text-slate-600 leading-relaxed">{teacher.bio}</p>
                </div>
              )}

              {/* Dersler */}
              {teacher.subjects && teacher.subjects.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-4">Verdiği Dersler</h2>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map((subject, i) => (
                      <span key={i} className="bg-navy-50 text-navy-700 text-sm font-medium px-4 py-2 rounded-full">{subject}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diploma */}
              {teacher.diploma_url && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Diploma / Sertifika
                  </h2>
                  <img
                    src={teacher.diploma_url}
                    alt="Diploma"
                    className="max-w-full rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(teacher.diploma_url!, '_blank')}
                  />
                  <p className="text-xs text-slate-400 mt-2">Büyütmek için tıklayın</p>
                </div>
              )}
            </div>

            {/* Sağ Kolon - Randevu */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-navy-900 mb-1">
                    ₺{price.toLocaleString('tr-TR')}
                  </div>
                  <div className="text-slate-500">/saat</div>
                </div>

                <button
                  onClick={async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.push("/register"); return; } setIsBookingOpen(true); }}
                  className="w-full bg-gradient-to-r from-navy-900 to-navy-700 text-white py-4 rounded-xl text-lg font-semibold hover:from-navy-800 hover:to-navy-600 transition-all mb-4"
                >
                  Randevu Al
                </button>

                <p className="text-sm text-slate-500 text-center">
                  Ücretsiz iptal: Dersten 24 saat öncesine kadar
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setIsBookingOpen(false)} />

          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
              <div>
                <h2 className="text-2xl font-bold text-navy-900">Randevu Al</h2>
                <p className="text-slate-500">{teacher.full_name} ile ders</p>
              </div>
              <button onClick={() => setIsBookingOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              {/* Tarih Seçimi */}
              <div className="mb-8">
                <h3 className="font-semibold text-navy-900 mb-4">Tarih Seçin</h3>
                {uniqueDates.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {uniqueDates.map((dateStr) => {
                      const { day, dayNum, month } = formatDate(dateStr);
                      return (
                        <button
                          key={dateStr}
                          onClick={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                          className={`flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 transition-all shrink-0 ${
                            selectedDate === dateStr
                              ? 'border-navy-600 bg-navy-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs text-slate-500 mb-1">{day}</span>
                          <span className="text-xl font-semibold text-navy-900">{dayNum}</span>
                          <span className="text-xs text-slate-400">{month}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500">Müsait tarih bulunamadı</p>
                )}
              </div>

              {/* Saat Seçimi */}
              {selectedDate && (
                <div className="mb-8">
                  <h3 className="font-semibold text-navy-900 mb-4">Saat Seçin</h3>
                  {availableTimes.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {availableTimes.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                            selectedTime?.id === slot.id
                              ? 'border-navy-600 bg-navy-50 text-navy-900'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {slot.start_time.substring(0, 5)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">Bu tarihte müsait saat bulunamadı</p>
                  )}
                </div>
              )}

              {/* Ders Seçimi */}
              {teacher.subjects && teacher.subjects.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-navy-900 mb-4">Ders Seçin</h3>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">Ders seçin...</option>
                    {teacher.subjects.map((subject, i) => (
                      <option key={i} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Özet */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-navy-900 mb-4">Ödeme Özeti</h3>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">1 Saatlik Ders</span>
                  <span className="text-2xl font-bold text-navy-900">₺{price.toLocaleString('tr-TR')}</span>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex gap-4">
                <button onClick={() => setIsBookingOpen(false)} className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50">
                  İptal
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!selectedTime || isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-navy-900 to-navy-700 text-white rounded-xl font-semibold hover:from-navy-800 hover:to-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'İşleniyor...' : 'Ödemeye Geç'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
