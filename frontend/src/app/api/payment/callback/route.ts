// src/app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => { params[key] = value.toString(); });
    
    console.log('Paratika Callback:', params);

    const responseCode = params.responseCode || params.RESPONSECODE;
    const responseMsg = params.responseMsg || params.RESPONSEMSG;
    const merchantPaymentId = params.merchantPaymentId || params.MERCHANTPAYMENTID;
    
    let extra: any = {};
    try {
      const extraStr = params.EXTRA || params.extra;
      if (extraStr) extra = JSON.parse(extraStr);
    } catch (e) {}

    if (responseCode === '00') {
      console.log('Ödeme başarılı:', merchantPaymentId);

      if (extra.teacherId && extra.studentId && extra.availabilityId) {
        // Availability booked yap
        await supabase
          .from('availabilities')
          .update({ is_booked: true, booked_by: extra.studentId, booked_at: new Date().toISOString() })
          .eq('id', extra.availabilityId);

        // Lesson oluştur
        const { data: lesson } = await supabase
          .from('lessons')
          .insert({
            teacher_id: extra.teacherId,
            student_id: extra.studentId,
            subject: extra.subject || 'Ders',
            scheduled_at: extra.scheduledAt,
            duration_minutes: 60,
            price: parseInt(params.AMOUNT || params.amount || '0'),
            status: 'CONFIRMED',
            payment_id: merchantPaymentId,
            payment_status: 'PAID',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        console.log('Ders oluşturuldu:', lesson?.id);

        // Pending güncelle
        await supabase
          .from('pending_payments')
          .update({ status: 'COMPLETED', completed_at: new Date().toISOString(), lesson_id: lesson?.id })
          .eq('order_id', merchantPaymentId)
          ;
      }

      const successUrl = new URL('/payment/success', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001');
      successUrl.searchParams.set('orderId', merchantPaymentId);
      return NextResponse.redirect(successUrl.toString(), { status: 303 });
    } else {
      console.log('Ödeme başarısız:', responseCode, responseMsg);

      await supabase
        .from('pending_payments')
        .update({ status: 'FAILED', error_message: responseMsg })
        .eq('order_id', merchantPaymentId)
        ;

      const failUrl = new URL('/payment/fail', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001');
      failUrl.searchParams.set('error', responseMsg || 'Ödeme başarısız');
      failUrl.searchParams.set('code', responseCode || '99');
      return NextResponse.redirect(failUrl.toString(), { status: 303 });
    }
  } catch (error) {
    console.error('Callback error:', error);
    const failUrl = new URL('/payment/fail', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001');
    failUrl.searchParams.set('error', 'Sistem hatası');
    return NextResponse.redirect(failUrl.toString(), { status: 303 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const responseCode = searchParams.get('responseCode') || searchParams.get('RESPONSECODE');
  const merchantPaymentId = searchParams.get('merchantPaymentId') || searchParams.get('MERCHANTPAYMENTID');
  
  if (responseCode === '00') {
    const successUrl = new URL('/payment/success', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001');
    successUrl.searchParams.set('orderId', merchantPaymentId || '');
    return NextResponse.redirect(successUrl.toString());
  } else {
    const failUrl = new URL('/payment/fail', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001');
    failUrl.searchParams.set('error', searchParams.get('responseMsg') || 'Ödeme başarısız');
    return NextResponse.redirect(failUrl.toString());
  }
}
