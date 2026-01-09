'use client';
import { useState } from 'react';

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    hourlyRate: '',
    iban: '',
    isNative: false,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl text-navy-900 mb-8">Profilim</h1>
          <form className="space-y-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-xl text-navy-900 mb-6">Profil Fotografi</h2>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                  {photoPreview ? <img src={photoPreview} alt="Profil" className="w-full h-full object-cover" /> : <span className="text-4xl text-slate-400">+</span>}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                  <label htmlFor="photo-upload" className="cursor-pointer inline-block bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800">Fotograf Yukle</label>
                  <p className="text-sm text-slate-500 mt-2">JPG veya PNG, max 5MB</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-xl text-navy-900 mb-6">Kisisel Bilgiler</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ad</label>
                  <input type="text" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Soyad</label>
                  <input type="text" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none" />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Hakkimda</label>
                <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none resize-none" placeholder="Kendinizi tanitin..." />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-xl text-navy-900 mb-6">Ders ve Odeme Bilgileri</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Saatlik Ucret (TL)</label>
                  <input type="number" value={profile.hourlyRate} onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none" min="500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">IBAN</label>
                  <input type="text" value={profile.iban} onChange={(e) => setProfile({...profile, iban: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none" placeholder="TR00 0000 0000 0000 0000 0000 00" />
                </div>
              </div>
              <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={profile.isNative} onChange={(e) => setProfile({...profile, isNative: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-navy-600" />
                  <span className="text-slate-700">Native konusmaciyim (Yabanci dil ogretmenleri icin)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-navy-900 text-white px-8 py-3 rounded-xl hover:bg-navy-800 font-medium">Kaydet</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
