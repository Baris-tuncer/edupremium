'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export default function TeacherAvailabilityPage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [availability, setAvailability] = useState<Record<string, string[]>>({
    'Pazartesi': [],
    'Salı': [],
    'Çarşamba': [],
    'Perşembe': [],
    'Cuma': [],
    'Cumartesi': [],
    'Pazar': [],
  });
  const [reservedSlots, setReservedSlots] = useState<Record<string, string[]>>({});
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability on mount
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get dashboard to check if user is logged in as teacher
      const dashboard = await api.getTeacherDashboard();
      
      // For now, we'll use mock data until proper API endpoint returns availability
      // In production, this would fetch from /teachers/me/availability
      const mockAvailability: Record<string, string[]> = {
        'Pazartesi': ['10:00', '11:00', '14:00', '15:00'],
        'Salı': ['09:00', '10:00', '11:00'],
        'Çarşamba': ['14:00', '15:00', '16:00', '17:00'],
        'Perşembe': ['10:00', '11:00', '14:00'],
        'Cuma': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'Cumartesi': ['10:00', '11:00'],
        'Pazar': [],
      };
      
      // Mock reserved slots (appointments)
      const mockReserved: Record<string, string[]> = {
        'Pazartesi': ['10:00', '14:00'],
        'Salı': ['10:00'],
        'Çarşamba': ['15:00'],
        'Perşembe': ['11:00'],
        'Cuma': ['10:00', '15:00'],
        'Cumartesi': ['10:00'],
        'Pazar': [],
      };
      
      setAvailability(mockAvailability);
      setReservedSlots(mockReserved);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else {
        setError('Müsaitlik bilgileri yüklenirken hata oluştu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
    
    return daysOfWeek.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        day,
        date: date.getDate(),
        month: date.toLocaleDateString('tr-TR', { month: 'short' }),
        fullDate: date,
      };
    });
  };

  const weekDates = getWeekDates(currentWeek);

  const toggleSlot = (day: string, time: string) => {
    if (!isEditing) return;
    
    const key = `${day}-${time}`;
    if (selectedSlots.includes(key)) {
      setSelectedSlots(selectedSlots.filter(s => s !== key));
    } else {
      setSelectedSlots([...selectedSlots, key]);
    }
  };

  const isSlotAvailable = (day: string, time: string) => {
    return availability[day]?.includes(time);
  };

  const isSlotSelected = (day: string, time: string) => {
    return selectedSlots.includes(`${day}-${time}`);
  };

  const isSlotReserved = (day: string, time: string) => {
    return reservedSlots[day]?.includes(time);
  };

  const saveAvailability = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Apply changes to local state
      const newAvailability: Record<string, string[]> = { ...availability };
      
      selectedSlots.forEach(slot => {
        const [day, time] = slot.split('-');
        if (!newAvailability[day]) {
          newAvailability[day] = [];
        }
        if (newAvailability[day].includes(time)) {
          newAvailability[day] = newAvailability[day].filter(t => t !== time);
        } else {
          newAvailability[day].push(time);
          newAvailability[day].sort();
        }
      });
      
      // Convert to API format
      const slots: AvailabilitySlot[] = [];
      Object.entries(newAvailability).forEach(([day, times]) => {
        const dayIndex = daysOfWeek.indexOf(day);
        times.forEach(time => {
          const [hour] = time.split(':');
          const endHour = String(parseInt(hour) + 1).padStart(2, '0');
          slots.push({
            dayOfWeek: dayIndex,
            startTime: time,
            endTime: `${endHour}:00`,
            isRecurring: true,
          });
        });
      });
      
      // Save to API
      await api.updateTeacherAvailability(slots);
      
      setAvailability(newAvailability);
      setSelectedSlots([]);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving availability:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else {
        setError('Kaydetme sırasında hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const totalHours = Object.values(availability).reduce((sum, times) => sum + times.length, 0);
  const reservedCount = Object.values(reservedSlots).reduce((sum, times) => sum + times.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/teacher/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-navy-900">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </div>
            <h1 className="font-display text-xl font-semibold text-navy-900">Müsaitlik Takvimi</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6">
            <div className="text-3xl font-bold text-navy-900">{totalHours}</div>
            <div className="text-slate-600 text-sm">Haftalık Müsait Saat</div>
          </div>
          <div className="card p-6">
            <div className="text-3xl font-bold text-green-600">{reservedCount}</div>
            <div className="text-slate-600 text-sm">Rezerve Edilmiş</div>
          </div>
          <div className="card p-6">
            <div className="text-3xl font-bold text-gold-500">{totalHours - reservedCount}</div>
            <div className="text-slate-600 text-sm">Boş Slot</div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentWeek(currentWeek - 1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-semibold text-navy-900">
                {weekDates[0].date} {weekDates[0].month} - {weekDates[6].date} {weekDates[6].month}
              </span>
              <button
                onClick={() => setCurrentWeek(currentWeek + 1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {currentWeek !== 0 && (
                <button
                  onClick={() => setCurrentWeek(0)}
                  className="text-sm text-gold-600 hover:text-gold-700"
                >
                  Bu Hafta
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => { setIsEditing(false); setSelectedSlots([]); }}
                    className="btn-ghost"
                    disabled={isSaving}
                  >
                    İptal
                  </button>
                  <button 
                    onClick={saveAvailability} 
                    className="btn-primary"
                    disabled={isSaving || selectedSlots.length === 0}
                  >
                    {isSaving ? 'Kaydediliyor...' : `Kaydet (${selectedSlots.length} değişiklik)`}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-primary">
                  Düzenle
                </button>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Müsait</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gold-500 rounded"></div>
              <span>Rezerve</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-200 rounded"></div>
              <span>Kapalı</span>
            </div>
            {isEditing && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Seçili</span>
              </div>
            )}
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-600 font-medium w-20">Saat</th>
                  {weekDates.map((day) => (
                    <th key={day.day} className="p-2 text-center">
                      <div className="font-medium text-navy-900">{day.day}</div>
                      <div className="text-sm text-slate-500">{day.date} {day.month}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="p-2 text-slate-600 font-medium">{time}</td>
                    {daysOfWeek.map((day) => {
                      const isAvailable = isSlotAvailable(day, time);
                      const isSelected = isSlotSelected(day, time);
                      const isReserved = isSlotReserved(day, time);
                      
                      return (
                        <td key={`${day}-${time}`} className="p-1">
                          <button
                            onClick={() => toggleSlot(day, time)}
                            disabled={!isEditing || isReserved}
                            className={`w-full h-10 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : isReserved
                                ? 'bg-gold-500 cursor-not-allowed'
                                : isAvailable
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-slate-200'
                            } ${isEditing && !isReserved ? 'cursor-pointer' : ''}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-4">Hızlı Ayarlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => {
                if (!isEditing) return;
                const slots: string[] = [];
                daysOfWeek.slice(0, 5).forEach(day => {
                  ['09:00', '10:00', '11:00', '12:00'].forEach(time => {
                    if (!isSlotReserved(day, time)) {
                      slots.push(`${day}-${time}`);
                    }
                  });
                });
                setSelectedSlots(slots);
              }}
              disabled={!isEditing}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
            >
              <div className="font-medium text-navy-900 mb-1">Hafta İçi Sabah</div>
              <div className="text-sm text-slate-600">Pzt-Cum 09:00-12:00</div>
            </button>
            <button 
              onClick={() => {
                if (!isEditing) return;
                const slots: string[] = [];
                daysOfWeek.slice(0, 5).forEach(day => {
                  ['14:00', '15:00', '16:00', '17:00', '18:00'].forEach(time => {
                    if (!isSlotReserved(day, time)) {
                      slots.push(`${day}-${time}`);
                    }
                  });
                });
                setSelectedSlots(slots);
              }}
              disabled={!isEditing}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
            >
              <div className="font-medium text-navy-900 mb-1">Hafta İçi Öğleden Sonra</div>
              <div className="text-sm text-slate-600">Pzt-Cum 14:00-18:00</div>
            </button>
            <button 
              onClick={() => {
                if (!isEditing) return;
                const slots: string[] = [];
                daysOfWeek.slice(5, 7).forEach(day => {
                  ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].forEach(time => {
                    if (!isSlotReserved(day, time)) {
                      slots.push(`${day}-${time}`);
                    }
                  });
                });
                setSelectedSlots(slots);
              }}
              disabled={!isEditing}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
            >
              <div className="font-medium text-navy-900 mb-1">Hafta Sonu</div>
              <div className="text-sm text-slate-600">Cmt-Paz 10:00-16:00</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
