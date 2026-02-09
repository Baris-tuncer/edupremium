// /api/packages/reschedule
// Paket dersini başka bir tarihe taşıma
// 24 saat kuralı ve max 2 değişiklik hakkı kontrolü

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { canRescheduleLesson, PACKAGE_CONSTANTS, CHANGE_REASONS } from '@/lib/package-calculator';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const resend = getResend();

  try {
    // Auth kontrolü
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
    }

    const body = await request.json();
    const {
      lessonId,
      newAvailabilityId,
      newScheduledAt,
      reasonCategory,
      reasonText,
      initiatedBy, // 'student' | 'teacher'
    } = body;

    // Validasyon
    if (!lessonId || !newAvailabilityId || !newScheduledAt || !reasonCategory) {
      return NextResponse.json({
        error: 'Eksik bilgi: lessonId, newAvailabilityId, newScheduledAt ve reasonCategory gerekli',
      }, { status: 400 });
    }

    // Sebep kategorisi kontrolü
    const validReasons = initiatedBy === 'teacher'
      ? CHANGE_REASONS.teacher.map(r => r.value)
      : CHANGE_REASONS.student.map(r => r.value);

    if (!validReasons.includes(reasonCategory)) {
      return NextResponse.json({ error: 'Geçersiz sebep kategorisi' }, { status: 400 });
    }

    // Dersi al
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*, package_payment_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü
    const isStudent = user.id === lesson.student_id;
    const isTeacher = user.id === lesson.teacher_id;

    if (!isStudent && !isTeacher) {
      return NextResponse.json({ error: 'Bu dersi değiştirme yetkiniz yok' }, { status: 403 });
    }

    // Paket dersi mi?
    if (!lesson.is_package_lesson) {
      return NextResponse.json({
        error: 'Bu özellik sadece paket dersleri için geçerlidir',
      }, { status: 400 });
    }

    // Değişiklik yapılabilir mi? (24 saat kuralı + limit)
    // Öğretmen kaynaklı değişikliklerde limit kontrolü yapılmaz
    if (!isTeacher) {
      const rescheduleCheck = canRescheduleLesson(
        lesson.scheduled_at,
        lesson.reschedule_count || 0
      );

      if (!rescheduleCheck.allowed) {
        return NextResponse.json({
          error: rescheduleCheck.reason,
          reschedule_count: lesson.reschedule_count,
          max_reschedule: PACKAGE_CONSTANTS.MAX_RESCHEDULE_PER_LESSON,
        }, { status: 400 });
      }
    } else {
      // Öğretmen için sadece 24 saat kuralı
      const hoursUntilLesson = (new Date(lesson.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilLesson < PACKAGE_CONSTANTS.RESCHEDULE_DEADLINE_HOURS) {
        return NextResponse.json({
          error: `Derse ${PACKAGE_CONSTANTS.RESCHEDULE_DEADLINE_HOURS} saatten az kaldığı için değişiklik yapılamaz`,
        }, { status: 400 });
      }
    }

    // Yeni müsaitlik kontrolü
    const { data: newAvailability, error: availError } = await supabase
      .from('availabilities')
      .select('*')
      .eq('id', newAvailabilityId)
      .eq('is_booked', false)
      .eq('teacher_id', lesson.teacher_id)
      .single();

    if (availError || !newAvailability) {
      return NextResponse.json({
        error: 'Seçilen saat artık müsait değil',
      }, { status: 400 });
    }

    // Eski müsaitliği bul (varsa serbest bırakmak için)
    // Not: Ders oluşturulurken availability_id kaydedilmediyse bu çalışmaz
    // O durumda sadece yeni müsaitliği kapat

    const oldScheduledAt = lesson.scheduled_at;

    // Transaction: Dersi güncelle, eski müsaitliği aç, yeni müsaitliği kapat
    // Supabase transaction desteği sınırlı, sırayla yapalım

    // 1. Dersi güncelle
    const updateData: any = {
      scheduled_at: newScheduledAt,
    };

    // Öğrenci kaynaklı değişikliklerde sayacı artır
    if (!isTeacher) {
      updateData.reschedule_count = (lesson.reschedule_count || 0) + 1;
    }

    const { error: updateError } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', lessonId);

    if (updateError) {
      console.error('Lesson update error:', updateError);
      return NextResponse.json({ error: 'Ders güncellenemedi' }, { status: 500 });
    }

    // 2. Yeni müsaitliği kapat
    await supabase
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', newAvailabilityId);

    // 3. Eski müsaitliği aç (aynı start_time'a sahip olanı bul)
    // Bu biraz karmaşık, şimdilik atlıyoruz - öğretmen manuel açabilir
    // veya cron job ile eski tarihli booked olmayan müsaitlikleri temizleyebiliriz

    // 4. Değişiklik kaydı oluştur
    await supabase
      .from('lesson_changes')
      .insert({
        lesson_id: lessonId,
        package_payment_id: lesson.package_payment_id,
        change_type: 'reschedule',
        initiated_by: isTeacher ? 'teacher' : 'student',
        reason_category: reasonCategory,
        reason_text: reasonText || null,
        old_scheduled_at: oldScheduledAt,
        new_scheduled_at: newScheduledAt,
        change_count_before: lesson.reschedule_count || 0,
      });

    // 5. Bildirimleri gönder
    await sendRescheduleNotifications(
      lesson,
      oldScheduledAt,
      newScheduledAt,
      isTeacher ? 'teacher' : 'student',
      reasonCategory,
      reasonText,
      supabase,
      resend
    );

    return NextResponse.json({
      success: true,
      message: 'Ders tarihi güncellendi',
      newScheduledAt,
      reschedule_count: isTeacher ? lesson.reschedule_count : (lesson.reschedule_count || 0) + 1,
      remaining_changes: isTeacher
        ? PACKAGE_CONSTANTS.MAX_RESCHEDULE_PER_LESSON - (lesson.reschedule_count || 0)
        : PACKAGE_CONSTANTS.MAX_RESCHEDULE_PER_LESSON - (lesson.reschedule_count || 0) - 1,
    });

  } catch (error: any) {
    console.error('Reschedule error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bildirim gönderme fonksiyonu
async function sendRescheduleNotifications(
  lesson: any,
  oldScheduledAt: string,
  newScheduledAt: string,
  initiatedBy: 'student' | 'teacher',
  reasonCategory: string,
  reasonText: string | null,
  supabase: any,
  resend: any
) {
  try {
    const { data: student } = await supabase
      .from('student_profiles')
      .select('full_name, email')
      .eq('id', lesson.student_id)
      .single();

    const { data: teacher } = await supabase
      .from('teacher_profiles')
      .select('full_name, email')
      .eq('id', lesson.teacher_id)
      .single();

    if (!student || !teacher) return;

    const oldDate = new Date(oldScheduledAt).toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newDate = new Date(newScheduledAt).toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    const reasonLabel = initiatedBy === 'teacher'
      ? CHANGE_REASONS.teacher.find(r => r.value === reasonCategory)?.label
      : CHANGE_REASONS.student.find(r => r.value === reasonCategory)?.label;

    if (initiatedBy === 'teacher') {
      // Öğrenciye bildir
      await resend.emails.send({
        from: 'EduPremium <noreply@visserr.com>',
        to: student.email,
        subject: '📅 Ders Tarihi Değişti',
        html: `
          <h2>Ders Tarihi Değişikliği</h2>
          <p>Merhaba ${student.full_name},</p>
          <p>${teacher.full_name} öğretmeniniz ders tarihini değiştirdi.</p>
          <p><strong>Eski tarih:</strong> ${oldDate}</p>
          <p><strong>Yeni tarih:</strong> ${newDate}</p>
          <p><strong>Sebep:</strong> ${reasonLabel}${reasonText ? ` - ${reasonText}` : ''}</p>
          <p>Bu değişiklik, değişiklik hakkınızdan düşmez.</p>
          <p><a href="https://www.visserr.com/student/lessons">Derslerinizi görüntüleyin</a></p>
        `,
      });

      // Öğretmene onay maili
      await resend.emails.send({
        from: 'EduPremium <noreply@visserr.com>',
        to: teacher.email,
        subject: '✅ Ders Tarihi Değişikliği Onaylandı',
        html: `
          <h2>Ders Tarihi Değişikliği Onaylandı</h2>
          <p>Merhaba ${teacher.full_name},</p>
          <p>${student.full_name} öğrencinizle olan dersinizin tarihini başarıyla değiştirdiniz.</p>
          <p><strong>Eski tarih:</strong> ${oldDate}</p>
          <p><strong>Yeni tarih:</strong> ${newDate}</p>
          <p><strong>Sebep:</strong> ${reasonLabel}${reasonText ? ` - ${reasonText}` : ''}</p>
          <p>Öğrencinize bildirim e-postası gönderildi.</p>
          <p><a href="https://www.visserr.com/teacher/lessons">Derslerinizi görüntüleyin</a></p>
        `,
      });
    } else {
      // Öğretmene bildir
      await resend.emails.send({
        from: 'EduPremium <noreply@visserr.com>',
        to: teacher.email,
        subject: '📅 Ders Tarihi Değişti',
        html: `
          <h2>Ders Tarihi Değişikliği</h2>
          <p>Merhaba ${teacher.full_name},</p>
          <p>${student.full_name} öğrenciniz ders tarihini değiştirdi.</p>
          <p><strong>Eski tarih:</strong> ${oldDate}</p>
          <p><strong>Yeni tarih:</strong> ${newDate}</p>
          <p><strong>Sebep:</strong> ${reasonLabel}${reasonText ? ` - ${reasonText}` : ''}</p>
          <p><a href="https://www.visserr.com/teacher/lessons">Derslerinizi görüntüleyin</a></p>
        `,
      });

      // Öğrenciye onay maili
      await resend.emails.send({
        from: 'EduPremium <noreply@visserr.com>',
        to: student.email,
        subject: '✅ Ders Tarihi Değişikliği Onaylandı',
        html: `
          <h2>Ders Tarihi Değişikliği Onaylandı</h2>
          <p>Merhaba ${student.full_name},</p>
          <p>${teacher.full_name} öğretmeninizle olan dersinizin tarihini başarıyla değiştirdiniz.</p>
          <p><strong>Eski tarih:</strong> ${oldDate}</p>
          <p><strong>Yeni tarih:</strong> ${newDate}</p>
          <p><strong>Sebep:</strong> ${reasonLabel}${reasonText ? ` - ${reasonText}` : ''}</p>
          <p>Öğretmeninize bildirim e-postası gönderildi.</p>
          <p><a href="https://www.visserr.com/student/lessons">Derslerinizi görüntüleyin</a></p>
        `,
      });
    }

  } catch (error) {
    console.error('Reschedule notification error:', error);
  }
}
