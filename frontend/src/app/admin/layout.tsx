'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminSidebar from './components/Sidebar';
import AdminHeader from './components/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // Login sayfasında kontrol yapma
      if (pathname === '/admin/login') {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Admin kontrolü
      const { data: profile } = await supabase
        .from('teacher_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/admin/login');
        return;
      }

      setUser(user);
      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  // Login sayfası için layout yok
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const activeItem = pathname.split('/')[2] || 'dashboard';

  return (
    <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl">
      <AdminSidebar activeItem={activeItem} />
      <AdminHeader user={user} />
      <main className="ml-64 pt-16">
        {children}
      </main>
    </div>
  );
}
