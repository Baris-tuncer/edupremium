import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const responseCode = data.responseCode;
    const merchantPaymentId = data.merchantPaymentId;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';

    if (responseCode === '00') {
      const { data: pendingPayment } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('order_id', merchantPaymentId)
        .single();

      if (pendingPayment) {
        const { data: lesson } = await supabase
          .from('lessons')
          .insert({
            teacher_id: pendingPayment.teacher_id,
            student_id: pendingPayment.student_id,
            subject: pendingPayment.subject,
            scheduled_at: pendingPayment.scheduled_at,
            duration_minutes: 60,
            price: pendingPayment.amount,
            status: 'CONFIRMED',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (lesson && pendingPayment.availability_id) {
          await supabase
            .from('availabilities')
            .update({ is_booked: true })
            .eq('id', pendingPayment.availability_id);
        }

        await supabase
          .from('pending_payments')
          .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
          .eq('order_id', merchantPaymentId);
      }

      return NextResponse.redirect(`${baseUrl}/payment/success?orderId=${merchantPaymentId}`);
    } else {
      await supabase
        .from('pending_payments')
        .update({ status: 'FAILED' })
        .eq('order_id', merchantPaymentId);

      return NextResponse.redirect(`${baseUrl}/payment/fail?error=Odeme basarisiz`);
    }
  } catch (error: any) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
    return NextResponse.redirect(`${baseUrl}/payment/fail?error=Sistem hatasi`);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
  const responseCode = searchParams.get('responseCode');
  const merchantPaymentId = searchParams.get('merchantPaymentId');

  if (responseCode === '00' && merchantPaymentId) {
    return NextResponse.redirect(`${baseUrl}/payment/success?orderId=${merchantPaymentId}`);
  }
  return NextResponse.redirect(`${baseUrl}/payment/fail?error=Odeme basarisiz`);
}
