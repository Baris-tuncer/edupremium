import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getLessonReminderEmail } from '@/lib/email-templates';

// Prevent static generation - this route requires runtime env vars
export const dynamic = 'force-dynamic';

// Build time'da değil, runtime'da oluşturulacak
let supabase: SupabaseClient;
let resend: Resend;

function getClients() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return { supabase, resend };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'Europe/Istanbul'
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Istanbul'
  });
}

export async function GET(request: NextRequest) {
  // Client'ları runtime'da oluştur
  const { supabase, resend } = getClients();

  // Vercel Cron güvenlik kontrolü
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Development'ta veya secret yoksa devam et
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const now = new Date();
    const results = { sent24h: 0, sent1h: 0, errors: [] as string[] };

    // 24 saat sonrası için: 23.5 - 24.5 saat arası
    const h24Start = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const h24End = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    // 1 saat sonrası için: 0.5 - 1.5 saat arası
    const h1Start = new Date(now.getTime() + 0.5 * 60 * 60 * 1000);
    const h1End = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);

    // 24 saat içinde başlayacak dersler
    const { data: lessons24h } = await supabase
      .from('lessons')
      .select('*')
      .gte('scheduled_at', h24Start.toISOString())
      .lte('scheduled_at', h24End.toISOString())
      .eq('status', 'CONFIRMED')
      .is('reminder_24h_sent', null);

    // 1 saat içinde başlayacak dersler
    const { data: lessons1h } = await supabase
      .from('lessons')
      .select('*')
      .gte('scheduled_at', h1Start.toISOString())
      .lte('scheduled_at', h1End.toISOString())
      .eq('status', 'CONFIRMED')
      .is('reminder_1h_sent', null);

    // 24 saat hatırlatmaları gönder
    for (const lesson of lessons24h || []) {
      try {
        await sendReminders(lesson, 24);
        await supabase
          .from('lessons')
          .update({ reminder_24h_sent: new Date().toISOString() })
          .eq('id', lesson.id);
        results.sent24h++;
      } catch (error: any) {
        results.errors.push(`24h - ${lesson.id}: ${error.message}`);
      }
    }

    // 1 saat hatırlatmaları gönder
    for (const lesson of lessons1h || []) {
      try {
        await sendReminders(lesson, 1);
        await supabase
          .from('lessons')
          .update({ reminder_1h_sent: new Date().toISOString() })
          .eq('id', lesson.id);
        results.sent1h++;
      } catch (error: any) {
        results.errors.push(`1h - ${lesson.id}: ${error.message}`);
      }
    }

    console.log('Lesson reminders sent:', results);
    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendReminders(lesson: any, hoursUntil: number) {
  // Öğrenci bilgisi
  const { data: student } = await supabase
    .from('student_profiles')
    .select('full_name, email')
    .eq('id', lesson.student_id)
    .single();

  // Öğretmen bilgisi
  const { data: teacher } = await supabase
    .from('teacher_profiles')
    .select('full_name, email')
    .eq('id', lesson.teacher_id)
    .single();

  if (!student || !teacher) {
    throw new Error('Student or teacher not found');
  }

  const date = formatDate(lesson.scheduled_at);
  const time = formatTime(lesson.scheduled_at);

  // Öğrenciye gönder
  await resend.emails.send({
    from: 'EduPremium <noreply@visserr.com>',
    to: student.email,
    subject: `⏰ Dersinize ${hoursUntil === 24 ? '24 saat' : '1 saat'} kaldı! - EduPremium`,
    html: getLessonReminderEmail({
      recipientName: student.full_name || 'Öğrenci',
      recipientRole: 'student',
      otherPartyName: teacher.full_name || 'Öğretmen',
      subject: lesson.subject,
      date,
      time,
      meetingLink: lesson.meeting_link,
      hoursUntil,
    }),
  });

  // Öğretmene gönder
  await resend.emails.send({
    from: 'EduPremium <noreply@visserr.com>',
    to: teacher.email,
    subject: `⏰ Dersinize ${hoursUntil === 24 ? '24 saat' : '1 saat'} kaldı! - EduPremium`,
    html: getLessonReminderEmail({
      recipientName: teacher.full_name || 'Öğretmen',
      recipientRole: 'teacher',
      otherPartyName: student.full_name || 'Öğrenci',
      subject: lesson.subject,
      date,
      time,
      meetingLink: lesson.meeting_link,
      hoursUntil,
    }),
  });
}
