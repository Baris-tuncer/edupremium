// /api/group-classes/[id]/enroll
// Grup dersine kayıt ol (ödeme session'ı oluştur)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PARATIKA_CONFIG, getApiUrl, getPaymentPageUrl } from '@/lib/paratika';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id: groupClassId } = await params;

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

    // Öğrenci profili al
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single();

    // Request body (opsiyonel müşteri bilgileri)
    const body = await request.json().catch(() => ({}));
    const { studentEmail, studentName, studentPhone } = body;

    // Sınıf bilgisi
    const { data: groupClass, error: classError } = await supabase
      .from('group_classes')
      .select('*')
      .eq('id', groupClassId)
      .single();

    if (classError || !groupClass) {
      return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
    }

    // Durum kontrolü
    if (groupClass.status !== 'open' && groupClass.status !== 'confirmed') {
      return NextResponse.json({
        error: 'Bu sınıfa kayıt yapılamaz'
      }, { status: 400 });
    }

    // Enrollment deadline kontrolü
    if (new Date(groupClass.enrollment_deadline) < new Date()) {
      return NextResponse.json({
        error: 'Bu sınıf için kayıt süresi dolmuş'
      }, { status: 400 });
    }

    // Zaten kayıtlı mı?
    const { data: existingEnrollment } = await supabase
      .from('group_class_enrollments')
      .select('id, payment_status, status')
      .eq('group_class_id', groupClassId)
      .eq('student_id', user.id)
      .single();

    if (existingEnrollment) {
      if (existingEnrollment.payment_status === 'completed' && existingEnrollment.status === 'enrolled') {
        return NextResponse.json({
          error: 'Bu sınıfa zaten kayıtlısınız'
        }, { status: 400 });
      }

      // Pending kayıt varsa, onu güncelleyelim
      if (existingEnrollment.payment_status === 'pending') {
        // Mevcut pending kaydı sil
        await supabase
          .from('group_class_enrollments')
          .delete()
          .eq('id', existingEnrollment.id);
      }
    }

    // Kapasite kontrolü
    const { count } = await supabase
      .from('group_class_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('group_class_id', groupClassId)
      .eq('payment_status', 'completed')
      .eq('status', 'enrolled');

    if ((count || 0) >= groupClass.max_capacity) {
      return NextResponse.json({
        error: 'Bu sınıf dolu'
      }, { status: 400 });
    }

    // Order ID oluştur
    const orderId = `EDU-GRP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';

    // Enrollment kaydı oluştur (pending)
    const { data: enrollment, error: enrollError } = await supabase
      .from('group_class_enrollments')
      .insert({
        group_class_id: groupClassId,
        student_id: user.id,
        order_id: orderId,
        amount_paid: groupClass.display_price,
        payment_status: 'pending',
        status: 'enrolled',
      })
      .select()
      .single();

    if (enrollError) {
      console.error('Enrollment insert error:', enrollError);
      return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 });
    }

    // Paratika session oluştur
    const params = new URLSearchParams({
      ACTION: 'SESSIONTOKEN',
      MERCHANT: PARATIKA_CONFIG.MERCHANT,
      MERCHANTUSER: PARATIKA_CONFIG.MERCHANT_USER,
      MERCHANTPASSWORD: PARATIKA_CONFIG.MERCHANT_PASSWORD,
      SESSIONTYPE: 'PAYMENTSESSION',
      RETURNURL: `${baseUrl}/api/group-classes/enroll/callback`,
      AMOUNT: groupClass.display_price.toFixed(2),
      CURRENCY: 'TRY',
      CUSTOMER: studentName || studentProfile?.full_name || 'Öğrenci',
      CUSTOMEREMAIL: studentEmail || studentProfile?.email || user.email || '',
      CUSTOMERPHONE: studentPhone || studentProfile?.phone || '',
      MERCHANTPAYMENTID: orderId,
      ORDERITEMS: JSON.stringify([{
        code: 'GRUP-DERS',
        name: groupClass.title,
        description: `Grup dersi - ${groupClass.subject}`,
        quantity: '1',
        amount: groupClass.display_price,
      }]),
    });

    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    if (data.responseCode === '00' && data.sessionToken) {
      // Session token'ı güncelle
      await supabase
        .from('group_class_enrollments')
        .update({ session_token: data.sessionToken })
        .eq('order_id', orderId);

      return NextResponse.json({
        success: true,
        sessionToken: data.sessionToken,
        paymentUrl: getPaymentPageUrl(data.sessionToken),
        orderId,
        enrollmentId: enrollment.id,
      });
    } else {
      // Hata durumunda enrollment'ı sil
      await supabase
        .from('group_class_enrollments')
        .delete()
        .eq('order_id', orderId);

      return NextResponse.json({
        success: false,
        error: data.responseMsg || 'Ödeme session oluşturulamadı',
        errorCode: data.errorCode,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Group class enroll error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
