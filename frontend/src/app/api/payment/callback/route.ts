import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// HTML redirect helper
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
      // Ödeme başarılı
      const { data: pendingPayment, error: fetchError } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('order_id', merchantPaymentId)
        .single();

      console.log('Pending Payment:', pendingPayment, 'Error:', fetchError);

      if (pendingPayment) {
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
            status: 'CONFIRMED',
            payment_status: 'PAID',
            payment_id: data.pgTranId || merchantPaymentId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        console.log('Lesson Created:', lesson, 'Error:', lessonError);

        // Availability'yi güncelle
        if (lesson && pendingPayment.availability_id) {
          const { error: availError } = await supabase
            .from('availabilities')
            .update({ is_booked: true })
            .eq('id', pendingPayment.availability_id);
          
          console.log('Availability Updated, Error:', availError);
        }

        // Pending payment'ı güncelle
        const { error: updateError } = await supabase
          .from('pending_payments')
          .update({ 
            status: 'COMPLETED', 
            payment_id: data.pgTranId || merchantPaymentId,
            completed_at: new Date().toISOString() 
          })
          .eq('order_id', merchantPaymentId);

        console.log('Pending Payment Updated, Error:', updateError);
      }

      return htmlRedirect(`${baseUrl}/payment/success?orderId=${merchantPaymentId}`);
    } else {
      // Ödeme başarısız
      await supabase
        .from('pending_payments')
        .update({ 
          status: 'FAILED',
          error_message: data.responseMsg || 'Ödeme başarısız'
        })
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
