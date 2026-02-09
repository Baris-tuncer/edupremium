'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'lesson' | 'reschedule' | 'package';
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  isNew: boolean;
  data?: any;
}

export default function StudentNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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

  const getReadNotifications = (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('student_read_notifications');
    return stored ? JSON.parse(stored) : [];
  };

  const markAsRead = (ids: string[]) => {
    const readNotifs = getReadNotifications();
    const newReadNotifs = [...new Set([...readNotifs, ...ids])];
    const trimmed = newReadNotifs.slice(-100);
    localStorage.setItem('student_read_notifications', JSON.stringify(trimmed));

    setNotifications(prev => prev.map(n => ({
      ...n,
      isNew: !trimmed.includes(n.id),
    })));
    setUnreadCount(0);
  };

  const handleOpenNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      const ids = notifications.filter(n => n.isNew).map(n => n.id);
      setTimeout(() => markAsRead(ids), 1000);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const now = new Date();
      const twoDaysLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const readNotifs = getReadNotifications();

      const allNotifications: Notification[] = [];

      // 1. Yaklaşan dersler (48 saat içinde)
      const { data: upcomingLessons } = await supabase
        .from('lessons')
        .select('id, subject, scheduled_at, teacher_id')
        .eq('student_id', authUser.id)
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', twoDaysLater.toISOString())
        .neq('status', 'CANCELLED')
        .neq('status', 'COMPLETED')
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (upcomingLessons) {
        for (const lesson of upcomingLessons) {
          const notifId = `lesson_${lesson.id}`;
          allNotifications.push({
            id: notifId,
            type: 'lesson',
            title: lesson.subject || 'Ders',
            subtitle: formatDate(lesson.scheduled_at),
            time: lesson.scheduled_at,
            icon: '📚',
            isNew: !readNotifs.includes(notifId),
          });
        }
      }

      // 2. Ders değişiklikleri (öğretmen tarafından yapılan - son 7 gün)
      const { data: studentLessons } = await supabase
        .from('lessons')
        .select('id, teacher_id')
        .eq('student_id', authUser.id);

      const studentLessonIds = studentLessons?.map(l => l.id) || [];
      const lessonTeacherMap = new Map(studentLessons?.map(l => [l.id, l.teacher_id]) || []);

      if (studentLessonIds.length > 0) {
        const { data: lessonChanges } = await supabase
          .from('lesson_changes')
          .select('id, lesson_id, change_type, initiated_by, reason_category, old_scheduled_at, new_scheduled_at, created_at')
          .in('lesson_id', studentLessonIds)
          .eq('initiated_by', 'teacher')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (lessonChanges) {
          for (const change of lessonChanges) {
            const teacherId = lessonTeacherMap.get(change.lesson_id);

            const { data: teacher } = await supabase
              .from('teacher_profiles')
              .select('full_name')
              .eq('id', teacherId)
              .single();

            const notifId = `change_${change.id}`;
            const newDate = new Date(change.new_scheduled_at);

            allNotifications.push({
              id: notifId,
              type: 'reschedule',
              title: `${teacher?.full_name || 'Öğretmen'} tarih değiştirdi`,
              subtitle: `Yeni: ${newDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}`,
              time: change.created_at,
              icon: '📅',
              isNew: !readNotifs.includes(notifId),
              data: change,
            });
          }
        }
      }

      // 3. Paket satın alımları (son 7 gün)
      const { data: packagePurchases } = await supabase
        .from('package_payments')
        .select('id, campaign_name, total_lessons, created_at, teacher_id')
        .eq('student_id', authUser.id)
        .eq('status', 'completed')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (packagePurchases) {
        for (const purchase of packagePurchases) {
          const { data: teacher } = await supabase
            .from('teacher_profiles')
            .select('full_name')
            .eq('id', purchase.teacher_id)
            .single();

          const notifId = `package_${purchase.id}`;
          allNotifications.push({
            id: notifId,
            type: 'package',
            title: `Paket satın alındı!`,
            subtitle: `${teacher?.full_name || 'Öğretmen'} - ${purchase.total_lessons} ders`,
            time: purchase.created_at,
            icon: '🎉',
            isNew: !readNotifs.includes(notifId),
          });
        }
      }

      // Tarihe göre sırala
      allNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setNotifications(allNotifications.slice(0, 10));
      setUnreadCount(allNotifications.filter(n => n.isNew).length);
    } catch (err) {
      console.error('Notifications fetch error:', err);
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

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const getNotificationStyle = (type: string, isNew: boolean) => {
    const baseStyle = isNew ? 'bg-blue-50/50' : '';
    switch (type) {
      case 'reschedule':
        return `${baseStyle} border-l-4 border-l-amber-400`;
      case 'package':
        return `${baseStyle} border-l-4 border-l-emerald-400`;
      default:
        return `${baseStyle} border-l-4 border-l-[#D4AF37]`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenNotifications}
        className="relative p-2 text-slate-500 hover:text-[#D4AF37] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0F172A] to-[#1E293B]">
            <h3 className="font-semibold text-white">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} yeni
              </span>
            )}
          </div>
          {notifications.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${getNotificationStyle(notif.type, notif.isNew)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                      notif.type === 'reschedule'
                        ? 'bg-amber-100 text-amber-600'
                        : notif.type === 'package'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    }`}>
                      {notif.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-[#0F172A] text-sm ${notif.isNew ? 'font-semibold' : ''}`}>
                          {notif.title}
                        </p>
                        {notif.isNew && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{notif.subtitle}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(notif.time)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">Bildirim bulunmuyor</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
