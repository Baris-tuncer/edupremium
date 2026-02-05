'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
};

const formatDayName = (date: Date) => {
  return date.toLocaleDateString('tr-TR', { weekday: 'long' });
};

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

export default function AvailabilityPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [slots, setSlots] = useState<Record<string, any>>({});
  const [originalSlots, setOriginalSlots] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const start = getStartOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDates(days);
  }, [currentDate]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Oturum bulunamadı');
        return;
      }
      setUserId(user.id);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (userId && weekDates.length > 0) {
      fetchAvailabilities(userId);
    }
  }, [userId, weekDates]);

  const fetchAvailabilities = async (teacherId: string) => {
    if (weekDates.length === 0) return;

    const weekStart = weekDates[0];
    const weekEnd = addDays(weekDates[6], 1);

    const { data, error } = await supabase
      .from('availabilities')
      .select('*')
      .eq('teacher_id', teacherId)
      .gte('start_time', weekStart.toISOString())
      .lt('start_time', weekEnd.toISOString());

    if (error) {
      console.error('Fetch error:', error);
      return;
    }

    const slotMap: Record<string, any> = {};
    data?.forEach(avail => {
      const startDate = new Date(avail.start_time);
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const hour = String(startDate.getHours()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const key = `${dateStr}-${hour}:00`;
      
      slotMap[key] = {
        id: avail.id,
        status: avail.is_booked ? 'booked' : 'available',
      };
    });

    setSlots(slotMap);
    setOriginalSlots(JSON.parse(JSON.stringify(slotMap)));
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(addDays(currentDate, direction === 'next' ? 7 : -7));
  };

  const getDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSlotClick = (date: Date, hour: string) => {
    const dateStr = getDateStr(date);
    const key = `${dateStr}-${hour}`;
    const slot = slots[key];

    if (slot?.status === 'booked') {
      toast.error('Bu saat rezerve edilmiş');
      return;
    }

    const [h] = hour.split(':');
    const slotDate = new Date(date);
    slotDate.setHours(parseInt(h), 0, 0, 0);
    
    if (slotDate < new Date()) {
      toast.error('Geçmiş tarihe müsaitlik eklenemez');
      return;
    }

    const newSlots = { ...slots };
    if (slot) {
      delete newSlots[key];
    } else {
      newSlots[key] = { status: 'available', isNew: true };
    }
    setSlots(newSlots);
  };

  const hasChanges = JSON.stringify(slots) !== JSON.stringify(originalSlots);

  const handleSaveChanges = async () => {
    if (!userId) return;
    setIsSaving(true);

    try {
      const toDelete = Object.keys(originalSlots).filter(key => !slots[key] && originalSlots[key]?.id);
      const toAdd = Object.keys(slots).filter(key => !originalSlots[key]);

      // Silme
      for (const key of toDelete) {
        const { error } = await supabase
          .from('availabilities')
          .delete()
          .eq('id', originalSlots[key].id);
        
        if (error) {
          toast.error('Silme hatası');
          setIsSaving(false);
          return;
        }
      }

      // Ekleme
      for (const key of toAdd) {
        const [dateStr, hour] = [key.substring(0, 10), key.substring(11)];
        const [h] = hour.split(':');
        
        const startTime = new Date(`${dateStr}T${hour}:00`);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        const { error } = await supabase
          .from('availabilities')
          .insert({
            teacher_id: userId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            is_active: true,
            is_booked: false
          });

        if (error) {
          console.error('Insert error:', error);
          toast.error('Ekleme hatası: ' + error.message);
          setIsSaving(false);
          return;
        }
      }

      toast.success('Kaydedildi!');
      await fetchAvailabilities(userId);
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kaydetme hatası');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Müsaitlik Takvimi</h1>
          <p className="text-slate-500 mt-1">Müsait olduğunuz saatleri seçin ve kaydedin.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl p-2 rounded-xl shadow-sm border border-white/50">
            <button onClick={() => changeWeek('prev')} className="p-2 hover:bg-slate-100 rounded-lg">←</button>
            <span className="font-bold text-[#0F172A] min-w-[180px] text-center text-sm">
              {weekDates.length > 0 && `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`}
            </span>
            <button onClick={() => changeWeek('next')} className="p-2 hover:bg-slate-100 rounded-lg">→</button>
          </div>

          <button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2
              ${hasChanges ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className="flex gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
          <span>Müsait</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#0F172A] rounded"></div>
          <span>Rezerve</span>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#0F172A]/5 border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-20 text-xs font-bold text-slate-400">SAAT</th>
                {weekDates.map(date => (
                  <th key={date.toISOString()} className="p-4 text-center border-l border-slate-100">
                    <div className="text-sm font-bold text-slate-900">{formatDayName(date)}</div>
                    <div className="text-xs text-slate-500 mt-1">{formatDate(date)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className="border-t border-slate-100">
                  <td className="p-3 text-sm font-semibold text-slate-500 text-center bg-slate-50">{hour}</td>
                  {weekDates.map(date => {
                    const dateStr = getDateStr(date);
                    const key = `${dateStr}-${hour}`;
                    const slot = slots[key];
                    const isBooked = slot?.status === 'booked';
                    const isAvailable = slot?.status === 'available';
                    
                    const [h] = hour.split(':');
                    const slotDate = new Date(date);
                    slotDate.setHours(parseInt(h), 0, 0, 0);
                    const isPast = slotDate < new Date();

                    return (
                      <td key={key} className="p-1 border-l border-slate-100 h-14">
                        <button
                          onClick={() => handleSlotClick(date, hour)}
                          disabled={isPast || isBooked}
                          className={`w-full h-full rounded-lg text-xs font-medium transition-all flex items-center justify-center
                            ${isBooked ? 'bg-[#0F172A] text-white cursor-not-allowed' 
                              : isAvailable ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200' 
                              : isPast ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                              : 'hover:bg-slate-100 text-slate-400'}`}
                        >
                          {isBooked ? 'Rezerve' : isAvailable ? 'Müsait' : isPast ? '-' : '+'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
