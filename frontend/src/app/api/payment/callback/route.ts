import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { 
  getStudentPaymentConfirmationEmail, 
  getTeacherNewLessonEmail 
} from '@/lib/email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

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
    day: 'numeric' 
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

async function sendEmails(pendingPayment: any, orderId: string) {
  try {
    const { data: student } = await supabase
      .from('student_profiles')
      .select('full_name, email')
      .eq('id', pendingPayment.student_id)
      .single();

    const { data: teacher } = await supabase
      .from('teacher_profiles')
      .select('full_name, email, commission_rate')
      .eq('id', pendingPayment.teacher_id)
      .single();

    if (!student || !teacher) {
      console.error('Student or teacher not found');
      return;
    }

    const date = formatDate(pendingPayment.scheduled_at);
    const time = formatTime(pendingPayment.scheduled_at);
    const commissionRate = teacher.commission_rate || 0.25;
    const teacherEarnings = Math.round(pendingPayment.amount * (1 - commissionRate));

    // Öğrenciye email
    const { error: studentError } = await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: student.email,
      subject: '✅ Ödemeniz Onaylandı - EduPremium',
      html: getStudentPaymentConfirmationEmail({
        studentName: student.full_name || 'Öğrenci',
        teacherName: teacher.full_name || 'Öğretmen',
        subject: pendingPayment.subject,
        date, time,
        price: pendingPayment.amount,
        orderId,
      }),
    });
    if (studentError) console.error('Student email error:', studentError);
    else console.log('Student email sent to:', student.email);

    // Öğretmene email
    const { error: teacherError } = await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: teacher.email,
      subject: '🎉 Yeni Ders Satışı - EduPremium',
      html: getTeacherNewLessonEmail({
        teacherName: teacher.full_name || 'Öğretmen',
        studentName: student.full_name || 'Öğrenci',
        subject: pendingPayment.subject,
        date, time,
        price: pendingPayment.amount,
        earnings: teacherEarnings,
      }),
    });
    if (teacherError) console.error('Teacher email error:', teacherError);
    else console.log('Teacher email sent to:', teacher.email);

  } catch (error) {
    console.error('Email error:', error);
  }
}

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
  
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('Paratika Callback Data:', JSON.stringify(data));

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
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            teacher_id: pendingPayment.teacher_id,
            student_id: pendingPayment.student_id,
            subject: pendingPayment.subject,
            scheduled_at: pendingPayment.scheduled_at,
            duration_minutes: 60,
            price: pendingPayment.amount,
            status: 'CONFIRMED',
            payment_status: 'PAID',
            payment_id: data.pgTranId || merchantPaymentId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        console.log('Lesson Created:', lesson, 'Error:', lessonError);

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

        // Email gönder
        sendEmails(pendingPayment, merchantPaymentId).catch(console.error);
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
