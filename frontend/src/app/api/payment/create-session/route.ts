import { NextRequest, NextResponse } from 'next/server';
import { PARATIKA_CONFIG, getApiUrl, getPaymentPageUrl } from '@/lib/paratika';
import { createClient } from '@supabase/supabase-js';
import { calculateDisplayPrice } from '@/lib/price-calculator';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();

  try {
    // AUTH KONTROLÜ - Giriş yapmamış kullanıcılar ödeme başlatamaz
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Token ile kullanıcıyı doğrula
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz oturum. Lütfen tekrar giriş yapın.' },
        { status: 401 }
      );
    }

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

    // Kullanıcının kendi adına ödeme yaptığını doğrula (opsiyonel güvenlik)
    if (user.id !== studentId) {
      console.warn(`Auth mismatch: user ${user.id} trying to pay for student ${studentId}`);
      // İzin veriyoruz ama logluyoruz - veli öğrenci adına ödeme yapabilir
    }

    // ========================================
    // SUNUCU TARAFI FİYAT DOĞRULAMASI
    // Hash mismatch'i önlemek için kritik
    // ========================================
    const { data: teacherData, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('hourly_rate_net, hourly_rate_display, base_price, commission_rate')
      .eq('id', teacherId)
      .single();

    if (teacherError || !teacherData) {
      return NextResponse.json({
        success: false,
        error: 'Öğretmen bilgisi bulunamadı',
      }, { status: 400 });
    }

    // YENİ SİSTEM: Her zaman NET fiyattan hesapla
    // Öğretmenin belirlediği NET tutar + vergiler/komisyon = Veli öder
    const netPrice = teacherData.hourly_rate_net || teacherData.base_price || 0;

    if (netPrice <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Öğretmen fiyat bilgisi eksik',
      }, { status: 400 });
    }

    const calculatedPrice = calculateDisplayPrice(netPrice, teacherData.commission_rate || 0.25);

    // İstemciden gelen fiyat, hesaplanan fiyata yakın mı? (50 TL tolerans - yuvarlama için)
    if (Math.abs(amount - calculatedPrice) > 50) {
      console.error(`Price mismatch! Client: ${amount}, Calculated from NET ${netPrice}: ${calculatedPrice}`);
      return NextResponse.json({
        success: false,
        error: 'Fiyat güncellendi. Lütfen sayfayı yenileyin.',
        newPrice: calculatedPrice,
      }, { status: 400 });
    }

    // Her zaman sunucu hesaplı fiyatı kullan
    const serverCalculatedPrice = calculatedPrice;

    const orderId = `EDU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';

    // Önce pending_payment kaydını oluştur
    const { data: pendingData, error: pendingError } = await supabase
      .from('pending_payments')
      .insert({
        order_id: orderId,
        teacher_id: teacherId,
        student_id: studentId,
        subject: subject,
        scheduled_at: scheduledAt,
        amount: serverCalculatedPrice,  // Sunucu doğrulanmış fiyat
        availability_id: availabilityId,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    console.log('Pending Payment Insert:', pendingData, 'Error:', pendingError);

    if (pendingError) {
      console.error('Pending payment insert error:', pendingError);
      return NextResponse.json({
        success: false,
        error: 'Ödeme kaydı oluşturulamadı: ' + pendingError.message,
      }, { status: 500 });
    }

    const params = new URLSearchParams({
      ACTION: 'SESSIONTOKEN',
      MERCHANT: PARATIKA_CONFIG.MERCHANT,
      MERCHANTUSER: PARATIKA_CONFIG.MERCHANT_USER,
      MERCHANTPASSWORD: PARATIKA_CONFIG.MERCHANT_PASSWORD,
      SESSIONTYPE: 'PAYMENTSESSION',
      RETURNURL: `${baseUrl}/api/payment/callback`,
      AMOUNT: serverCalculatedPrice.toFixed(2),  // Sunucu hesaplı fiyat
      CURRENCY: 'TRY',
      CUSTOMER: studentName,
      CUSTOMEREMAIL: studentEmail,
      CUSTOMERPHONE: studentPhone || '',
      MERCHANTPAYMENTID: orderId,
      ORDERITEMS: JSON.stringify([{ code: 'DERS', name: subject, description: subject + ' dersi', quantity: '1', amount: serverCalculatedPrice }]),
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
      const { error: updateError } = await supabase
        .from('pending_payments')
        .update({ session_token: data.sessionToken })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Session token update error:', updateError);
      }

      return NextResponse.json({
        success: true,
        sessionToken: data.sessionToken,
        paymentUrl: getPaymentPageUrl(data.sessionToken),
        orderId: orderId,
      });
    } else {
      // Paratika hata verdi, pending_payment'ı sil
      await supabase.from('pending_payments').delete().eq('order_id', orderId);

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
