'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Camera, Video, Save, CreditCard, BookOpen, GraduationCap } from 'lucide-react';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    bio: '',
    hourly_rate: 0,
    iban: '',
    phone: '',
    video_url: '',
    levels: [] as string[],
    branches: [] as string[],
  });

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            title: data.title || '',
            bio: data.bio || '',
            hourly_rate: data.hourly_rate || 0,
            iban: data.iban || '',
            phone: data.phone || '',
            video_url: data.video_url || '',
            levels: data.levels || [],
            branches: data.branches || [],
          });
        }
      }
    }
    getProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!user) {
        alert("⚠️ Giriş yapmış kullanıcı bulunamadı.");
        return;
    }
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      });
    setIsLoading(false);
    if (error) {
      alert('❌ Hata: ' + error.message);
    } else {
      alert('✅ Kayıt Başarılı!');
    }
  };

  const toggleSelection = (list: string[], item: string, key: 'levels' | 'branches') => {
    const newList = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    setFormData({ ...formData, [key]: newList });
  };

  const LEVELS = ['İlkokul', 'Ortaokul', 'LGS', 'Lise Ara Sınıf', 'TYT', 'AYT', 'YDT', 'Üniversite'];
  const BRANCHES = ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'İngilizce', 'Tarih', 'Coğrafya'];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Profil Ayarları</h1>
        <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl">
          <Save className="w-5 h-5" /> {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border text-center">
            <div className="w-32 h-32 mx-auto bg-slate-100 rounded-full flex items-center justify-center border-4 border-indigo-50">
                <Camera className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold">Profil Fotoğrafı</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-semibold mb-2">Tanıtım Videosu</h3>
            <input type="text" placeholder="Video Linki" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} className="w-full p-3 rounded-xl border" />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border space-y-5">
            <input type="text" placeholder="Ders Başlığı" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border" />
            <textarea rows={4} placeholder="Hakkında" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-3 rounded-xl border"></textarea>
            <div className="grid grid-cols-2 gap-5">
                <input type="text" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-xl border" />
                <input type="number" placeholder="Saatlik Ücret" value={formData.hourly_rate} onChange={(e) => setFormData({...formData, hourly_rate: parseInt(e.target.value)})} className="w-full p-3 rounded-xl border" />
            </div>
            <input type="text" placeholder="IBAN" value={formData.iban} onChange={(e) => setFormData({...formData, iban: e.target.value})} className="w-full p-3 rounded-xl border font-mono" />
          </div>

          <div className="bg-white p-6 rounded-2xl border space-y-4">
             <div className="flex flex-wrap gap-2">
                {BRANCHES.map((item) => (
                    <button key={item} onClick={() => toggleSelection(formData.branches, item, 'branches')} className={`px-4 py-2 rounded-full text-sm ${formData.branches.includes(item) ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{item}</button>
                ))}
             </div>
             <div className="flex flex-wrap gap-2">
                {LEVELS.map((item) => (
                    <button key={item} onClick={() => toggleSelection(formData.levels, item, 'levels')} className={`px-4 py-2 rounded-full text-sm ${formData.levels.includes(item) ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>{item}</button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
