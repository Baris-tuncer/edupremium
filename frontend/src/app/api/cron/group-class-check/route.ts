// /api/cron/group-class-check
// Grup derslerinin minimum kapasite kontrolu
// - Kayit suresi gecmis ve minimum kapasite dolmamis dersleri iptal eder
// - Tum kayitli ogrencilere iade yapar

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Prevent static generation - this route requires runtime env vars
export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function GET(request: NextRequest) {
  // CRON_SECRET yoksa production'da erisimi tamamen engelle
  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET is not configured');
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  // Vercel Cron guvenlik kontrolu
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized cron access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const resend = getResend();

  try {
    const now = new Date();
    const results = {
      checked: 0,
      cancelled: 0,
      confirmed: 0,
      completed: 0,
      refunded_students: 0,
      errors: [] as string[],
    };

    // 1. Kayit suresi gecmis ve hala "open" olan dersleri bul
    const { data: openClasses, error: fetchError } = await supabase
      .from('group_classes')
      .select('*')
      .eq('status', 'open')
      .lt('enrollment_deadline', now.toISOString());

    if (fetchError) {
      console.error('Error fetching open classes:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    results.checked = openClasses?.length || 0;
    console.log(`Found ${results.checked} open classes with passed deadline`);

    // Her bir sınıf icin kontrol
    for (const groupClass of openClasses || []) {
      try {
        // Kayitli ogrenci sayısını al
        const { count, error: countError } = await supabase
          .from('group_class_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('group_class_id', groupClass.id)
          .eq('payment_status', 'completed')
          .eq('status', 'enrolled');

        if (countError) {
          results.errors.push(`Count error for ${groupClass.id}: ${countError.message}`);
          continue;
        }

        const enrolledCount = count || 0;

        // Minimum kapasite kontrolu
        if (enrolledCount < groupClass.min_capacity) {
          // IPTAL: Minimum dolmadı
          console.log(`Cancelling class ${groupClass.id}: ${enrolledCount}/${groupClass.min_capacity} students`);

          // Tum kayitlari iptal et ve iade isaretle
          const { data: enrollments } = await supabase
            .from('group_class_enrollments')
            .select(`
              *,
              student:student_id (
                id,
                full_name,
                email
              )
            `)
            .eq('group_class_id', groupClass.id)
            .eq('payment_status', 'completed')
            .eq('status', 'enrolled');

          // Kayitlari guncelle
          await supabase
            .from('group_class_enrollments')
            .update({
              status: 'cancelled',
              payment_status: 'refunded',
              refund_amount: groupClass.display_price,
              cancelled_at: now.toISOString(),
              cancel_reason: 'Minimum ogrenci sayısına ulasılamadı',
            })
            .eq('group_class_id', groupClass.id)
            .eq('payment_status', 'completed')
            .eq('status', 'enrolled');

          // Sınıfı iptal et
          await supabase
            .from('group_classes')
            .update({ status: 'cancelled' })
            .eq('id', groupClass.id);

          results.cancelled++;
          results.refunded_students += enrollments?.length || 0;

          // Ogrencilere e-posta gonder
          if (enrollments && enrollments.length > 0) {
            await sendCancellationEmails(groupClass, enrollments, resend);
          }

        } else {
          // ONAYLA: Minimum doldu
          console.log(`Confirming class ${groupClass.id}: ${enrolledCount}/${groupClass.min_capacity} students`);

          await supabase
            .from('group_classes')
            .update({ status: 'confirmed' })
            .eq('id', groupClass.id);

          results.confirmed++;
        }
      } catch (err: any) {
        results.errors.push(`${groupClass.id}: ${err.message}`);
        console.error(`Error processing class ${groupClass.id}:`, err);
      }
    }

    // 2. Tamamlanmis dersleri isle (ders saati gecmis confirmed dersler)
    const completedCutoff = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 saat once

    const { data: confirmedClasses } = await supabase
      .from('group_classes')
      .select('id')
      .eq('status', 'confirmed')
      .lt('scheduled_at', completedCutoff.toISOString());

    for (const gc of confirmedClasses || []) {
      try {
        await supabase
          .from('group_classes')
          .update({ status: 'completed' })
          .eq('id', gc.id);

        results.completed++;
      } catch (err: any) {
        results.errors.push(`Complete ${gc.id}: ${err.message}`);
      }
    }

    console.log('Group class check completed:', results);

    return NextResponse.json({
      success: true,
      message: `Checked ${results.checked} classes, cancelled ${results.cancelled}, confirmed ${results.confirmed}, completed ${results.completed}`,
      results,
    });

  } catch (error: any) {
    console.error('Cron group-class-check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Iptal e-postası gonder
async function sendCancellationEmails(groupClass: any, enrollments: any[], resend: any) {
  try {
    const scheduledDate = new Date(groupClass.scheduled_at).toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    for (const enrollment of enrollments) {
      if (!enrollment.student?.email) continue;

      await resend.emails.send({
        from: 'EduPremium <noreply@visserr.com>',
        to: enrollment.student.email,
        subject: `Grup Dersi Iptal Edildi - ${groupClass.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #DC2626;">Grup Dersi Iptal Edildi</h2>

            <p>Merhaba ${enrollment.student.full_name},</p>

            <p>Uzulerek bildirmek isteriz ki <strong>${groupClass.title}</strong> grup dersi, minimum ogrenci sayısına ulasılamadıgı icin iptal edilmistir.</p>

            <div style="background: #FEF2F2; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p><strong>Ders:</strong> ${groupClass.title}</p>
              <p><strong>Planlanan Tarih:</strong> ${scheduledDate}</p>
              <p><strong>Iade Tutarı:</strong> ${groupClass.display_price.toLocaleString('tr-TR')} TL</p>
            </div>

            <p style="color: #16A34A; font-weight: bold;">
              Odediginiz tutarın iadesi en kısa surede hesabınıza yansıyacaktır.
            </p>

            <p>Baska grup derslerine katılmak icin platformumuzu ziyaret edebilirsiniz.</p>

            <p style="color: #6B7280; margin-top: 20px;">
              Anlayısınız icin tesekkur ederiz.
            </p>
          </div>
        `,
      });
    }

    console.log(`Sent cancellation emails to ${enrollments.length} students`);
  } catch (error) {
    console.error('Cancellation email error:', error);
  }
}
