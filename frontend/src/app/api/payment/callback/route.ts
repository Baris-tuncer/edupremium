import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import {
  getStudentPaymentConfirmationEmail,
  getTeacherNewLessonEmail
} from '@/lib/email-templates';
import { createDailyRoom } from '@/lib/daily';
import { verifyParatikaCallback } from '@/lib/paratika';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

async function sendEmails(pendingPayment: any, orderId: string, meetingLink: string | null, supabase: any, resend: any) {
  try {
    console.log('sendEmails started for order:', orderId);

    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('full_name, email')
      .eq('id', pendingPayment.student_id)
      .single();

    console.log('Student data:', student, 'Error:', studentError);

    const { data: teacher, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('full_name, email, hourly_rate_net')
      .eq('id', pendingPayment.teacher_id)
      .single();

    console.log('Teacher data:', teacher, 'Error:', teacherError);

    if (!student || !teacher) {
      console.error('Student or teacher not found');
      return;
    }

    const date = formatDate(pendingPayment.scheduled_at);
    const time = formatTime(pendingPayment.scheduled_at);
    // Yeni algoritma: Öğretmenin net tutarı doğrudan DB'den alınır
    const teacherEarnings = teacher.hourly_rate_net || Math.round(pendingPayment.amount * 0.58); // fallback hesaplama

    // Öğrenciye email
    console.log('Sending student email to:', student.email);
    const { data: studentEmailData, error: studentEmailError } = await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: student.email,
      subject: '✅ Ödemeniz Onaylandı - EduPremium',
      html: getStudentPaymentConfirmationEmail({
        studentName: student.full_name || 'Öğrenci',
        teacherName: teacher.full_name || 'Öğretmen',
        subject: pendingPayment.subject,
        date,
        time,
        price: pendingPayment.amount,
        orderId,
        meetingLink,
      }),
    });

    if (studentEmailError) {
      console.error('Student email error:', studentEmailError);
    } else {
      console.log('Student email sent successfully:', studentEmailData);
    }

    // Öğretmene email
    console.log('Sending teacher email to:', teacher.email);
    const { data: teacherEmailData, error: teacherEmailError } = await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: teacher.email,
      subject: '🎉 Yeni Ders Satışı - EduPremium',
      html: getTeacherNewLessonEmail({
        teacherName: teacher.full_name || 'Öğretmen',
        studentName: student.full_name || 'Öğrenci',
        subject: pendingPayment.subject,
        date,
        time,
        price: pendingPayment.amount,
        earnings: teacherEarnings,
        meetingLink,
      }),
    });

    if (teacherEmailError) {
      console.error('Teacher email error:', teacherEmailError);
    } else {
      console.log('Teacher email sent successfully:', teacherEmailData);
    }

  } catch (error) {
    console.error('sendEmails error:', error);
  }
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

    console.log('Paratika Callback Data:', JSON.stringify(data));

    // HASH doğrulaması - Sahte callback'leri engelle
    if (!verifyParatikaCallback(data)) {
      console.error('Paratika callback HASH doğrulaması başarısız - olası sahte istek!');
      return htmlRedirect(`${baseUrl}/payment/fail?error=Guvenlik_hatasi`);
    }

    const responseCode = data.responseCode;
    const merchantPaymentId = data.merchantPaymentId;

    if (responseCode === '00') {
      const { data: pendingPayment, error: fetchError } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('order_id', merchantPaymentId)
        .single();

      console.log('Pending Payment:', pendingPayment, 'Error:', fetchError);

      if (pendingPayment) {
        // Öğretmenin net kazancını al
        const { data: teacherData } = await supabase
          .from('teacher_profiles')
          .select('hourly_rate_net, base_price')
          .eq('id', pendingPayment.teacher_id)
          .single();

        const teacherNetEarnings = teacherData?.hourly_rate_net || teacherData?.base_price || 0;

        // Ders oluştur
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            teacher_id: pendingPayment.teacher_id,
            student_id: pendingPayment.student_id,
            subject: pendingPayment.subject,
            scheduled_at: pendingPayment.scheduled_at,
            duration_minutes: 60,
            price: pendingPayment.amount,
            teacher_earnings: teacherNetEarnings,  // Öğretmenin net kazancı
            status: 'CONFIRMED',
            payment_status: 'PAID',
            payment_id: data.pgTranId || merchantPaymentId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        console.log('Lesson Created:', lesson, 'Error:', lessonError);

        // Daily.co room oluştur
        let meetingLink: string | null = null;
        if (lesson) {
          meetingLink = await createDailyRoom(lesson.id);
          console.log('Meeting Link Created:', meetingLink);

          // Meeting link'i lesson'a kaydet
          if (meetingLink) {
            await supabase
              .from('lessons')
              .update({ meeting_link: meetingLink })
              .eq('id', lesson.id);
            console.log('Meeting link saved to lesson');
          }
        }

        if (pendingPayment.availability_id) {
          const { error: availError } = await supabase
            .from('availabilities')
            .update({ is_booked: true })
            .eq('id', pendingPayment.availability_id);
          console.log('Availability Updated, Error:', availError);
        }

        await supabase
          .from('pending_payments')
          .update({ 
            status: 'COMPLETED', 
            payment_id: data.pgTranId || merchantPaymentId,
            completed_at: new Date().toISOString() 
          })
          .eq('order_id', merchantPaymentId);

        console.log('Pending Payment Updated');

        // Email gönder (meeting link ile)
        await sendEmails(pendingPayment, merchantPaymentId, meetingLink, supabase, resend);
      }

      return htmlRedirect(`${baseUrl}/payment/success?orderId=${merchantPaymentId}`);
    } else {
      await supabase
        .from('pending_payments')
        .update({ status: 'FAILED', error_message: data.responseMsg || 'Ödeme başarısız' })
        .eq('order_id', merchantPaymentId);

      return htmlRedirect(`${baseUrl}/payment/fail?error=Odeme_basarisiz`);
    }
  } catch (error: any) {
    console.error('Callback Error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
    return htmlRedirect(`${baseUrl}/payment/fail?error=Sistem_hatasi`);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
  const responseCode = searchParams.get('responseCode');
  const merchantPaymentId = searchParams.get('merchantPaymentId');

  if (responseCode === '00' && merchantPaymentId) {
    return htmlRedirect(`${baseUrl}/payment/success?orderId=${merchantPaymentId}`);
  }
  return htmlRedirect(`${baseUrl}/payment/fail?error=Odeme_basarisiz`);
}
