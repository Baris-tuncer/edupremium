'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email ve şifre gerekli');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Login attempt:', email);
      const response = await api.login(email, password);
      console.log('✅ Login response:', response);
      
      const data = response.data || response;
      console.log('📦 Parsed data:', data);
      
      if (!data.user) {
        throw new Error('Kullanıcı bilgisi alınamadı');
      }

      // Token'ları localStorage'e kaydet
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        console.log('✅ Token saved');
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Role'e göre yönlendir
      const role = data.user.role;
      console.log('👤 User role:', role);
      
      if (role === 'ADMIN') {
        console.log('🔀 Redirecting to admin dashboard');
        router.push('/admin/dashboard');
      } else if (role === 'TEACHER') {
        console.log('🔀 Redirecting to teacher dashboard');
        router.push('/teacher/dashboard');
      } else if (role === 'STUDENT') {
        console.log('🔀 Redirecting to student dashboard');
        router.push('/student/dashboard');
      } else {
        console.log('🔀 Redirecting to home');
        router.push('/');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || err.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Giriş Yap</h1>
          <p className="text-slate-600 mt-2">Hesabınıza giriş yapın</p>
        </div>

        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="input-label">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@edupremium.com"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="input-label">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 mt-6">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="font-semibold text-navy-600 hover:text-navy-800">
              Kayıt Olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
