'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast, Toaster } from 'react-hot-toast';

interface Teacher {
  id: string;
  firstName: string;
  lastNameInitial: string;
  profilePhotoUrl: string | null;
  introVideoUrl: string | null;
  bio: string | null;
  hourlyRate: number;
  branches: string[];
  subjects: string[];
  completedLessons: number;
  averageRating: number | null;
}

interface PricingConfig {
  commissionRate: number;
  taxRate: number;
}

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// Yuvarlama fonksiyonu
const roundToNearest100 = (value: number) => Math.round(value / 100) * 100;

// Veli fiyatı hesaplama
const calculateParentPrice = (teacherRate: number, config: PricingConfig) => {
  const commission = teacherRate * (config.commissionRate / 100);
  const subtotal = teacherRate + commission;
  const tax = subtotal * (config.taxRate / 100);
  return roundToNearest100(subtotal + tax);
};

// ============================================
// BOOKING MODAL
// ============================================
const BookingModal = ({ 
  isOpen, 
  onClose, 
  teacher, 
  parentPrice,
  availability 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  teacher: Teacher;
  parentPrice: number;
  availability: AvailabilitySlot[];
}) => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Benzersiz tarihleri al
  const uniqueDates = Array.from(new Set(availability.map(a => a.date))).slice(0, 7);
  
  // Seçili tarihteki saatler
  const availableTimes = availability
    .filter(a => a.date === selectedDate && !a.isBooked)
    .map(a => a.startTime);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return {
      day: days[date.getDay()],
      dayNum: date.getDate().toString(),
    };
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Lütfen tarih ve saat seçin');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Randevu almak için giriş yapmalısınız');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';
      const scheduledAt = `${selectedDate}T${selectedTime}:00.000Z`;
      
      const response = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherId: teacher.id,
          scheduledAt,
          subjectId: selectedSubject || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Randevu talebiniz oluşturuldu!');
        onClose();
        router.push('/student/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Randevu oluşturulamadı');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy-900">Randevu Al</h2>
            <p className="text-slate-500">{teacher.firstName} {teacher.lastNameInitial} ile ders</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {/* Tarih Seçimi */}
          <div className="mb-8">
            <h3 className="font-display font-semibold text-navy-900 mb-4">Tarih Seçin</h3>
            {uniqueDates.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {uniqueDates.map((dateStr) => {
                  const { day, dayNum } = formatDate(dateStr);
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
              <h3 className="font-display font-semibold text-navy-900 mb-4">Saat Seçin</h3>
              {availableTimes.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {availableTimes.map((time) => (
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
              ) : (
                <p className="text-slate-500">Bu tarihte müsait saat bulunamadı</p>
              )}
            </div>
          )}

          {/* Ders Seçimi */}
          {teacher.subjects.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display font-semibold text-navy-900 mb-4">Ders Seçin</h3>
              <select 
                className="input w-full"
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
            <h3 className="font-display font-semibold text-navy-900 mb-4">Ödeme Özeti</h3>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">1 Saatlik Ders</span>
              <span className="font-display text-2xl font-bold text-navy-900">
                ₺{parentPrice.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-4">
            <button onClick={onClose} className="btn-secondary flex-1">
              İptal
            </button>
            <button 
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'İşleniyor...' : 'Randevu Oluştur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================
export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({ commissionRate: 20, taxRate: 20 });
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
      fetchPricingConfig();
    }
  }, [teacherId]);

  const fetchTeacher = async () => {
    try {
      const [teacherRes, availabilityRes] = await Promise.all([
        fetch(`${baseUrl}/teachers/${teacherId}`),
        fetch(`${baseUrl}/teachers/${teacherId}/availability`),
      ]);

      if (teacherRes.ok) {
        const data = await teacherRes.json();
        setTeacher(data);
      }

      if (availabilityRes.ok) {
        const data = await availabilityRes.json();
        setAvailability(data || []);
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingConfig = async () => {
    try {
      const res = await fetch(`${baseUrl}/pricing/config`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setPricingConfig({
            commissionRate: data.data.commissionRate || 20,
            taxRate: data.data.taxRate || 20,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

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
            <Link href="/teachers" className="btn-primary">
              Öğretmenlere Dön
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const parentPrice = calculateParentPrice(teacher.hourlyRate, pricingConfig);
  const initials = `${teacher.firstName?.charAt(0) || ''}${teacher.lastNameInitial?.charAt(0) || ''}`;

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container-wide">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-navy-900">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/teachers" className="hover:text-navy-900">Öğretmenler</Link>
            <span>/</span>
            <span className="text-navy-900">{teacher.firstName} {teacher.lastNameInitial}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sol Kolon - Profil */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ana Bilgiler */}
              <div className="card p-8">
                <div className="flex gap-6">
                  {/* Avatar */}
                  {teacher.profilePhotoUrl ? (
                    <img 
                      src={teacher.profilePhotoUrl} 
                      alt={teacher.firstName}
                      className="w-32 h-32 rounded-2xl object-cover shadow-elegant"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-navy rounded-2xl flex items-center justify-center text-white font-display text-4xl font-semibold shadow-elegant">
                      {initials}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="font-display text-3xl font-bold text-navy-900 mb-1">
                          {teacher.firstName} {teacher.lastNameInitial}
                        </h1>
                        <p className="text-lg text-slate-500">
                          {teacher.branches.length > 0 ? teacher.branches.join(', ') : 'Öğretmen'}
                        </p>
                      </div>
                      {teacher.averageRating && (
                        <div className="flex items-center gap-1 bg-gold-50 px-4 py-2 rounded-full">
                          <svg className="w-5 h-5 text-gold-500 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-semibold text-gold-700">{teacher.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* İstatistikler */}
                    <div className="flex gap-6 mt-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{teacher.completedLessons} ders tamamlandı</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hakkında */}
              {teacher.bio && (
                <div className="card p-8">
                  <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Hakkında</h2>
                  <p className="text-slate-600 leading-relaxed">{teacher.bio}</p>
                </div>
              )}

              {/* Dersler */}
              {teacher.subjects.length > 0 && (
                <div className="card p-8">
                  <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Verdiği Dersler</h2>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map((subject, i) => (
                      <span key={i} className="badge badge-navy text-sm px-4 py-2">{subject}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tanıtım Videosu */}
              {teacher.introVideoUrl && (
                <div className="card p-8">
                  <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Tanıtım Videosu</h2>
                  <video 
                    controls 
                    className="w-full rounded-xl"
                    src={teacher.introVideoUrl}
                  />
                </div>
              )}
            </div>

            {/* Sağ Kolon - Randevu */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="font-display text-4xl font-bold text-navy-900 mb-1">
                    ₺{parentPrice.toLocaleString('tr-TR')}
                  </div>
                  <div className="text-slate-500">/saat</div>
                </div>

                <button 
                  onClick={() => setIsBookingOpen(true)}
                  className="btn-primary w-full py-4 text-lg mb-4"
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
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        teacher={teacher}
        parentPrice={parentPrice}
        availability={availability}
      />
    </>
  );
}
