'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const DAYS = [
  { id: 0, name: 'Pazartesi' },
  { id: 1, name: 'Salı' },
  { id: 2, name: 'Çarşamba' },
  { id: 3, name: 'Perşembe' },
  { id: 4, name: 'Cuma' },
  { id: 5, name: 'Cumartesi' },
  { id: 6, name: 'Pazar' },
];

export default function TeacherAvailabilityPage() {
  const [availability, setAvailability] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const data = await api.getMyAvailability();
      setAvailability(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      toast.error('Müsaitlik bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: number) => {
    setAvailability([
      ...availability,
      {
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true,
      },
    ]);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: string, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateMyAvailability({ slots: availability });
      toast.success('Müsaitlik bilgileriniz güncellendi!');
      fetchAvailability();
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error('Güncelleme başarısız oldu');
    } finally {
      setIsSaving(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Müsaitlik Takviminiz</h1>
          <p className="text-slate-600">Hangi günlerde ve saatlerde ders vermek istediğinizi belirleyin</p>
        </div>

        <div className="space-y-6">
          {DAYS.map((day) => {
            const daySlots = availability.filter((slot) => slot.dayOfWeek === day.id);
            
            return (
              <div key={day.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold text-navy-900">{day.name}</h3>
                  <button
                    onClick={() => addTimeSlot(day.id)}
                    className="text-sm text-navy-600 hover:text-navy-700 font-medium"
                  >
                    + Saat Ekle
                  </button>
                </div>

                {daySlots.length > 0 ? (
                  <div className="space-y-3">
                    {daySlots.map((slot, index) => {
                      const globalIndex = availability.indexOf(slot);
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(globalIndex, 'startTime', e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(globalIndex, 'endTime', e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg"
                          />
                          <button
                            onClick={() => removeTimeSlot(globalIndex)}
                            className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">Bu gün için müsaitlik belirtilmemiş</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-navy-600 text-white rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
