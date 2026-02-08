'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { X, Calendar, Clock, Gift, Tag, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  lesson_count: number;
  bonus_lessons: number;
  discount_percent: number;
  single_lesson_display_price: number;
  package_total_price: number;
  teacher_total_earnings: number;
  ends_at: string;
}

interface Availability {
  id: string;
  start_time: string;
  end_time: string;
}

interface PackagePurchaseModalProps {
  campaign: Campaign;
  teacherId: string;
  teacherName: string;
  onClose: () => void;
}

export default function PackagePurchaseModal({
  campaign,
  teacherId,
  teacherName,
  onClose,
}: PackagePurchaseModalProps) {
  const [step, setStep] = useState<'info' | 'slots' | 'confirm'>('info');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Array<{ availabilityId: string; scheduledAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  // Tarih navigasyonu
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const totalLessons = campaign.lesson_count + campaign.bonus_lessons;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Kullanıcı bilgisi
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setStudentProfile(profile);
    }

    // Müsaitlikleri al
    await fetchAvailabilities();
    setLoading(false);
  };

  const fetchAvailabilities = async () => {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('availabilities')
      .select('id, start_time, end_time')
      .eq('teacher_id', teacherId)
      .eq('is_booked', false)
      .eq('is_active', true)
      .gte('start_time', now)
      .order('start_time', { ascending: true })
      .limit(200);

    if (error) {
      console.error('Availability fetch error:', error);
    }
    setAvailabilities(data || []);
  };

  const toggleSlot = (availability: Availability) => {
    const isSelected = selectedSlots.some(s => s.availabilityId === availability.id);

    if (isSelected) {
      setSelectedSlots(prev => prev.filter(s => s.availabilityId !== availability.id));
    } else {
      if (selectedSlots.length >= totalLessons) {
        toast.error(`Maksimum ${totalLessons} ders seçebilirsiniz`);
        return;
      }
      setSelectedSlots(prev => [
        ...prev,
        { availabilityId: availability.id, scheduledAt: availability.start_time }
      ]);
    }
  };

  const handlePurchase = async () => {
    if (!currentUser) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (selectedSlots.length !== totalLessons) {
      toast.error(`Lütfen ${totalLessons} ders seçin`);
      return;
    }

    setPurchasing(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Oturum hatası');
        setPurchasing(false);
        return;
      }

      // Slotları local storage'a kaydet (callback için)
      localStorage.setItem('pending_package_slots', JSON.stringify(selectedSlots));

      const response = await fetch('/api/packages/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          teacherId,
          selectedSlots,
          studentEmail: currentUser.email,
          studentName: studentProfile?.full_name || currentUser.email,
          studentPhone: studentProfile?.phone || '',
        }),
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        // Pending slots'u Supabase'e de kaydet (yedek)
        await supabase.from('pending_package_slots').upsert({
          package_payment_id: result.packagePaymentId,
          slots: selectedSlots,
        });

        window.location.href = result.paymentUrl;
      } else {
        toast.error(result.error || 'Ödeme başlatılamadı');
        setPurchasing(false);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Bir hata oluştu');
      setPurchasing(false);
    }
  };

  // Haftalık görünüm için tarih hesaplamaları
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getAvailabilitiesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availabilities.filter(a => {
      const slotDate = new Date(a.start_time).toISOString().split('T')[0];
      return slotDate === dateStr;
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    if (newStart >= new Date()) {
      setCurrentWeekStart(newStart);
    }
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const weekDates = getWeekDates();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {step !== 'info' && (
                <button
                  onClick={() => setStep(step === 'confirm' ? 'slots' : 'info')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold">{campaign.name}</h2>
                <p className="text-white/60 text-sm">{teacherName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-6">
            {['info', 'slots', 'confirm'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s
                      ? 'bg-[#D4AF37] text-[#0F172A]'
                      : ['info', 'slots', 'confirm'].indexOf(step) > i
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/20 text-white/50'
                  }`}
                >
                  {['info', 'slots', 'confirm'].indexOf(step) > i ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    step === s ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {s === 'info' ? 'Paket Bilgisi' : s === 'slots' ? 'Tarih Seçimi' : 'Onay'}
                </span>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 ${['info', 'slots', 'confirm'].indexOf(step) > i ? 'bg-emerald-500' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : step === 'info' ? (
            <div className="space-y-6">
              {/* Paket Detayları */}
              <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-2xl p-6 border border-[#D4AF37]/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                    {campaign.type === 'package_discount' ? (
                      <Tag className="w-6 h-6 text-[#0F172A]" />
                    ) : (
                      <Gift className="w-6 h-6 text-[#0F172A]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#0F172A]">{campaign.name}</h3>
                    {campaign.description && (
                      <p className="text-slate-600 text-sm mt-1">{campaign.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        campaign.type === 'package_discount'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {campaign.type === 'package_discount' ? 'İndirimli Paket' : 'Bonus Ders Paketi'}
                      </span>
                      {campaign.discount_percent > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          %{campaign.discount_percent} İndirim
                        </span>
                      )}
                      {campaign.bonus_lessons > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                          +{campaign.bonus_lessons} Hediye Ders
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fiyat Detayları */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-[#0F172A] mb-4">Fiyat Detayları</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Toplam Ders</span>
                    <span className="font-bold text-[#0F172A]">
                      {totalLessons}
                      {campaign.bonus_lessons > 0 && (
                        <span className="text-emerald-600 text-sm ml-1">(+{campaign.bonus_lessons} hediye)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tekil Ders Fiyatı</span>
                    <span className="font-medium text-slate-700">
                      {campaign.single_lesson_display_price.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                  {campaign.discount_percent > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>İndirim (%{campaign.discount_percent})</span>
                      <span className="font-medium">
                        -{((campaign.single_lesson_display_price * campaign.lesson_count) - campaign.package_total_price).toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-[#0F172A]">Toplam Ödeme</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#D4AF37]">
                        {campaign.package_total_price.toLocaleString('tr-TR')} TL
                      </span>
                      <span className="block text-xs text-slate-400">(KDV Dahil)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kurallar */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-[#0F172A] mb-4">Paket Kuralları</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Tüm ders tarihlerini şimdi seçeceksiniz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Her ders için maksimum 2 tarih değişikliği hakkınız var</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Değişiklikler en az 24 saat önce yapılmalıdır</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>İptal durumunda yapılan dersler tekil fiyattan hesaplanır</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : step === 'slots' ? (
            <div className="space-y-6">
              {/* Seçim Durumu */}
              <div className="bg-[#0F172A] rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Seçilen Ders</p>
                    <p className="text-2xl font-bold">
                      {selectedSlots.length} / {totalLessons}
                    </p>
                  </div>
                  {selectedSlots.length < totalLessons && (
                    <p className="text-[#D4AF37] text-sm font-medium">
                      {totalLessons - selectedSlots.length} ders daha seçin
                    </p>
                  )}
                  {selectedSlots.length === totalLessons && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Tamamlandı!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hafta Navigasyonu */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPreviousWeek}
                  disabled={currentWeekStart <= new Date()}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-[#0F172A]">
                  {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </span>
                <button
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Takvim Grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, dateIndex) => {
                  const dayAvailabilities = getAvailabilitiesForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = date < new Date() && !isToday;

                  return (
                    <div key={dateIndex} className="space-y-2">
                      <div
                        className={`text-center p-2 rounded-lg ${
                          isToday
                            ? 'bg-[#D4AF37] text-[#0F172A]'
                            : isPast
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        <p className="text-xs font-bold uppercase">
                          {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </p>
                        <p className="text-lg font-bold">{date.getDate()}</p>
                      </div>

                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {dayAvailabilities.length === 0 ? (
                          <p className="text-[10px] text-slate-400 text-center py-2">-</p>
                        ) : (
                          dayAvailabilities.map((avail) => {
                            const isSelected = selectedSlots.some(s => s.availabilityId === avail.id);
                            const isPastSlot = new Date(avail.start_time) < new Date();

                            return (
                              <button
                                key={avail.id}
                                onClick={() => !isPastSlot && toggleSlot(avail)}
                                disabled={isPastSlot}
                                className={`w-full text-center py-1.5 px-1 text-xs font-medium rounded-lg transition-all ${
                                  isPastSlot
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-[#D4AF37] text-[#0F172A] ring-2 ring-[#D4AF37] ring-offset-1'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5'
                                }`}
                              >
                                {formatTime(avail.start_time)}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Seçilen Dersler Listesi */}
              {selectedSlots.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <h4 className="font-bold text-[#0F172A] mb-3 text-sm">Seçilen Dersler</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSlots
                      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                      .map((slot, index) => (
                        <div
                          key={slot.availabilityId}
                          className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5"
                        >
                          <span className="w-5 h-5 bg-[#D4AF37] text-[#0F172A] rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-xs font-medium text-slate-700">
                            {new Date(slot.scheduledAt).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <button
                            onClick={() => toggleSlot({ id: slot.availabilityId, start_time: slot.scheduledAt, end_time: '' })}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Özet */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800">Her şey hazır!</h3>
                    <p className="text-sm text-emerald-700">Ödemeyi tamamlayarak dersleri onaylayın</p>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Paket</span>
                    <span className="font-bold text-[#0F172A]">{campaign.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Öğretmen</span>
                    <span className="font-medium text-[#0F172A]">{teacherName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Toplam Ders</span>
                    <span className="font-bold text-[#0F172A]">{totalLessons}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-[#0F172A]">Toplam Ödeme</span>
                    <span className="text-xl font-bold text-[#D4AF37]">
                      {campaign.package_total_price.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>
              </div>

              {/* Seçilen Dersler */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-[#0F172A] mb-4">Seçilen Ders Tarihleri</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSlots
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .map((slot, index) => (
                      <div
                        key={slot.availabilityId}
                        className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3"
                      >
                        <span className="w-6 h-6 bg-[#D4AF37] text-[#0F172A] rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">
                            {new Date(slot.scheduledAt).toLocaleDateString('tr-TR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(slot.scheduledAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Güvence */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="font-medium text-blue-800">EduPremium Güvencesi</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Ödemeniz güvence altındadır. Her ders kayıt altına alınır ve haklarınız korunur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          {step === 'info' && (
            <button
              onClick={() => setStep('slots')}
              className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
            >
              Ders Tarihlerini Seç
            </button>
          )}
          {step === 'slots' && (
            <button
              onClick={() => setStep('confirm')}
              disabled={selectedSlots.length !== totalLessons}
              className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedSlots.length === totalLessons
                ? 'Devam Et'
                : `${totalLessons - selectedSlots.length} ders daha seçin`}
            </button>
          )}
          {step === 'confirm' && (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-[#D4AF37] text-[#0F172A] py-3.5 rounded-xl font-bold hover:bg-[#c4a030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? 'İşleniyor...' : `Ödemeye Geç (${campaign.package_total_price.toLocaleString('tr-TR')} TL)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
