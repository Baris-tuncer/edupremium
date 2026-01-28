'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TeacherSidebar from './components/Sidebar';
import TeacherHeader from './components/Header';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Yukleniyor...</p>
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
