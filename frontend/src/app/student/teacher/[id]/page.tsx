'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { calculateDisplayPrice, formatPrice } from '@/lib/pricing';

interface Teacher {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  video_url: string;
  base_price: number;
  hourly_rate_display: number;
  commission_rate: number;
  subjects: string[];
  is_verified: boolean;
  diploma_url: string;
}

interface Availability {
  id: number;
  start_time: string;
  end_time: string;
}

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [lessonNote, setLessonNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    try {
      // Önce öğretmen bilgisini al (public - auth gerekmez)
      const { data: teacherData, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (teacherError) {
        console.error('Teacher fetch error:', teacherError);
      }
      if (!teacherData) {
        setLoading(false);
        return;
      }
      setTeacher(teacherData);
      if (teacherData.subjects?.length > 0) setSelectedSubject(teacherData.subjects[0]);

      // Müsaitlikleri al (public - auth gerekmez)
      const now = new Date().toISOString();
      const { data: availData, error: availError } = await supabase
        .from('availabilities')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_booked', false)
        .eq('is_active', true)
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(20);

      if (availError) {
        console.error('Availability fetch error:', availError);
      }
      setAvailabilities(availData || []);

      // Kullanıcı bilgisini al (opsiyonel)
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase.from('student_profiles').select('*').eq('id', user.id).single();
        setStudentProfile(profile);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!currentUser) { toast.error('Lütfen önce giriş yapın'); router.push('/student/login'); return; }
    if (!selectedSlot) { toast.error('Lütfen bir saat seçin'); return; }
    if (!selectedSubject) { toast.error('Lütfen bir ders seçin'); return; }
    if (!lessonNote.trim()) { toast.error('Lütfen ders konusunu belirtin'); return; }
    if (noteError) { toast.error('Lütfen nottaki uygunsuz ifadeyi düzeltin'); return; }

    setPurchasing(true);
    try {
      // Auth token al
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Oturum hatası. Lütfen tekrar giriş yapın.');
        router.push('/student/login');
        return;
      }

      const displayPrice = teacher?.hourly_rate_display || calculateDisplayPrice(teacher?.base_price || 0, teacher?.commission_rate || 0.25);

      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: displayPrice,
          teacherId: teacher?.id,
          studentId: currentUser.id,
          studentEmail: currentUser.email,
          studentName: studentProfile?.full_name || currentUser.email,
          availabilityId: selectedSlot.id,
          subject: selectedSubject,
          scheduledAt: selectedSlot.start_time,
          note: lessonNote,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Ödeme başlatılamadı');
      
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
      setPurchasing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!teacher) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Öğretmen Bulunamadı</h1><Link href="/student/dashboard" className="text-blue-600">Geri Dön</Link></div></div>;

  const displayPrice = teacher.hourly_rate_display || calculateDisplayPrice(teacher.base_price || 0, teacher.commission_rate || 0.25);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b"><div className="max-w-6xl mx-auto px-4 py-4"><Link href="/student/dashboard" className="text-blue-600 hover:underline flex items-center gap-2">← Öğretmenlere Dön</Link></div></div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-start gap-6">
                {teacher.avatar_url ? <img src={teacher.avatar_url} alt={teacher.full_name} className="w-24 h-24 rounded-full object-cover" /> : <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-3xl font-bold text-blue-600">{teacher.full_name?.charAt(0)}</span></div>}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{teacher.full_name}</h1>
                    {teacher.is_verified && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">✓ Onaylı</span>}
                  </div>
                  <p className="text-slate-600 mt-1">{teacher.title}</p>
                  <span className="text-2xl font-bold text-blue-600 mt-3 block">{formatPrice(displayPrice)}<span className="text-sm font-normal text-slate-500">/ders</span></span>
                </div>
              </div>
            </div>

            {teacher.video_url && <div className="bg-white rounded-2xl shadow-sm border p-6"><h2 className="text-lg font-semibold mb-4">Tanıtım Videosu</h2><video src={teacher.video_url} controls className="w-full max-h-64 rounded-xl object-contain" /></div>}
            {teacher.bio && <div className="bg-white rounded-2xl shadow-sm border p-6"><h2 className="text-lg font-semibold mb-4">Hakkında</h2><p className="text-slate-600 whitespace-pre-wrap">{teacher.bio}</p></div>}
            {teacher.subjects?.length > 0 && <div className="bg-white rounded-2xl shadow-sm border p-6"><h2 className="text-lg font-semibold mb-4">Verdiği Dersler</h2><div className="flex flex-wrap gap-2">{teacher.subjects.map((s, i) => <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{s}</span>)}</div></div>}
            {teacher.diploma_url && <div className="bg-white rounded-2xl shadow-sm border p-6"><h2 className="text-lg font-semibold mb-4">📜 Diploma / Sertifika</h2><img src={teacher.diploma_url} alt="Diploma" className="max-w-full rounded-lg border" /><p className="text-sm text-green-600 mt-2">✓ Diploma doğrulandı</p></div>}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Ders Satın Al</h2>

              {teacher.subjects?.length > 0 && <div className="mb-4"><label className="block text-sm font-medium mb-2">Ders Seçin</label><select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full px-4 py-2 border rounded-xl">{teacher.subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}</select></div>}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Müsait Saatler</label>
                {availabilities.length === 0 ? <p className="text-slate-500 text-sm">Şu an müsait saat bulunmuyor.</p> : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availabilities.map((slot) => {
                      const { date, time } = formatDateTime(slot.start_time);
                      return <button key={slot.id} onClick={() => setSelectedSlot(slot)} className={`w-full p-3 rounded-xl border text-left ${selectedSlot?.id === slot.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}><p className="font-medium">{date}</p><p className="text-sm text-slate-600">{time}</p></button>;
                    })}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Ders Konusu <span className="text-red-500">*</span></label>
                <p className="text-xs text-slate-500 mb-2">Almak istediğiniz ders konusunu belirtiniz.</p>
                <textarea
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${noteError ? "border-red-400" : "border-slate-200"}`}
                  rows={3}
                  maxLength={500}
                  placeholder="Örn: Matematik dersinde türev konusunda destek almak istiyorum..."
                  value={lessonNote}
                  onChange={(e) => {
                    const val = e.target.value;
                    const lower = val.toLowerCase().replace(/\s+/g, '');
                    const badWords = ["salak","aptal","gerizekalı","mal","dangalak","ahmak","budala","hıyar","öküz","eşek","enayi","gerizekalı","pislik","şerefsiz","namussuz","ahlaksız","terbiyesiz","siktir","amk","aq","orospu","piç","yavşak","göt","sikik","yarrak","kaltak","fahişe","ibne","pezevenk","puşt","gavat"];
                    const contactWords = ["whatsapp","whatsap","wp","telegram","instagram","insta","facebook","twitter","tiktok","snapchat","discord","skype","zoom","facetime","signal","viber","messenger","mesenger","linkedin","youtube","gmail","hotmail","outlook","yahoo","mail","e-posta","eposta","telefon","numara","numaramı","numaranı","numaranız","telefonum","arayin","arayın","mesajat","mesajyaz","dm","özeldenya","iletisim","iletişim","banaulaş","banaulas","platformdışı","platformdisi","dışarıda","dışarida","direktiletişim","direkiletişim","kendiaramızda","telno","telnoya","telnoyaz","telnum","cepno","ceptel","gsm","noyaz","nover","noyazar","noyazarmisin","noverirmisin","numaraver","numarayaz","noistiyorum","yazno","verno","telefonno","telefonnumara","instayaz","wpyaz","wpden","wpnumarası","wpnum","wpdenyaz","whatsaptan","whatsapptan","instadan","telegramdan","discorddan","aramızda","özelden","birebir","dışarı","dısarı","harici","haricinde","kanaldan","başkakanal","başkayerden","basyerden"];
                    const hasBadWord = badWords.some(w => lower.includes(w));
                    const hasContact = contactWords.some(w => lower.includes(w));
                    const hasPhone = /05\d{8,}|5\d{9}|\+90/.test(val.replace(/\s/g, ''));
                    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(val);
                    const shortContactPatterns = /\btel\b|\bno\s*yaz|\bno\s*ver|\bno\s*ist|\bnumaran|\bnumaram|\btel\s*no|\bcep\s*no|\bgsm\s*no|\bnon[ıiu]\s*yaz|\bnon[ıiu]\s*ver|\barayal[ıi]m|\barayay[ıi]m|\bbeni\s*ara|\bseni\s*ara/i.test(val);
                    if (hasBadWord) { setNoteError("Uygunsuz ifade tespit edildi. Lütfen düzeltin."); }
                    else if (hasContact || hasPhone || hasEmail || shortContactPatterns) { setNoteError("Güvenliğiniz için kişisel iletişim bilgisi paylaşımına izin verilmemektedir."); }
                    else { setNoteError(""); }
                    setLessonNote(val);
                  }}
                />
                {noteError && <p className="text-red-500 text-xs mt-1">{noteError}</p>}
                <p className="text-xs text-slate-400 mt-1 text-right">{lessonNote.length}/500</p>
              </div>

              <div className="border-t pt-4 mb-4"><div className="flex justify-between items-center"><span className="text-slate-600">Ders Ücreti</span><span className="text-2xl font-bold">{formatPrice(displayPrice)}</span></div></div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4"><div className="flex items-start gap-2"><span>🛡️</span><div className="text-sm"><p className="font-medium text-green-800">EduPremium Güvencesi</p><p className="text-green-700">Ödemeniz güvence altındadır.</p></div></div></div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4"><div className="flex items-start gap-2"><span className="text-red-500">🔴</span><p className="text-xs text-amber-800">Bu ders, tarafların ve platformun hukuki haklarını korumak amacıyla ses ve görüntü olarak kaydedilecektir.</p></div></div>

              {currentUser ? (
                <button onClick={handlePurchase} disabled={!selectedSlot || purchasing || availabilities.length === 0 || !lessonNote.trim() || !!noteError} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {purchasing ? 'İşleniyor...' : 'Ödemeye Geç'}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/student/login')}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
                >
                  Satın Almak İçin Giriş Yap
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
