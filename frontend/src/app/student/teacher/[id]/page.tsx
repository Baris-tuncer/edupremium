'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { calculateDisplayPrice, formatPrice } from '@/lib/price-calculator';
import PackagePurchaseModal from '@/components/PackagePurchaseModal';

interface Teacher {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  video_url: string;
  base_price: number;
  hourly_rate_net: number;
  commission_rate: number;
  subjects: string[];
  is_verified: boolean;
  diploma_url: string;
  is_featured?: boolean;
}

interface Availability {
  id: number;
  start_time: string;
  end_time: string;
}

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
  const [priceChanged, setPriceChanged] = useState(false);
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // ========================================
  // MERKEZI GÜVENLİK KAPISI - ÖDEME İŞLEMİ
  // Tüm ödeme işlemleri bu fonksiyondan geçmeli
  // ========================================
  const handleSecurePurchase = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
      router.push(`/login?redirect=/student/teacher/${params.id}`);
      return;
    }
    // Session geçerli, ödeme işlemine devam et
    handlePurchase();
  };

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

      // Aktif kampanyaları al (Premium Vitrin öğretmeni ise)
      if (teacherData?.is_featured) {
        const now = new Date().toISOString();
        const { data: campaignsData } = await supabase
          .from('campaigns')
          .select('*')
          .eq('teacher_id', teacherId)
          .eq('is_active', true)
          .gt('ends_at', now)
          .order('created_at', { ascending: false });

        setCampaigns(campaignsData || []);
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

      // ========================================
      // CANLI FİYAT KONTROLÜ
      // Ödeme öncesi güncel fiyatı NET'ten hesapla
      // ========================================
      const { data: currentTeacherData, error: priceCheckError } = await supabase
        .from('teacher_profiles')
        .select('hourly_rate_net, base_price, commission_rate')
        .eq('id', teacherId)
        .single();

      if (priceCheckError) {
        toast.error('Fiyat kontrolü yapılamadı. Lütfen tekrar deneyin.');
        setPurchasing(false);
        return;
      }

      // Her zaman NET'ten hesapla
      const netPrice = currentTeacherData.hourly_rate_net || currentTeacherData.base_price || 0;
      const currentPrice = calculateDisplayPrice(netPrice, currentTeacherData.commission_rate || 0.25);

      // Mevcut görüntülenen fiyat
      const displayPrice = calculateDisplayPrice(teacher?.hourly_rate_net || teacher?.base_price || 0, teacher?.commission_rate || 0.25);

      // Fiyat değişti mi? (50 TL tolerans)
      if (Math.abs(displayPrice - currentPrice) > 50) {
        setNewPrice(currentPrice);
        setPriceChanged(true);
        setPurchasing(false);
        // Öğretmen bilgisini güncelle
        setTeacher(prev => prev ? { ...prev, hourly_rate_net: netPrice } : null);
        return;
      }

      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: currentPrice, // Güncel fiyatı kullan
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

  if (loading) return <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>;
  if (!teacher) return <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-[#0F172A] mb-4">Öğretmen Bulunamadı</h1><Link href="/student/dashboard" className="text-[#D4AF37]">Geri Dön</Link></div></div>;

  // Her zaman NET'ten hesapla (yeni fiyatlandırma sistemi)
  const displayPrice = calculateDisplayPrice(teacher.hourly_rate_net || teacher.base_price || 0, teacher.commission_rate || 0.25);

  return (
    <div className="min-h-screen relative bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">
      {/* --- ARKA PLAN --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')` }}></div>
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
      </div>
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/50"><div className="max-w-6xl mx-auto px-4 py-4"><Link href="/student/dashboard" className="text-[#D4AF37] hover:underline flex items-center gap-2 font-bold">← Öğretmenlere Dön</Link></div></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-6">
              <div className="flex items-start gap-6">
                {teacher.avatar_url ? <img src={teacher.avatar_url} alt={teacher.full_name} className="w-24 h-24 rounded-full object-cover" /> : <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-3xl font-bold text-blue-600">{teacher.full_name?.charAt(0)}</span></div>}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{teacher.full_name}</h1>
                    {teacher.is_verified && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">✓ Onaylı</span>}
                  </div>
                  <p className="text-slate-600 mt-1">{teacher.title}</p>
                  <span className="text-2xl font-bold text-[#D4AF37] mt-3 block">{formatPrice(displayPrice)}<span className="text-sm font-normal text-slate-500">/ders</span><span className="text-xs font-normal text-slate-400 ml-1">(KDV Dahil)</span></span>
                </div>
              </div>
            </div>

            {teacher.video_url && <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-6"><h2 className="text-lg font-semibold mb-4">Tanıtım Videosu</h2><video src={teacher.video_url} controls className="w-full max-h-64 rounded-xl object-contain" /></div>}
            {teacher.bio && <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-6"><h2 className="text-lg font-semibold mb-4">Hakkında</h2><p className="text-slate-600 whitespace-pre-wrap">{teacher.bio}</p></div>}

            {/* Kampanyalar - Premium Vitrin */}
            {campaigns.length > 0 && (
              <div className="bg-gradient-to-br from-[#D4AF37]/10 via-amber-50 to-[#D4AF37]/5 border-2 border-[#D4AF37]/30 rounded-3xl shadow-2xl shadow-[#D4AF37]/10 p-6 relative overflow-hidden">
                {/* Dekoratif */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#0F172A]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 2L1 8l11 13L23 8l-5-6H6zm3.5 1h5l2.5 3h-10l2.5-3zM12 19L3.5 9h17L12 19z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0F172A]">Kampanyalı Paketler</h2>
                      <p className="text-xs text-[#D4AF37] font-medium">Premium Vitrin Avantajları</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {campaigns.map((campaign) => {
                      const totalLessons = campaign.lesson_count + campaign.bonus_lessons;
                      const daysLeft = Math.ceil((new Date(campaign.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                      return (
                        <div
                          key={campaign.id}
                          className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-[#0F172A] group-hover:text-[#D4AF37] transition-colors">
                                  {campaign.name}
                                </h3>
                                {campaign.type === 'package_discount' && campaign.discount_percent > 0 && (
                                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    %{campaign.discount_percent} İNDİRİM
                                  </span>
                                )}
                                {campaign.type === 'bonus_lesson' && campaign.bonus_lessons > 0 && (
                                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    +{campaign.bonus_lessons} HEDİYE
                                  </span>
                                )}
                              </div>

                              {campaign.description && (
                                <p className="text-sm text-slate-600 mb-3 line-clamp-1">{campaign.description}</p>
                              )}

                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                  <span className="text-slate-600">{totalLessons} Ders</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className={`${daysLeft <= 3 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                    {daysLeft} gün kaldı
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <p className="text-2xl font-bold text-[#D4AF37]">
                                {campaign.package_total_price.toLocaleString('tr-TR')} TL
                              </p>
                              <p className="text-[10px] text-slate-400">(KDV Dahil)</p>
                              <button className="mt-2 text-xs font-bold text-[#0F172A] bg-[#D4AF37] px-3 py-1 rounded-full group-hover:scale-105 transition-transform">
                                Satın Al
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {teacher.subjects?.length > 0 && <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-6"><h2 className="text-lg font-semibold mb-4">Verdiği Dersler</h2><div className="flex flex-wrap gap-2">{teacher.subjects.map((s, i) => <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{s}</span>)}</div></div>}
            {teacher.diploma_url && <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-6"><h2 className="text-lg font-semibold mb-4">📜 Diploma / Sertifika</h2><img src={teacher.diploma_url} alt="Diploma" className="max-w-full rounded-lg border" /><p className="text-sm text-green-600 mt-2">✓ Diploma doğrulandı</p></div>}
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-6 sticky top-4">
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

              <div className="border-t pt-4 mb-4"><div className="flex justify-between items-center"><span className="text-slate-600">Ders Ücreti</span><div className="text-right"><span className="text-2xl font-bold">{formatPrice(displayPrice)}</span><span className="block text-xs text-slate-400">(KDV Dahil)</span></div></div></div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4"><div className="flex items-start gap-2"><span>🛡️</span><div className="text-sm"><p className="font-medium text-green-800">EduPremium Güvencesi</p><p className="text-green-700">Ödemeniz güvence altındadır.</p></div></div></div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4"><div className="flex items-start gap-2"><span className="text-red-500">🔴</span><p className="text-xs text-amber-800">Bu ders, tarafların ve platformun hukuki haklarını korumak amacıyla ses ve görüntü olarak kaydedilecektir.</p></div></div>

              {/* Fiyat Değişikliği Bildirimi */}
              {priceChanged && newPrice && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div className="flex-1">
                      <p className="font-bold text-blue-800">Fiyat Güncellendi!</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Öğretmen ders ücretini güncelledi. Yeni fiyat:
                      </p>
                      <p className="text-2xl font-bold text-blue-900 mt-2">
                        {formatPrice(newPrice)}
                        <span className="text-sm font-normal text-blue-600 ml-1">(KDV Dahil)</span>
                      </p>
                      <button
                        onClick={() => {
                          setPriceChanged(false);
                          setNewPrice(null);
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Tamam, anladım
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentUser ? (
                <button
                  onClick={handleSecurePurchase}
                  disabled={!selectedSlot || purchasing || availabilities.length === 0 || !lessonNote.trim() || !!noteError}
                  className="w-full py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? 'İşleniyor...' : 'Ödemeye Geç'}
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/login?redirect=/student/teacher/${teacherId}`)}
                  className="w-full py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all"
                >
                  Satın Almak İçin Giriş Yap
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paket Satın Alma Modalı */}
      {selectedCampaign && (
        <PackagePurchaseModal
          campaign={selectedCampaign}
          teacherId={teacherId}
          teacherName={teacher.full_name}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}
