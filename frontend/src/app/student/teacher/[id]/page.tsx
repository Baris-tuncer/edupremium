'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Teacher {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  video_url: string;
  subjects: string[];
  hourly_rate_display: number;
  base_price: number;
}

interface Availability {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    try {
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

      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', teacherId)
        .single();
      
      setTeacher(teacherData);
      if (teacherData?.subjects?.length > 0) {
        setSelectedSubject(teacherData.subjects[0]);
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: availData } = await supabase
        .from('availabilities')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_booked', false)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      setAvailabilities(availData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedSlot || !selectedSubject || !currentUser || !studentProfile) {
      alert('Lutfen ders saati ve konu secin');
      return;
    }

    setPaymentLoading(true);

    try {
      const scheduledAt = `${selectedSlot.date}T${selectedSlot.start_time}`;
      
      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacherId,
          studentId: currentUser.id,
          studentEmail: currentUser.email,
          studentName: studentProfile.full_name || currentUser.email,
          studentPhone: studentProfile.phone || '',
          subject: selectedSubject,
          scheduledAt: scheduledAt,
          amount: teacher?.hourly_rate_display || teacher?.base_price || 0,
          availabilityId: selectedSlot.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'Odeme baslatilamadi');
      }
    } catch (error: any) {
      alert('Hata: ' + error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatPrice = (price: number) => {
    return (price || 0).toLocaleString('tr-TR') + ' TL';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Ogretmen bulunamadi</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => router.back()} className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2">
          ← Geri
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {teacher.avatar_url ? (
                <img src={teacher.avatar_url} alt={teacher.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                  {teacher.full_name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{teacher.full_name}</h1>
              <p className="text-gray-600 mt-1">{teacher.title}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {teacher.subjects?.map((subject, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{subject}</span>
                ))}
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-green-600">{formatPrice(teacher.hourly_rate_display || teacher.base_price)}</span>
                <span className="text-gray-500 ml-2">/ ders</span>
              </div>
            </div>
          </div>

          {teacher.bio && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Hakkinda</h3>
              <p className="text-gray-600">{teacher.bio}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ders Rezervasyonu</h2>

          {!currentUser ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Ders almak icin giris yapmalisiniz</p>
              <a href="/student/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700">Giris Yap</a>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ders Konusu</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                  {teacher.subjects?.map((subject, i) => (
                    <option key={i} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Musait Saatler</label>
                {availabilities.length === 0 ? (
                  <p className="text-gray-500 py-4">Su an musait saat bulunmuyor</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {availabilities.map((slot) => (
                      <button key={slot.id} onClick={() => setSelectedSlot(slot)} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedSlot?.id === slot.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                        <p className="font-medium text-gray-900">{formatDate(slot.date)}</p>
                        <p className="text-gray-600">{slot.start_time} - {slot.end_time}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-gray-600">Secilen: {formatDate(selectedSlot.date)}, {selectedSlot.start_time}</p>
                      <p className="text-gray-600">Konu: {selectedSubject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{formatPrice(teacher.hourly_rate_display || teacher.base_price)}</p>
                    </div>
                  </div>
                  
                  <button onClick={handlePayment} disabled={paymentLoading} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {paymentLoading ? 'Odeme sayfasina yonlendiriliyor...' : 'Odeme Yap ve Ders Al'}
                  </button>
                  
                  <p className="text-center text-gray-500 text-sm mt-3">Guvenli odeme ile kredi/banka karti ile odeme yapabilirsiniz</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
