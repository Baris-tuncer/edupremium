'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  user: any;
}

export default function TeacherHeader({ user }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const now = new Date();
      const twoDaysLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const { data } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', authUser.id)
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', twoDaysLater.toISOString())
        .neq('status', 'CANCELLED')
        .neq('status', 'COMPLETED')
        .order('scheduled_at', { ascending: true })
        .limit(5);

      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Bugün ${time}`;
    if (isTomorrow) return `Yarın ${time}`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ' ' + time;
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-serif font-semibold text-[#0F172A]">Öğretmen Paneli</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-slate-500 hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-[#0F172A]">Yaklaşan Dersler</h3>
              </div>
              {notifications.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((lesson) => (
                    <div key={lesson.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-sm font-semibold text-[#D4AF37]">
                          {lesson.subject?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-[#0F172A] text-sm">{lesson.subject || 'Ders'}</p>
                          <p className="text-xs text-slate-500">{formatDate(lesson.scheduled_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-slate-500">Yaklaşan ders bulunmuyor</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">
            {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Kullanıcı'}
          </span>
        </div>
      </div>
    </header>
  );
}
