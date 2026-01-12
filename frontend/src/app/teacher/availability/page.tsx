'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function TeacherAvailabilityPage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [reservedSlots, setReservedSlots] = useState<Record<string, string[]>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) api.setAccessToken(token);
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.getMyAvailability(); const data = result.data || result;
      
      // Convert API response to UI format
      const availMap: Record<string, string[]> = {};
      daysOfWeek.forEach(d => availMap[d] = []);
      
      if (Array.isArray(data)) {
        data.forEach((slot: any) => {
          const dayName = daysOfWeek[slot.dayOfWeek];
          if (dayName && slot.startTime) {
            availMap[dayName].push(slot.startTime.substring(0, 5));
          }
        });
      }
      setAvailability(availMap);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Müsaitlik bilgileri yüklenirken hata oluştu.');
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
      return { day, date: date.getDate(), month: date.toLocaleString('tr-TR', { month: 'short' }) };
    });
  };

  const weekDates = getWeekDates(currentWeek);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const toggleSlot = (day: string, time: string) => {
    if (!isEditing) return;
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(time)) {
        return { ...prev, [day]: daySlots.filter(t => t !== time) };
      } else {
        return { ...prev, [day]: [...daySlots, time].sort() };
      }
    });
  };

  const saveAvailability = async () => {
    try {
      setIsSaving(true);
      const slots: any[] = [];
      daysOfWeek.forEach((day, dayIndex) => {
        (availability[day] || []).forEach(time => {
          const endHour = parseInt(time.split(':')[0]) + 1;
          slots.push({
            dayOfWeek: dayIndex,
            startTime: time + ':00',
            endTime: endHour.toString().padStart(2, '0') + ':00:00',
            isRecurring: true
          });
        });
      });
      await api.updateTeacherAvailability(slots);
      setIsEditing(false);
      alert('Müsaitlik kaydedildi!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Kaydetme hatası!');
    } finally {
      setIsSaving(false);
    }
  };

  const getSlotStatus = (day: string, time: string) => {
    if (reservedSlots[day]?.includes(time)) return 'reserved';
    if (availability[day]?.includes(time)) return 'available';
    return 'unavailable';
  };

  const stats = {
    total: Object.values(availability).flat().length,
    reserved: Object.values(reservedSlots).flat().length,
    free: Object.values(availability).flat().length - Object.values(reservedSlots).flat().length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/teacher" className="text-gray-600 hover:text-gray-800">← Dashboard</Link>
          <h1 className="text-2xl font-bold">Müsaitlik Takvimi</h1>
          <div></div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow"><span className="text-2xl font-bold">{stats.total}</span><p className="text-gray-500">Haftalık Müsait Saat</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><span className="text-2xl font-bold text-orange-500">{stats.reserved}</span><p className="text-gray-500">Rezerve Edilmiş</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><span className="text-2xl font-bold text-green-500">{stats.free}</span><p className="text-gray-500">Boş Slot</p></div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentWeek(w => w - 1)} className="p-2 hover:bg-gray-100 rounded">&lt;</button>
              <span className="font-medium">{weekStart.date} {weekStart.month} - {weekEnd.date} {weekEnd.month}</span>
              <button onClick={() => setCurrentWeek(w => w + 1)} className="p-2 hover:bg-gray-100 rounded">&gt;</button>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">İptal</button>
                <button onClick={saveAvailability} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded">{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Düzenle</button>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div><span>Müsait</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded"></div><span>Rezerve</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded"></div><span>Kapalı</span></div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Saat</th>
                    {weekDates.map(d => (
                      <th key={d.day} className="p-2 text-center">
                        <div>{d.day}</div>
                        <div className="text-sm text-gray-500">{d.date} {d.month}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="p-2 font-medium">{time}</td>
                      {daysOfWeek.map(day => {
                        const status = getSlotStatus(day, time);
                        return (
                          <td key={day} className="p-1">
                            <button
                              onClick={() => toggleSlot(day, time)}
                              disabled={!isEditing || status === 'reserved'}
                              className={`w-full h-10 rounded transition-colors ${
                                status === 'reserved' ? 'bg-orange-500' :
                                status === 'available' ? 'bg-green-500' : 'bg-gray-200'
                              } ${isEditing && status !== 'reserved' ? 'hover:opacity-80 cursor-pointer' : ''}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
