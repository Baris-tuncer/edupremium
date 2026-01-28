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
      // Login sayfasinda kontrol yapma
      if (pathname === '/admin/login') {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Admin kontrolu
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

  // Login sayfasi icin layout yok
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const activeItem = pathname.split('/')[2] || 'dashboard';

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar activeItem={activeItem} />
      <AdminHeader user={user} />
      <main className="ml-64 pt-16">
        {children}
      </main>
    </div>
  );
}
