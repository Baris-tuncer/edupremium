import { NextRequest, NextResponse } from 'next/server';
import { PARATIKA_CONFIG, getApiUrl, getPaymentPageUrl } from '@/lib/paratika';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  // Service role key kullan - RLS'yi bypass eder
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Fiyat planları - sunucu tarafında tanımlı, client manipülasyonunu engeller
const PRICING_PLANS: Record<string, { days: number; price: number; label: string }> = {
  '30': { days: 30, price: 4500, label: '1 Ay' },
  '90': { days: 90, price: 12000, label: '3 Ay' },
  '180': { days: 180, price: 21000, label: '6 Ay' },
  '365': { days: 365, price: 37000, label: '1 Yıl' },
};

export async function POST(request: NextRequest) {
  const supabase = getSupabase();

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
    const { teacherId, category, headline, planKey = '30' } = body;

    // Öğretmenin kendi hesabı için satın aldığını doğrula
    if (user.id !== teacherId) {
      return NextResponse.json(
        { success: false, error: 'Sadece kendi hesabınız için featured satın alabilirsiniz' },
        { status: 403 }
      );
    }

    // Plan doğrulaması - geçersiz plan gönderilirse varsayılan kullan
    const plan = PRICING_PLANS[planKey] || PRICING_PLANS['30'];
    const baseAmount = plan.price;
    const kdvRate = 0.20;
    const amount = Math.round(baseAmount * (1 + kdvRate)); // KDV dahil tutar
    const planDays = plan.days;

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
        plan_days: planDays,
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
        name: `Editörün Seçimi Paketi - ${plan.label}`,
        description: `Editörün Seçimi - ${category} - ${planDays} gün`,
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