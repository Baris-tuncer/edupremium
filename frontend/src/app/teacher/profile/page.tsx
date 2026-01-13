'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const TeacherSidebar = ({ activeItem, user }: { activeItem: string; user: any }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'lessons', label: 'Derslerim', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'availability', label: 'Müsaitlik', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'students', label: 'Öğrencilerim', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'feedback', label: 'Değerlendirmeler', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'earnings', label: 'Kazançlarım', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'profile', label: 'Profilim', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'settings', label: 'Ayarlar', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];
  const getInitials = () => { if (!user) return '??'; return ((user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')).toUpperCase() || '??'; };
  const getFullName = () => { if (!user) return 'Yükleniyor...'; return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Kullanıcı'; };
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col z-40">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><span className="text-xl">📚</span></div>
          <div><span className="font-bold text-xl text-white">EduPremium</span><span className="block text-xs text-slate-400">Öğretmen Paneli</span></div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.id} href={`/teacher/${item.id === 'dashboard' ? '' : item.id}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeItem === item.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold text-slate-900">{getInitials()}</div>
          <div><div className="font-medium text-white">{getFullName()}</div><div className="text-sm text-slate-400">Öğretmen</div></div>
        </div>
      </div>
    </aside>
  );
};

export default function TeacherProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [profile, setProfile] = useState({ bio: '', hourlyRate: '', iban: '', isNative: false, branchId: '', subjectIds: [] as string[] });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = '/login'; return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, dashResult, branchResult] = await Promise.all([
        api.getCurrentUser(),
        api.getTeacherDashboard(),
        api.listBranches()
      ]);
      setUser(userData);
      const dash = dashResult?.data || dashResult;
      const t = dash?.teacher || {};
      setTeacher(t);
      setPhotoUrl(t.profilePhotoUrl);
      setVideoUrl(t.introVideoUrl);
      setProfile({ bio: t.bio || '', hourlyRate: t.hourlyRate?.toString() || '', iban: t.iban || '', isNative: t.isNative || false, branchId: t.branchId || '', subjectIds: t.subjectIds || [] });
      const br = branchResult?.data || branchResult || [];
      setBranches(br);
      if (t.branchId) { const subjResult = await api.listSubjects(t.branchId); setSubjects(subjResult?.data || subjResult || []); }
    } catch (error: any) {
      console.error('Fetch error:', error);
      if (error?.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
    } finally { setIsLoading(false); }
  };

  const handleBranchChange = async (branchId: string) => {
    setProfile({ ...profile, branchId, subjectIds: [] });
    if (branchId) { const res = await api.listSubjects(branchId); setSubjects(res?.data || res || []); }
    else { setSubjects([]); }
  };

  const handleSubjectToggle = (subjectId: string) => {
    const current = profile.subjectIds;
    if (current.includes(subjectId)) { setProfile({ ...profile, subjectIds: current.filter(id => id !== subjectId) }); }
    else { setProfile({ ...profile, subjectIds: [...current, subjectId] }); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadProfilePhoto(file);
      setPhotoUrl(res.url);
      setMessage({ type: 'success', text: 'Fotoğraf yüklendi!' });
    } catch { setMessage({ type: 'error', text: 'Fotoğraf yüklenemedi' }); }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadIntroVideo(file);
      setVideoUrl(res.url);
      setMessage({ type: 'success', text: 'Video yüklendi!' });
    } catch { setMessage({ type: 'error', text: 'Video yüklenemedi' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await api.updateTeacherProfile({ bio: profile.bio, hourlyRate: parseFloat(profile.hourlyRate) || undefined, iban: profile.iban || undefined, isNative: profile.isNative, branchId: profile.branchId || undefined, subjectIds: profile.subjectIds });
      setMessage({ type: 'success', text: 'Profil güncellendi!' });
    } catch (error: any) { setMessage({ type: 'error', text: error.message || 'Hata oluştu' }); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherSidebar activeItem="profile" user={user} />
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Profilim</h1>
          {message && <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fotoğraf ve Video */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-xl text-slate-900 mb-6">Profil Görselleri</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Profil Fotoğrafı</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center">
                      {photoUrl ? <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" /> : <span className="text-3xl text-slate-400">📷</span>}
                    </div>
                    <div>
                      <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      <button type="button" onClick={() => photoRef.current?.click()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Fotoğraf Yükle</button>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG max 5MB</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tanıtım Videosu</label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-24 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                      {videoUrl ? <video src={videoUrl} className="w-full h-full object-cover" /> : <span className="text-3xl text-slate-400">🎥</span>}
                    </div>
                    <div>
                      <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                      <button type="button" onClick={() => videoRef.current?.click()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Video Yükle</button>
                      <p className="text-xs text-slate-500 mt-1">MP4 max 50MB, 2dk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kişisel Bilgiler */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-xl text-slate-900 mb-6">Kişisel Bilgiler</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ad</label>
                  <input type="text" value={user?.firstName || ''} disabled className="w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Soyad</label>
                  <input type="text" value={user?.lastName || ''} disabled className="w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hakkımda</label>
                <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} rows={4} className="w-full px-4 py-3 rounded-xl border focus:border-blue-500 outline-none" placeholder="Kendinizi tanıtın..." />
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={profile.isNative} onChange={(e) => setProfile({...profile, isNative: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-700">Anadili Türkçe (Native Speaker)</span>
                </label>
              </div>
            </div>

            {/* Branş ve Dersler */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-xl text-slate-900 mb-6">Branş ve Dersler</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Branş</label>
                <select value={profile.branchId} onChange={(e) => handleBranchChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:border-blue-500 outline-none">
                  <option value="">Branş Seçin</option>
                  {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              {subjects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Verdiğiniz Dersler</label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s: any) => (
                      <button key={s.id} type="button" onClick={() => handleSubjectToggle(s.id)} className={`px-4 py-2 rounded-full text-sm transition-colors ${profile.subjectIds.includes(s.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ödeme Bilgileri */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-xl text-slate-900 mb-6">Ders ve Ödeme Bilgileri</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Saatlik Ücret (₺)</label>
                  <input type="number" value={profile.hourlyRate} onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:border-blue-500 outline-none" min="100" placeholder="450" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">IBAN</label>
                  <input type="text" value={profile.iban} onChange={(e) => setProfile({...profile, iban: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:border-blue-500 outline-none" placeholder="TR00 0000 0000 0000 0000 0000 00" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 font-medium disabled:opacity-50">
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
