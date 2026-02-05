import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

const DAYS = [
  { id: 1, label: 'Pazartesi' },
  { id: 2, label: 'Salı' },
  { id: 3, label: 'Çarşamba' },
  { id: 4, label: 'Perşembe' },
  { id: 5, label: 'Cuma' },
  { id: 6, label: 'Cumartesi' },
  { id: 0, label: 'Pazar' },
];

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  dayOfWeek: number;
  isActive: boolean;
  slots: TimeSlot[];
}

export default function AvailabilitySettings() {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((d) => ({
      dayOfWeek: d.id,
      isActive: false,
      slots: [{ startTime: '09:00', endTime: '17:00' }],
    }))
  );

  useEffect(() => {
    fetchAvailability();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAvailability = async () => {
    try {
      const res = await axios.get(`${API_URL}/teachers/me/availability`, {
        headers: getAuthHeader()
      });
      
      const data = res.data; 
      const slotsData = Array.isArray(data) ? data : (data.data || []);

      if (slotsData && Array.isArray(slotsData)) {
        const newSchedule = DAYS.map((day) => {
          const daySlots = slotsData.filter((item: any) => item.dayOfWeek === day.id);
          return {
            dayOfWeek: day.id,
            isActive: daySlots.length > 0,
            slots: daySlots.length > 0 
              ? daySlots.map((s: any) => ({ startTime: s.startTime, endTime: s.endTime }))
              : [{ startTime: '09:00', endTime: '17:00' }],
          };
        });
        setSchedule(newSchedule);
      }
    } catch (error) {
      console.error('Müsaitlik bilgisi alınamadı', error);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].isActive = !newSchedule[dayIndex].isActive;
    setSchedule(newSchedule);
  };

  const handleTimeChange = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[slotIndex][field] = value;
    setSchedule(newSchedule);
  };

  const addSlot = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.push({ startTime: '12:00', endTime: '13:00' });
    setSchedule(newSchedule);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots = newSchedule[dayIndex].slots.filter((_, i) => i !== slotIndex);
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: any[] = [];
      schedule.forEach((day) => {
        if (day.isActive) {
          day.slots.forEach((slot) => {
            payload.push({
              dayOfWeek: day.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          });
        }
      });

      console.log("Sunucuya gönderilen veri:", payload);

      await axios.put(`${API_URL}/teachers/me/availability`, 
        { slots: payload }, 
        { headers: getAuthHeader() }
      );
      
      alert('✅ Çalışma saatleriniz başarıyla kaydedildi!');
      fetchAvailability();
    } catch (error) {
      console.error('Kaydetme hatası', error);
      alert('❌ Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Çalışma Saatleri</h2>
          <p className="text-sm text-gray-500">Ders verebileceğiniz gün ve saatleri seçin.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      <div className="space-y-4">
        {schedule.map((day, dayIndex) => (
          <div key={day.dayOfWeek} className={`flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border transition-all ${day.isActive ? 'border-gray-300 bg-white/80 backdrop-blur-xl shadow-sm' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
            <div className="w-40 pt-2 flex items-center gap-3">
              <button 
                onClick={() => handleDayToggle(dayIndex)}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${day.isActive ? 'bg-black' : 'bg-gray-300'}`}
              >
                <span className={`block w-4 h-4 bg-white/80 backdrop-blur-xl rounded-full shadow transform transition-transform ${day.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`font-semibold ${day.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {DAYS.find(d => d.id === day.dayOfWeek)?.label}
              </span>
            </div>

            <div className="flex-1 space-y-3">
              {day.isActive ? (
                <>
                  {day.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md border border-gray-200">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                          className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                          className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700"
                        />
                      </div>
                      <button 
                        onClick={() => removeSlot(dayIndex, slotIndex)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSlot(dayIndex)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                  >
                    + Saat Ekle
                  </button>
                </>
              ) : (
                <div className="pt-2 text-sm text-gray-400 font-light italic">Hizmet dışı</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
