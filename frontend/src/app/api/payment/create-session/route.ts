// src/app/api/payment/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession, getPaymentPageUrl } from '@/lib/paratika';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, teacherId, studentId, studentEmail, studentName, availabilityId, subject, scheduledAt } = body;

    if (!amount || !teacherId || !studentId || !availabilityId) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    const orderId = `EDU-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: teacher } = await supabase
      .from('teacher_profiles')
      .select('full_name')
      .eq('id', teacherId)
      .single();

    const description = `${teacher?.full_name || 'Öğretmen'} - ${subject || 'Ders'} - EduPremium`;

    const sessionResult = await createPaymentSession({
      amount: parseFloat(amount),
      orderId,
      customerEmail: studentEmail || 'student@edupremium.com',
      customerName: studentName || 'Öğrenci',
      description,
      teacherId,
      studentId,
      availabilityId,
      subject,
      scheduledAt,
    });

    if (!sessionResult.success || !sessionResult.sessionToken) {
      return NextResponse.json({ error: sessionResult.error || 'Ödeme oturumu oluşturulamadı' }, { status: 500 });
    }

    // Pending payment kaydı (opsiyonel)
    await supabase.from('pending_payments').insert({
      order_id: orderId,
      session_token: sessionResult.sessionToken,
      teacher_id: teacherId,
      student_id: studentId,
      availability_id: availabilityId,
      amount: parseFloat(amount),
      subject,
      scheduled_at: scheduledAt,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    }).catch(err => console.log('Pending payment error:', err.message));

    const paymentUrl = getPaymentPageUrl(sessionResult.sessionToken);

    return NextResponse.json({ success: true, sessionToken: sessionResult.sessionToken, paymentUrl, orderId });
  } catch (error) {
    console.error('Payment session error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
