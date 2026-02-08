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
      // /teacher/register ve /teacher/login için auth kontrolü yapma
      if (pathname === '/teacher/register' || pathname === '/teacher/login') {
        setIsLoading(false);
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('teacher_profiles')
        .select('full_name, avatar_url, is_featured, featured_until')
        .eq('id', authUser.id)
        .single();

      const nameParts = (profile?.full_name || '').split(' ');
      
      const now = new Date().toISOString();
      const isPremium = profile?.is_featured && profile?.featured_until && profile.featured_until > now;

      setUser({
        ...authUser,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        fullName: profile?.full_name || '',
        avatarUrl: profile?.avatar_url || null,
        isPremium,
      });
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')` }}></div>
          <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Auth gerektirmeyen sayfalar için sadece children döndür
  if (pathname === '/teacher/register' || pathname === '/teacher/login') {
    return <>{children}</>;
  }

  const activeItem = pathname.split('/')[2] || 'dashboard';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Kütüphane Arka Plan */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')` }}></div>
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
      </div>
      <TeacherSidebar activeItem={activeItem} user={user} />
      <TeacherHeader user={user} />
      <main className="ml-64 pt-16 relative z-10">
        {children}
      </main>
    </div>
  );
}
