'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    hourlyRate: '',
    iban: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getTeacherDashboard();
      setProfile(data);
      setFormData({
        bio: data.teacher?.bio || '',
        hourlyRate: data.teacher?.hourlyRate || '',
        iban: data.teacher?.iban || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Profil yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.updateTeacherProfile({
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate),
        iban: formData.iban,
      });
      toast.success('Profil güncellendi!');
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Profil güncellenemedi');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Profil Ayarları</h1>
          <p className="text-slate-600">Profilinizi düzenleyin ve öğrencilere kendinizi tanıtın</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-2">
              Hakkımda
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="Kendinizi tanıtın, deneyimlerinizden bahsedin..."
            />
            <p className="text-sm text-slate-500 mt-2">
              Bu metin öğrencilerin sizin profilinizde göreceği açıklama olacaktır.
            </p>
          </div>

          {/* Hourly Rate */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-2">
              Saatlik Ücret (₺)
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="500"
              min="0"
              step="0.01"
            />
            <p className="text-sm text-slate-500 mt-2">
              Öğrencilerin size ödeyeceği saatlik ders ücreti.
            </p>
          </div>

          {/* IBAN */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-2">
              IBAN
            </label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              maxLength={26}
            />
            <p className="text-sm text-slate-500 mt-2">
              Kazançlarınızın aktarılacağı banka hesap numarası.
            </p>
          </div>

          {/* Profile Photo & Intro Video */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <label className="block font-medium text-navy-900 mb-4">
                Profil Fotoğrafı
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center text-2xl font-display font-semibold text-navy-600">
                  {profile?.teacher?.firstName?.charAt(0)}
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
                >
                  Fotoğraf Yükle
                </button>
              </div>
            </div>

            <div className="card p-6">
              <label className="block font-medium text-navy-900 mb-4">
                Tanıtım Videosu
              </label>
              <button
                type="button"
                className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-navy-500 hover:text-navy-600 transition-colors"
              >
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Video Yükle
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={fetchProfile}
              className="px-6 py-3 text-slate-600 hover:text-navy-900 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-navy-600 text-white rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
