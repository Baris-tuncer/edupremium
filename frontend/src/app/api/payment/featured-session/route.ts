import { NextRequest, NextResponse } from 'next/server';
import { PARATIKA_CONFIG, getApiUrl, getPaymentPageUrl } from '@/lib/paratika';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sabit fiyat - client manipülasyonunu engeller
const FEATURED_PRICE = 4500;

export async function POST(request: NextRequest) {
  try {
    // AUTH KONTROLÜ - Sadece giriş yapmış öğretmenler featured satın alabilir
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
    const { teacherId, category, headline } = body;

    // Öğretmenin kendi hesabı için satın aldığını doğrula
    if (user.id !== teacherId) {
      return NextResponse.json(
        { success: false, error: 'Sadece kendi hesabınız için featured satın alabilirsiniz' },
        { status: 403 }
      );
    }

    // Fiyat her zaman server tarafından belirlenir
    const amount = FEATURED_PRICE;

    // Öğretmen bilgilerini al
    const { data: teacher } = await supabase
      .from('teacher_profiles')
      .select('full_name, email')
      .eq('id', teacherId)
      .single();

    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Öğretmen bulunamadı' }, { status: 404 });
    }

    const orderId = `FEAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';

    // featured_payments kaydı oluştur
    const { error: insertError } = await supabase
      .from('featured_payments')
      .insert({
        teacher_id: teacherId,
        category,
        headline,
        amount,
        payment_method: 'paratika',
        payment_status: 'pending',
        paratika_payment_id: orderId,
      });

    if (insertError) {
      console.error('Featured payment insert error:', insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // Paratika session oluştur
    const params = new URLSearchParams({
      ACTION: 'SESSIONTOKEN',
      MERCHANT: PARATIKA_CONFIG.MERCHANT,
      MERCHANTUSER: PARATIKA_CONFIG.MERCHANT_USER,
      MERCHANTPASSWORD: PARATIKA_CONFIG.MERCHANT_PASSWORD,
      SESSIONTYPE: 'PAYMENTSESSION',
      RETURNURL: `${baseUrl}/api/payment/featured-callback`,
      AMOUNT: amount.toFixed(2),
      CURRENCY: 'TRY',
      CUSTOMER: teacher.full_name || 'Öğretmen',
      CUSTOMEREMAIL: teacher.email || '',
      CUSTOMERPHONE: '',
      MERCHANTPAYMENTID: orderId,
      ORDERITEMS: JSON.stringify([{
        code: 'FEATURED',
        name: 'Editörün Seçimi Paketi',
        description: `Editörün Seçimi - ${category} - 30 gün`,
        quantity: '1',
        amount: amount,
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
      return NextResponse.json({
        success: true,
        sessionToken: data.sessionToken,
        paymentUrl: getPaymentPageUrl(data.sessionToken),
        orderId,
      });
    } else {
      // Başarısız - kaydı sil
      await supabase.from('featured_payments').delete().eq('paratika_payment_id', orderId);

      return NextResponse.json({
        success: false,
        error: data.responseMsg || 'Session oluşturulamadı',
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Featured payment error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}