// /api/group-classes/enroll/callback
// Grup dersi ödeme callback'i (Paratika)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { createDailyRoom } from '@/lib/daily';
import { verifyParatikaCallback } from '@/lib/paratika';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function htmlRedirect(url: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${url}">
        <script>window.location.href = "${url}";</script>
      </head>
      <body>
        <p>Yönlendiriliyorsunuz... <a href="${url}">Tıklayın</a></p>
      </body>
    </html>
  `;
  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
  const supabase = getSupabase();
  const resend = getResend();

  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('Group Class Enrollment Callback Data:', JSON.stringify(data));

    // HASH doğrulaması
    if (!verifyParatikaCallback(data)) {
      console.error('Group enrollment callback HASH doğrulaması başarısız');
      return htmlRedirect(`${baseUrl}/payment/fail?error=Guvenlik_hatasi`);
    }

    const responseCode = data.responseCode;
    const merchantPaymentId = data.merchantPaymentId;

    if (responseCode !== '00') {
      // Ödeme başarısız
      await supabase
        .from('group_class_enrollments')
        .update({ payment_status: 'failed' })
        .eq('order_id', merchantPaymentId);

      return htmlRedirect(`${baseUrl}/payment/fail?error=Odeme_basarisiz`);
    }

    // Ödeme başarılı - enrollment'ı al
    const { data: enrollment, error: fetchError } = await supabase
      .from('group_class_enrollments')
      .select(`
        *,
        group_class:group_class_id (
          *,
          teacher:teacher_id (
            id,
            full_name,
            email
          )
        ),
        student:student_id (
          id,
          full_name,
          email
        )
      `)
      .eq('order_id', merchantPaymentId)
      .single();

    if (fetchError || !enrollment) {
      console.error('Enrollment not found:', merchantPaymentId);
      return htmlRedirect(`${baseUrl}/payment/fail?error=Kayit_bulunamadi`);
    }

    // Zaten tamamlanmış mı?
    if (enrollment.payment_status === 'completed') {
      return htmlRedirect(`${baseUrl}/student/my-group-classes?success=true&orderId=${merchantPaymentId}`);
    }

    // Enrollment'ı güncelle
    const { error: updateError } = await supabase
      .from('group_class_enrollments')
      .update({
        payment_status: 'completed',
        payment_id: data.pgTranId || merchantPaymentId,
      })
      .eq('order_id', merchantPaymentId);

    if (updateError) {
      console.error('Enrollment update error:', updateError);
    }

    // Kayıtlı öğrenci sayısını kontrol et
    const { count } = await supabase
      .from('group_class_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('group_class_id', enrollment.group_class_id)
      .eq('payment_status', 'completed')
      .eq('status', 'enrolled');

    const groupClass = enrollment.group_class;

    // Minimum kapasite doldu mu? (trigger zaten kontrol ediyor ama yine de yapalım)
    if ((count || 0) >= groupClass.min_capacity && groupClass.status === 'open') {
      // Meeting link oluştur (eğer yoksa)
      if (!groupClass.meeting_link) {
        const meetingLink = await createDailyRoom(groupClass.id);
        if (meetingLink) {
          await supabase
            .from('group_classes')
            .update({
              status: 'confirmed',
              meeting_link: meetingLink,
            })
            .eq('id', groupClass.id);

          console.log(`Group class ${groupClass.id} confirmed with meeting link`);
        }
      } else {
        await supabase
          .from('group_classes')
          .update({ status: 'confirmed' })
          .eq('id', groupClass.id);
      }
    }

    // E-postalar gönder
    await sendEnrollmentEmails(enrollment, supabase, resend);

    return htmlRedirect(`${baseUrl}/student/my-group-classes?success=true&orderId=${merchantPaymentId}`);
  } catch (error: any) {
    console.error('Group enrollment callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
    return htmlRedirect(`${baseUrl}/payment/fail?error=Sistem_hatasi`);
  }
}

// E-posta gönderme fonksiyonu
async function sendEnrollmentEmails(enrollment: any, supabase: any, resend: any) {
  try {
    const student = enrollment.student;
    const teacher = enrollment.group_class.teacher;
    const groupClass = enrollment.group_class;

    if (!student?.email || !teacher?.email) {
      console.error('Student or teacher email not found');
      return;
    }

    const scheduledDate = new Date(groupClass.scheduled_at).toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Öğrenciye e-posta
    await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: student.email,
      subject: `Grup Dersine Kaydınız Tamamlandı - ${groupClass.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #5B21B6;">Grup Dersine Kaydınız Tamamlandı!</h2>

          <p>Merhaba ${student.full_name},</p>

          <p><strong>${groupClass.title}</strong> grup dersine kaydınız başarıyla tamamlandı.</p>

          <div style="background: #F5F3FF; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p><strong>Ders:</strong> ${groupClass.title}</p>
            <p><strong>Konu:</strong> ${groupClass.subject}</p>
            <p><strong>Öğretmen:</strong> ${teacher.full_name}</p>
            <p><strong>Tarih:</strong> ${scheduledDate}</p>
            <p><strong>Süre:</strong> ${groupClass.duration_minutes} dakika</p>
            <p><strong>Ödenen Tutar:</strong> ${enrollment.amount_paid.toLocaleString('tr-TR')} TL</p>
          </div>

          ${groupClass.meeting_link ? `
            <p style="background: #10B981; color: white; padding: 12px; border-radius: 8px; text-align: center;">
              Ders saati yaklaştığında ders linkini "Grup Derslerim" sayfasından bulabilirsiniz.
            </p>
          ` : `
            <p style="color: #6B7280;">
              Minimum öğrenci sayısına ulaşıldığında ders linki oluşturulacak ve size bilgi verilecektir.
            </p>
          `}

          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
            Sipariş No: ${enrollment.order_id}
          </p>
        </div>
      `,
    });

    // Öğretmene e-posta
    await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: teacher.email,
      subject: `Yeni Grup Dersi Kaydı - ${groupClass.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #5B21B6;">Yeni Öğrenci Kaydı!</h2>

          <p>Merhaba ${teacher.full_name},</p>

          <p><strong>${groupClass.title}</strong> grup dersine yeni bir öğrenci kaydoldu.</p>

          <div style="background: #F5F3FF; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p><strong>Öğrenci:</strong> ${student.full_name}</p>
            <p><strong>Ders:</strong> ${groupClass.title}</p>
            <p><strong>Tarih:</strong> ${scheduledDate}</p>
          </div>

          <p>Güncel öğrenci listesini öğretmen panelinizden görebilirsiniz.</p>
        </div>
      `,
    });

    console.log('Group enrollment emails sent successfully');
  } catch (error) {
    console.error('Group enrollment email error:', error);
  }
}

// GET handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';

  const responseCode = searchParams.get('responseCode');
  const merchantPaymentId = searchParams.get('merchantPaymentId');

  if (responseCode === '00' && merchantPaymentId) {
    return htmlRedirect(`${baseUrl}/student/my-group-classes?success=true&orderId=${merchantPaymentId}`);
  }

  return htmlRedirect(`${baseUrl}/payment/fail?error=Odeme_basarisiz`);
}
