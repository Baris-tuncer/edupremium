'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

// ============================================
// TEACHER SIDEBAR (Same as dashboard)
// ============================================
const TeacherSidebar = ({ activeItem, user }: { activeItem: string; user: any }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'appointments', label: 'Derslerim', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'availability', label: 'Müsaitlik', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'students', label: 'Öğrencilerim', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'feedback', label: 'Değerlendirmeler', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'earnings', label: 'Kazançlarım', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'profile', label: 'Profilim', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'settings', label: 'Ayarlar', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const getInitials = () => {
    if (!user) return '??';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '??';
  };

  const getFullName = () => {
    if (!user) return 'Yükleniyor...';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Kullanıcı';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-navy flex flex-col z-40">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="font-display text-xl font-semibold text-white">EduPremium</span>
            <span className="block text-2xs text-navy-300 uppercase tracking-widest">Öğretmen Paneli</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={`/teacher/${item.id}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeItem === item.id
                ? 'bg-white/10 text-white'
                : 'text-navy-200 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            <span className="font-medium">{item.label}</span>
            {activeItem === item.id && (
              <span className="ml-auto w-1.5 h-1.5 bg-gold-400 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center font-display font-semibold text-navy-900">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">{getFullName()}</div>
            <div className="text-sm text-navy-300">Öğretmen</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ============================================
// MAIN PAGE
// ============================================
export default function TeacherProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    hourlyRate: '',
    iban: '',
    isNative: false,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, dashboardData] = await Promise.all([
          api.getCurrentUser(),
          api.getTeacherDashboard(),
        ]);
        
        setUser(userData);
        
        const teacherProfile = dashboardData?.profile || {};
        setProfile({
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          bio: teacherProfile?.bio || '',
          hourlyRate: teacherProfile?.hourlyRate?.toString() || '',
          iban: teacherProfile?.iban || '',
          isNative: teacherProfile?.isNative || false,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await api.updateTeacherProfile({
        bio: profile.bio,
        hourlyRate: parseFloat(profile.hourlyRate) || undefined,
        iban: profile.iban || undefined,
        isNative: profile.isNative,
      });
      
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Bir hata oluştu' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherSidebar activeItem="profile" user={user} />
      
      <div className="ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl text-navy-900 mb-8">Profilim</h1>
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-xl text-navy-900 mb-6">Profil Fotoğrafı</h2>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gold-500 flex items-center justify-center text-4xl font-bold text-navy-900">
                      {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                  <label htmlFor="photo-upload" className="cursor-pointer inline-block bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800">
                    Fotoğraf Yükle
                  </label>
                  <p className="text-sm text-slate-500 mt-2">JPG veya PNG, max 5MB</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-xl text-navy-900 mb-6">Kişisel Bilgiler</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ad</label>
                  <input 
                    type="text" 
                    value={profile.firstName} 
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" 
                  />
                  <p className="text-xs text-slate-400 mt-1">Ad değişikliği için destek ile iletişime geçin</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Soyad</label>
                  <input 
                    type="text" 
                    value={profile.lastName}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" 
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Hakkımda</label>
                <textarea 
                  value={profile.bio} 
                  onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                  rows={4} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none resize-none" 
                  placeholder="Kendinizi tanıtın... (Tecrübeleriniz, eğitim yaklaşımınız vb.)" 
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-xl text-navy-900 mb-6">Ders ve Ödeme Bilgileri</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Saatlik Ücret (₺)</label>
                  <input 
                    type="number" 
                    value={profile.hourlyRate} 
                    onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none" 
                    min="100" 
                    placeholder="450"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">IBAN</label>
                  <input 
                    type="text" 
                    value={profile.iban} 
                    onChange={(e) => setProfile({...profile, iban: e.target.value})} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none" 
                    placeholder="TR00 0000 0000 0000 0000 0000 00" 
                  />
                  <p className="text-xs text-slate-400 mt-1">Kazançlarınız bu hesaba aktarılacaktır</p>
                </div>
              </div>
              <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={profile.isNative} 
                    onChange={(e) => setProfile({...profile, isNative: e.target.checked})} 
                    className="w-5 h-5 rounded border-slate-300 text-navy-600" 
                  />
                  <span className="text-slate-700">Native konuşmacıyım (Yabancı dil öğretmenleri için)</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-navy-900 text-white px-8 py-3 rounded-xl hover:bg-navy-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Kaydediliyor...
                  </>
                ) : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
