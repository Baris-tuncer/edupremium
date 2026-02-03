'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function StudentLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error(authError.message);

      // Öğrenci mi kontrol et
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', data.user?.id)
        .single();

      if (!studentProfile) {
        await supabase.auth.signOut();
        throw new Error('Bu hesap bir ogrenci hesabi degil.');
      }

      router.refresh();
      router.push('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Giris yapilamadi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw new Error(error.message);
      
      setSuccess('Sifre sifirlama linki e-posta adresinize gonderildi. Lutfen e-postanizi kontrol edin.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err: any) {
      setError(err.message || 'Sifre sifirlama basarisiz.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">Ogrenci Girisi</h2>
        <p className="text-center text-gray-500 mb-8">EduPremium hesabiniza giris yapin</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}

        {!showForgotPassword ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sifre</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="********"
                />
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Sifremi Unuttum?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Giris Yapiliyor...' : 'Giris Yap'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Hesabiniz yok mu?{' '}
                <Link href="/student/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Kayit Olun
                </Link>
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
              <p className="text-gray-500 text-sm">
                Ogretmen misiniz?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Ogretmen Girisi
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sifre Sifirlama</h3>
              <p className="text-sm text-gray-600">
                E-posta adresinizi girin, size sifre sifirlama linki gonderelim.
              </p>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input 
                  type="email" 
                  required 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                  placeholder="ornek@email.com" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isResetting} 
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isResetting ? 'Gonderiliyor...' : 'Sifirlama Linki Gonder'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Girişe Geri Dön
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
