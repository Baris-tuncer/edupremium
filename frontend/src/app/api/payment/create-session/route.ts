import { NextRequest, NextResponse } from 'next/server';
import { PARATIKA_CONFIG, getApiUrl, getPaymentPageUrl } from '@/lib/paratika';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      teacherId,
      studentId,
      studentEmail,
      studentName,
      studentPhone,
      subject,
      scheduledAt,
      amount,
      availabilityId
    } = body;

    const orderId = `EDU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';

    const params = new URLSearchParams({
      ACTION: 'SESSIONTOKEN',
      MERCHANT: PARATIKA_CONFIG.MERCHANT,
      MERCHANTUSER: PARATIKA_CONFIG.MERCHANT_USER,
      MERCHANTPASSWORD: PARATIKA_CONFIG.MERCHANT_PASSWORD,
      SESSIONTYPE: 'PAYMENTSESSION',
      RETURNURL: `${baseUrl}/api/payment/callback`,
      AMOUNT: amount.toFixed(2),
      CURRENCY: 'TRY',
      CUSTOMER: studentName,
      CUSTOMEREMAIL: studentEmail,
      CUSTOMERPHONE: studentPhone || '',
      MERCHANTPAYMENTID: orderId,
    });

    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = await response.text();
    const data = Object.fromEntries(new URLSearchParams(responseText));

    if (data.responseCode === '00' && data.sessionToken) {
      await supabase.from('pending_payments').insert({
        order_id: orderId,
        teacher_id: teacherId,
        student_id: studentId,
        subject: subject,
        scheduled_at: scheduledAt,
        amount: amount,
        availability_id: availabilityId,
        session_token: data.sessionToken,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        sessionToken: data.sessionToken,
        paymentUrl: getPaymentPageUrl(data.sessionToken),
        orderId: orderId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.responseMsg || 'Session olusturulamadi',
        errorCode: data.errorCode,
        errorMsg: data.errorMsg,
        fullResponse: data,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
