// /api/group-classes
// Grup dersleri listesi (açık sınıflar) ve oluşturma
// Öğrenciler: açık sınıfları görür
// Öğretmenler: kendi sınıflarını oluşturur

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculatePriceFromNet, getCommissionRate } from '@/lib/price-calculator';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET: Açık grup derslerini listele
export async function GET(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    const teacherId = searchParams.get('teacherId');

    let query = supabase
      .from('group_classes')
      .select(`
        *,
        teacher:teacher_id (
          id,
          full_name,
          profile_photo_url,
          subjects,
          total_lessons_completed
        )
      `)
      .in('status', ['open', 'confirmed'])
      .gt('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });

    if (subject) {
      query = query.eq('subject', subject);
    }

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data: classes, error } = await query;

    if (error) {
      console.error('Group classes fetch error:', error);
      return NextResponse.json({ error: 'Sınıflar yüklenemedi' }, { status: 500 });
    }

    // Her sınıf için kayıtlı öğrenci sayısını hesapla
    const classesWithCount = await Promise.all(
      (classes || []).map(async (gc) => {
        const { count } = await supabase
          .from('group_class_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('group_class_id', gc.id)
          .eq('payment_status', 'completed')
          .eq('status', 'enrolled');

        return {
          ...gc,
          enrolled_count: count || 0,
          spots_left: gc.max_capacity - (count || 0),
        };
      })
    );

    return NextResponse.json({ classes: classesWithCount });
  } catch (error: any) {
    console.error('Group classes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Yeni grup dersi oluştur (sadece öğretmenler)
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

    // Öğretmen profili kontrolü
    const { data: teacherProfile, error: profileError } = await supabase
      .from('teacher_profiles')
      .select('id, full_name, is_featured, total_lessons_completed')
      .eq('id', user.id)
      .single();

    if (profileError || !teacherProfile) {
      return NextResponse.json({ error: 'Öğretmen profili bulunamadı' }, { status: 403 });
    }

    // Premium öğretmen kontrolü
    if (!teacherProfile.is_featured) {
      return NextResponse.json({
        error: 'Grup dersi oluşturmak için Premium öğretmen olmanız gerekiyor'
      }, { status: 403 });
    }

    // Request body
    const body = await request.json();
    const {
      title,
      description,
      subject,
      scheduled_at,
      duration_minutes = 60,
      net_price,
    } = body;

    // Sabit kapasite değerleri
    const min_capacity = 3;
    const max_capacity = 20;

    // Validasyonlar
    if (!title || !subject || !scheduled_at || !net_price) {
      return NextResponse.json({
        error: 'Eksik bilgi: title, subject, scheduled_at ve net_price gerekli',
      }, { status: 400 });
    }

    // Fiyat validasyonu
    if (net_price < 500) {
      return NextResponse.json({
        error: 'Minimum net fiyat 500 TL olmalıdır',
      }, { status: 400 });
    }

    // Tarih validasyonu (en az 48 saat sonrası)
    const scheduledDate = new Date(scheduled_at);
    const minDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

    if (scheduledDate < minDate) {
      return NextResponse.json({
        error: 'Ders tarihi en az 48 saat sonrası olmalıdır',
      }, { status: 400 });
    }

    // Display price hesapla
    const commissionRate = getCommissionRate(teacherProfile.total_lessons_completed || 0);
    const priceBreakdown = calculatePriceFromNet(net_price, commissionRate);
    const displayPrice = priceBreakdown.displayPrice;

    // Enrollment deadline (ders saatinden 24 saat önce)
    const enrollmentDeadline = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000);

    // Sınıf oluştur
    const { data: groupClass, error: createError } = await supabase
      .from('group_classes')
      .insert({
        teacher_id: user.id,
        title,
        description,
        subject,
        scheduled_at,
        duration_minutes,
        min_capacity,
        max_capacity,
        net_price,
        display_price: displayPrice,
        status: 'open',
        enrollment_deadline: enrollmentDeadline.toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Group class create error:', createError);
      return NextResponse.json({ error: 'Sınıf oluşturulamadı' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      groupClass,
      priceBreakdown,
    });
  } catch (error: any) {
    console.error('Group class create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
