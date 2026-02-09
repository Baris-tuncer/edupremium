'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { X, Calendar, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { CHANGE_REASONS, PACKAGE_CONSTANTS } from '@/lib/package-calculator';

interface RescheduleModalProps {
  lesson: {
    id: string;
    scheduled_at: string;
    reschedule_count: number;
  };
  teacherId: string;
  teacherName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Availability {
  id: string;
  start_time: string;
  end_time: string;
}

export default function RescheduleModal({
  lesson,
  teacherId,
  teacherName,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  const [step, setStep] = useState<'select' | 'reason'>('select');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [reasonCategory, setReasonCategory] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    today.setDate(today.getDate() + diff);
    return today;
  });

  const remainingChanges = PACKAGE_CONSTANTS.MAX_RESCHEDULE_PER_LESSON - lesson.reschedule_count;

  useEffect(() => {
    fetchAvailabilities();
  }, [teacherId]);

  const fetchAvailabilities = async () => {
    try {
      const now = new Date();
      // 24 saat sonrasından itibaren müsaitlikleri al
      const minTime = new Date(now.getTime() + PACKAGE_CONSTANTS.RESCHEDULE_DEADLINE_HOURS * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('availabilities')
        .select('id, start_time, end_time')
        .eq('teacher_id', teacherId)
        .eq('is_booked', false)
        .eq('is_active', true)
        .gte('start_time', minTime.toISOString())
        .order('start_time', { ascending: true })
        .limit(100);

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (error) {
      console.error('Availabilities fetch error:', error);
      toast.error('Müsait saatler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !reasonCategory) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Oturum hatası');
        return;
      }

      const response = await fetch('/api/packages/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          newAvailabilityId: selectedSlot.id,
          newScheduledAt: selectedSlot.start_time,
          reasonCategory,
          reasonText: reasonText || null,
          initiatedBy: 'student',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Tarih değiştirilemedi');
      }

      toast.success('Ders tarihi güncellendi!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Haftanın günlerini oluştur
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Belirli bir gün için müsaitlikleri filtrele
  const getAvailabilitiesForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return availabilities.filter((a) => {
      const startTime = new Date(a.start_time);
      return startTime >= dayStart && startTime <= dayEnd;
    });
  };

  const formatDayHeader = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = date.getTime() === tomorrow.getTime();

    if (isToday) return 'Bugün';
    if (isTomorrow) return 'Yarın';
    return date.toLocaleDateString('tr-TR', { weekday: 'short' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    // Geçmiş haftaya gitme
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newStart >= today) {
      setCurrentWeekStart(newStart);
    }
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const canGoPrev = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    return prevWeek >= today;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Tarih Değiştir</h2>
            <p className="text-sm text-slate-600 mt-1">
              {teacherName} ile dersiniz için yeni bir tarih seçin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Warning */}
        <div className="px-6 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Kalan değişiklik hakkınız: <span className="font-bold">{remainingChanges}</span>
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Her ders için en fazla {PACKAGE_CONSTANTS.MAX_RESCHEDULE_PER_LESSON} kez tarih değişikliği yapabilirsiniz.
                Derse {PACKAGE_CONSTANTS.RESCHEDULE_DEADLINE_HOURS} saatten az kaldıysa değişiklik yapılamaz.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'select' ? (
            <>
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPrevWeek}
                  disabled={!canGoPrev()}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-slate-700">
                  {currentWeekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} -
                  {' '}
                  {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </span>
                <button
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const dayAvailabilities = getAvailabilitiesForDay(day);
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <div key={day.toISOString()} className="text-center">
                        <div className={`text-xs font-medium mb-2 ${isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                          {formatDayHeader(day)}
                        </div>
                        <div className={`text-sm font-bold mb-2 ${isPast ? 'text-slate-300' : 'text-slate-800'}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {dayAvailabilities.length === 0 ? (
                            <p className="text-[10px] text-slate-300 py-4">-</p>
                          ) : (
                            dayAvailabilities.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                className={`w-full text-xs py-1.5 rounded-lg transition-colors ${
                                  selectedSlot?.id === slot.id
                                    ? 'bg-[#D4AF37] text-[#0F172A] font-bold'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {formatTime(slot.start_time)}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected Slot Info */}
              {selectedSlot && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-800">Seçilen Tarih</p>
                      <p className="text-sm text-emerald-700">
                        {new Date(selectedSlot.start_time).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Reason Selection Step */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Değişiklik Sebebi <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {CHANGE_REASONS.student.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        reasonCategory === reason.value
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={reasonCategory === reason.value}
                        onChange={(e) => setReasonCategory(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        reasonCategory === reason.value
                          ? 'border-[#D4AF37] bg-[#D4AF37]'
                          : 'border-slate-300'
                      }`}>
                        {reasonCategory === reason.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium text-slate-700">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {reasonCategory === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="Lütfen sebebinizi açıklayın..."
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{reasonText.length}/200</p>
                </div>
              )}

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Eski tarih:</span>{' '}
                  {new Date(lesson.scheduled_at).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">Yeni tarih:</span>{' '}
                  {selectedSlot && new Date(selectedSlot.start_time).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          {step === 'reason' && (
            <button
              onClick={() => setStep('select')}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              ← Geri
            </button>
          )}
          <div className="flex-1" />
          {step === 'select' ? (
            <button
              onClick={() => setStep('reason')}
              disabled={!selectedSlot}
              className="px-6 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Devam Et
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!reasonCategory || submitting}
              className="px-6 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Kaydediliyor...' : 'Tarihi Değiştir'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
