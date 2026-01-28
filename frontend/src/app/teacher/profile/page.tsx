'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  EDUCATION_LEVELS, 
  formatSubject 
} from '@/lib/constants';
import {
  calculatePriceDetails,
  calculateDisplayPrice,
  calculateTeacherNet,
  validateBasePrice,
  formatPrice,
  PRICING_CONSTANTS,
  getCommissionTier,
  getLessonsUntilNextTier
} from '@/lib/pricing';

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [diplomaUrl, setDiplomaUrl] = useState('');
  const [completedLessons, setCompletedLessons] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0.25);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile load error:', error);
        return;
      }

      if (data) {
        setFullName(data.full_name || '');
        setTitle(data.title || '');
        setBio(data.bio || '');
        setPhone(data.phone || '');
        setBasePrice(data.base_price || data.price_per_hour || 0);
        setSelectedSubjects(data.subjects || []);
        setAvatarUrl(data.avatar_url || '');
        setVideoUrl(data.video_url || '');
        setDiplomaUrl(data.diploma_url || '');
        setCompletedLessons(data.completed_lessons_count || 0);
        setCommissionRate(data.commission_rate || 0.25);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fiyat hesaplaması (canlı)
  const priceDetails = useMemo(() => {
    return calculatePriceDetails(basePrice, commissionRate);
  }, [basePrice, commissionRate]);

  // Validasyon
  const priceValidation = useMemo(() => {
    return validateBasePrice(basePrice);
  }, [basePrice]);

  // Komisyon bilgileri
  const commissionTier = getCommissionTier(completedLessons);
  const nextTierInfo = getLessonsUntilNextTier(completedLessons);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast.error('Yukleme hatasi: ' + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(urlData.publicUrl + '?t=' + Date.now());
      toast.success('Fotograf yuklendi');
    } catch (error) {
      toast.error('Yukleme sirasinda hata olustu');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video 100MB\'dan kucuk olmali');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/video.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast.error('Video yukleme hatasi: ' + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setVideoUrl(urlData.publicUrl + '?t=' + Date.now());
      toast.success('Video yuklendi');
    } catch (error) {
      toast.error('Video yukleme sirasinda hata olustu');
    } finally {
      setUploading(false);
    }
  };

  const handleDiplomaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Diploma 10MB dan kucuk olmali');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/diploma.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast.error('Diploma yukleme hatasi: ' + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setDiplomaUrl(urlData.publicUrl + '?t=' + Date.now());
      toast.success('Diploma yuklendi');
    } catch (error) {
      toast.error('Diploma yukleme sirasinda hata olustu');
    } finally {
      setUploading(false);
    }
  };

  const toggleSubject = (level: string, subject: string) => {
    const key = formatSubject(level, subject);
    setSelectedSubjects(prev => 
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const isSubjectSelected = (level: string, subject: string) => {
    return selectedSubjects.includes(formatSubject(level, subject));
  };

  const handleSave = async () => {
    if (!priceValidation.valid) {
      toast.error(priceValidation.error || 'Gecersiz fiyat');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const teacherNet = calculateTeacherNet(basePrice, commissionRate);
      const displayPrice = calculateDisplayPrice(basePrice, commissionRate);

      const { error } = await supabase
        .from('teacher_profiles')
        .update({
          full_name: fullName,
          title,
          bio,
          phone,
          base_price: basePrice,
          hourly_rate_net: teacherNet,
          hourly_rate_display: displayPrice,
          price_per_hour: basePrice, // backward compatibility
          subjects: selectedSubjects,
          avatar_url: avatarUrl,
          video_url: videoUrl,
          diploma_url: diplomaUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Kayit hatasi: ' + error.message);
        return;
      }

      toast.success('Profil kaydedildi');
    } catch (error) {
      toast.error('Kayit sirasinda hata olustu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Profil Ayarlari</h1>

      <div className="space-y-8">
        {/* Komisyon Durumu Kartı */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Komisyon Seviyeniz</p>
              <p className="text-2xl font-bold">{commissionTier.label} (%{commissionTier.percentage})</p>
              <p className="text-blue-100 mt-1">Tamamlanan Ders: {completedLessons}</p>
            </div>
            {nextTierInfo ? (
              <div className="text-right">
                <p className="text-blue-100 text-sm">Sonraki Seviye</p>
                <p className="text-xl font-semibold">{nextTierInfo.nextTier} (%{nextTierInfo.nextRate})</p>
                <p className="text-blue-100">{nextTierInfo.lessonsNeeded} ders kaldi</p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-2xl">🏆</p>
                <p className="text-blue-100">En yuksek seviye!</p>
              </div>
            )}
          </div>
        </div>

        {/* Profil Fotoğrafı ve Video */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Profil Medyasi</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Profil Fotografi</label>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-slate-400">{fullName?.charAt(0) || '?'}</span>
                  </div>
                )}
                <label className="cursor-pointer px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                  {uploading ? 'Yukleniyor...' : 'Fotograf Sec'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tanitim Videosu</label>
              {videoUrl ? (
                <div className="space-y-2">
                  <video src={videoUrl} controls className="w-full h-48 aspect-video object-contain rounded-lg" />
                  <label className="cursor-pointer inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                    {uploading ? 'Yukleniyor...' : 'Degistir'}
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block p-8 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-blue-400">
                  <span className="text-slate-500">{uploading ? 'Yukleniyor...' : 'Video Yukle (Max 100MB)'}</span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Diploma */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Diploma / Sertifika</h2>
          <p className="text-sm text-slate-500 mb-4">Ogrencilerin guvenini kazanmak icin diplomanizi yukleyin.</p>
          {diplomaUrl ? (
            <div className="space-y-3">
              <img src={diplomaUrl} alt="Diploma" className="max-w-md rounded-lg border" />
              <label className="cursor-pointer inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                {uploading ? 'Yukleniyor...' : 'Degistir'}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDiplomaUpload} disabled={uploading} />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer block p-8 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-blue-400">
              <span className="text-slate-500">{uploading ? 'Yukleniyor...' : 'Diploma Yukle (Max 10MB)'}</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDiplomaUpload} disabled={uploading} />
            </label>
          )}
        </div>

        {/* Kişisel Bilgiler */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Kisisel Bilgiler</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unvan</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ornegin: Matematik Ogretmeni"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Hakkimda</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Kendinizi tanitin..."
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Fiyatlandırma */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Fiyatlandirma</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Baz Fiyat Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ders Bedeli (Baz Fiyat)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={basePrice || ''}
                  onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)}
                  min={PRICING_CONSTANTS.MIN_BASE_PRICE}
                  placeholder={`Minimum ${PRICING_CONSTANTS.MIN_BASE_PRICE}`}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold ${
                    !priceValidation.valid && basePrice > 0 ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">TL</span>
              </div>
              {!priceValidation.valid && basePrice > 0 && (
                <p className="mt-1 text-sm text-red-600">{priceValidation.error}</p>
              )}
            </div>

            {/* Fiyat Dökümü Kartı */}
            {basePrice >= PRICING_CONSTANTS.MIN_BASE_PRICE && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                {/* Kesinti */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-2">
                    <span className="text-red-500">📉</span> Kesinti (Komisyon %{commissionTier.percentage})
                  </span>
                  <span className="font-medium text-red-600">-{formatPrice(priceDetails.commissionAmount)}</span>
                </div>

                {/* Öğretmene Kalan */}
                <div className="flex justify-between items-center py-2 border-t border-b border-slate-200">
                  <span className="text-slate-800 font-medium flex items-center gap-2">
                    <span className="text-green-500">✅</span> Elinize Gececek Net
                  </span>
                  <span className="font-bold text-lg text-green-600">{formatPrice(priceDetails.teacherNet)}</span>
                </div>

                {/* Vergiler */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <span>🏛️</span> Vergiler (Veli Öder)
                  </span>
                  <span className="text-slate-500">+{formatPrice(priceDetails.taxTotal)}</span>
                </div>

                {/* Veli Fiyatı */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-300">
                  <span className="text-slate-800 font-medium flex items-center gap-2">
                    <span>🏷️</span> Veliye Gorunecek Fiyat
                  </span>
                  <span className="font-bold text-xl text-blue-600">{formatPrice(priceDetails.displayPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bilgilendirme */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="text-sm text-amber-800">
                <p className="font-medium">Nasil Calisir?</p>
                <p className="mt-1">
                  Belirlediginiz ders bedelinden <strong>%{commissionTier.percentage} komisyon</strong> kesilir, 
                  kalan tutar size odenir. Vergiler veliye yansitilir.
                </p>
                <p className="mt-2 text-amber-700">
                  Daha fazla ders verdikce komisyon oraniniz duser: 
                  <strong> 101+ ders: %20</strong>, 
                  <strong> 201+ ders: %15</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ders Seçimi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Verdigim Dersler</h2>
          <p className="text-slate-600 text-sm mb-6">
            Vermek istediginiz dersleri seciniz.
          </p>

          <div className="space-y-6">
            {Object.entries(EDUCATION_LEVELS).map(([levelKey, levelData]) => (
              <div key={levelKey}>
                <h3 className="font-medium text-slate-800 mb-3">{levelData.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {levelData.subjects.map((subject) => {
                    const selected = isSubjectSelected(levelKey, subject);
                    return (
                      <button
                        key={subject}
                        onClick={() => toggleSubject(levelKey, subject)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedSubjects.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>{selectedSubjects.length}</strong> ders secildi
              </p>
            </div>
          )}
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !priceValidation.valid}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
