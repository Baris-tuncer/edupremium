'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherSettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    appointments: true,
    payments: true,
  });

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#0F172A] mb-2">Ayarlar</h1>
          <p className="text-slate-600">Hesap ve bildirim ayarlarınızı yönetin</p>
        </div>

        {/* Notifications */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 mb-6 shadow-2xl shadow-[#0F172A]/5">
          <h2 className="font-serif text-xl font-semibold text-[#0F172A] mb-4">Bildirimler</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#0F172A]">Email Bildirimleri</p>
                <p className="text-sm text-slate-600">Önemli güncellemeler için email alın</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D4AF37]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 backdrop-blur-xl after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F172A]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#0F172A]">SMS Bildirimleri</p>
                <p className="text-sm text-slate-600">Randevu hatırlatmaları için SMS alın</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D4AF37]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 backdrop-blur-xl after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F172A]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 mb-6 shadow-2xl shadow-[#0F172A]/5">
          <h2 className="font-serif text-xl font-semibold text-[#0F172A] mb-4">Hesap</h2>
          <button className="text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium">
            Şifre Değiştir
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white/80 backdrop-blur-xl border border-red-200/50 rounded-3xl p-6 shadow-2xl shadow-[#0F172A]/5">
          <h2 className="font-serif text-xl font-semibold text-red-600 mb-4">Tehlikeli Bölge</h2>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}
