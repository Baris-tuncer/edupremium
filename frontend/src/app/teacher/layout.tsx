'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import TeacherSidebar from './components/Sidebar';
import TeacherHeader from './components/Header';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const userData = await api.getMe();
        if (userData.role !== 'TEACHER') {
          router.push('/');
          return;
        }
        setUser(userData);
      } catch (error: any) {
        console.error('Auth check failed:', error);
        if (error?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const activeItem = pathname.split('/')[2] || 'dashboard';

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherSidebar activeItem={activeItem} user={user} />
      <TeacherHeader user={user} />
      <main className="ml-64 pt-16">
        {children}
      </main>
    </div>
  );
}
