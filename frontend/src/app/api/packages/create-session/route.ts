// /api/packages/create-session
// Paket satın alma için Paratika ödeme session'ı oluşturur
// Mevcut /api/payment/create-session'dan TAMAMEN İZOLE

import { NextRequest, NextResponse } from 'next/server';
import { PARATIKA_CONFIG, getApiUrl, getPaymentPageUrl } from '@/lib/paratika';
import { createClient } from '@supabase/supabase-js';
import { calculatePackagePrice, calculateBonusPackage } from '@/lib/package-calculator';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();

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

    // Request body
    const body = await request.json();
    const {
      campaignId,
      teacherId,
      selectedSlots, // Array of { availabilityId, scheduledAt }
      studentEmail,
      studentName,
      studentPhone,
    } = body;

    // Validasyonlar
    if (!campaignId || !teacherId || !selectedSlots || selectedSlots.length === 0) {
      return NextResponse.json({
        error: 'Eksik bilgi: campaignId, teacherId ve selectedSlots gerekli',
      }, { status: 400 });
    }

    // Kampanya bilgisi al
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('is_active', true)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Kampanya bulunamadı veya aktif değil' }, { status: 404 });
    }

    // Kampanya süresi dolmuş mu?
    if (new Date(campaign.ends_at) < new Date()) {
      return NextResponse.json({ error: 'Bu kampanyanın süresi dolmuş' }, { status: 400 });
    }

    // Max satış kontrolü
    if (campaign.max_purchases && campaign.purchase_count >= campaign.max_purchases) {
      return NextResponse.json({ error: 'Bu kampanyanın satış limiti dolmuş' }, { status: 400 });
    }

    // Seçilen slot sayısı kontrol
    const requiredSlots = campaign.lesson_count + (campaign.bonus_lessons || 0);
    if (selectedSlots.length !== requiredSlots) {
      return NextResponse.json({
        error: `Bu paket için ${requiredSlots} ders seçmeniz gerekiyor, ${selectedSlots.length} seçildi`,
      }, { status: 400 });
    }

    // Müsaitlikleri kontrol et (hepsi açık mı?)
    const availabilityIds = selectedSlots.map((s: any) => s.availabilityId);

    const { data: availabilities, error: availError } = await supabase
      .from('availabilities')
      .select('id, start_time, is_booked, teacher_id')
      .in('id', availabilityIds)
      .eq('is_booked', false)
      .eq('teacher_id', teacherId);

    if (availError) {
      return NextResponse.json({ error: 'Müsaitlik kontrolü başarısız' }, { status: 500 });
    }

    if (!availabilities || availabilities.length !== selectedSlots.length) {
      return NextResponse.json({
        error: 'Seçilen bazı saatler artık müsait değil. Lütfen tekrar seçim yapın.',
      }, { status: 400 });
    }

    // Öğrenci profili al
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single();

    // Fiyat doğrulama - kampanya değerlerini kullan
    const serverCalculatedPrice = campaign.package_total_price;

    // Order ID oluştur (paketler için PKG prefix)
    const orderId = `EDU-PKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';

    // Package payment kaydı oluştur
    const { data: packagePayment, error: paymentError } = await supabase
      .from('package_payments')
      .insert({
        order_id: orderId,
        student_id: user.id,
        teacher_id: teacherId,
        campaign_id: campaignId,

        // Snapshot değerler
        campaign_name: campaign.name,
        campaign_type: campaign.type,
        lesson_count: campaign.lesson_count,
        bonus_lessons: campaign.bonus_lessons || 0,
        total_lessons: campaign.lesson_count + (campaign.bonus_lessons || 0),
        discount_percent: campaign.discount_percent,
        net_price_per_lesson: campaign.net_price_per_lesson,
        single_lesson_display_price: campaign.single_lesson_display_price,
        total_amount: serverCalculatedPrice,
        teacher_total_earnings: campaign.teacher_total_earnings,

        // Seçilen slotlar (JSON olarak)
        // Not: Bu değeri callback'te kullanacağız
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Package payment insert error:', paymentError);
      return NextResponse.json({ error: 'Ödeme kaydı oluşturulamadı' }, { status: 500 });
    }

    // Seçilen slotları ayrı tabloda sakla (veya metadata olarak)
    // Şimdilik localStorage/sessionStorage'da tutulacak, callback'te gönderilecek

    // Paratika session oluştur
    const params = new URLSearchParams({
      ACTION: 'SESSIONTOKEN',
      MERCHANT: PARATIKA_CONFIG.MERCHANT,
      MERCHANTUSER: PARATIKA_CONFIG.MERCHANT_USER,
      MERCHANTPASSWORD: PARATIKA_CONFIG.MERCHANT_PASSWORD,
      SESSIONTYPE: 'PAYMENTSESSION',
      RETURNURL: `${baseUrl}/api/packages/callback`,
      AMOUNT: serverCalculatedPrice.toFixed(2),
      CURRENCY: 'TRY',
      CUSTOMER: studentName || studentProfile?.full_name || 'Öğrenci',
      CUSTOMEREMAIL: studentEmail || studentProfile?.email || user.email || '',
      CUSTOMERPHONE: studentPhone || studentProfile?.phone || '',
      MERCHANTPAYMENTID: orderId,
      ORDERITEMS: JSON.stringify([{
        code: 'DERS-PKG',
        name: campaign.name,
        description: `${campaign.lesson_count + (campaign.bonus_lessons || 0)} derslik paket`,
        quantity: '1',
        amount: serverCalculatedPrice,
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
        .from('package_payments')
        .update({ session_token: data.sessionToken })
        .eq('order_id', orderId);

      return NextResponse.json({
        success: true,
        sessionToken: data.sessionToken,
        paymentUrl: getPaymentPageUrl(data.sessionToken),
        orderId,
        packagePaymentId: packagePayment.id,
        // Client'a slotları geri gönder (callback için saklaması gerek)
        selectedSlots,
      });
    } else {
      // Hata durumunda package_payment'ı sil
      await supabase.from('package_payments').delete().eq('order_id', orderId);

      return NextResponse.json({
        success: false,
        error: data.responseMsg || 'Ödeme session oluşturulamadı',
        errorCode: data.errorCode,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Package create-session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
