// /api/packages/campaigns
// Kampanya CRUD API'si
// Sadece Premium Vitrin öğretmenleri kullanabilir

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  calculatePackagePrice,
  calculateBonusPackage,
  validateCampaign,
  CAMPAIGN_TYPES,
  CampaignType,
} from '@/lib/package-calculator';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// =====================================================
// GET - Kampanyaları Listele
// =====================================================

export async function GET(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    // Belirli öğretmenin kampanyaları
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    // Sadece aktif kampanyalar
    if (activeOnly) {
      query = query
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString());
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Campaigns fetch error:', error);
      return NextResponse.json({ error: 'Kampanyalar yüklenemedi' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
    });
  } catch (error: any) {
    console.error('Campaigns GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =====================================================
// POST - Yeni Kampanya Oluştur
// =====================================================

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

    // Premium Vitrin kontrolü
    const { data: teacher, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('id, is_featured, hourly_rate_net, commission_rate')
      .eq('id', user.id)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Öğretmen profili bulunamadı' }, { status: 404 });
    }

    if (!teacher.is_featured) {
      return NextResponse.json({
        error: 'Bu özellik sadece Premium Vitrin üyelerine özeldir',
        upgrade_required: true,
      }, { status: 403 });
    }

    // Request body
    const body = await request.json();
    const {
      type,
      name,
      description,
      lessonCount,
      discountPercent,
      bonusLessons,
      endsAt,
    } = body;

    // Validasyon
    const validation = validateCampaign({
      type,
      name,
      lessonCount,
      discountPercent,
      bonusLessons,
      netPricePerLesson: teacher.hourly_rate_net,
      endsAt: new Date(endsAt),
    });

    if (!validation.valid) {
      return NextResponse.json({
        error: 'Validasyon hatası',
        errors: validation.errors,
      }, { status: 400 });
    }

    // Fiyat hesaplama
    let priceBreakdown;
    const commissionRate = teacher.commission_rate || 0.25;

    if (type === 'package_discount') {
      priceBreakdown = calculatePackagePrice(
        teacher.hourly_rate_net,
        lessonCount,
        discountPercent || 0,
        commissionRate
      );
    } else if (type === 'bonus_lesson') {
      priceBreakdown = calculateBonusPackage(
        teacher.hourly_rate_net,
        lessonCount,
        bonusLessons || 0,
        commissionRate
      );
    } else {
      // first_lesson - tek derslik, özel hesaplama
      priceBreakdown = calculatePackagePrice(
        teacher.hourly_rate_net,
        1,
        discountPercent || 50,
        commissionRate
      );
    }

    // Kampanya oluştur
    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        teacher_id: user.id,
        type,
        name,
        description: description || null,
        lesson_count: priceBreakdown.lessonCount,
        discount_percent: priceBreakdown.discountPercent,
        bonus_lessons: priceBreakdown.bonusLessons,
        net_price_per_lesson: teacher.hourly_rate_net,
        commission_rate: commissionRate,
        single_lesson_display_price: priceBreakdown.singleLessonDisplayPrice,
        package_total_price: priceBreakdown.packageTotalPrice,
        teacher_total_earnings: priceBreakdown.teacherTotalEarnings,
        ends_at: endsAt,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Campaign insert error:', insertError);
      return NextResponse.json({ error: 'Kampanya oluşturulamadı' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign,
      priceBreakdown,
    });
  } catch (error: any) {
    console.error('Campaign POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =====================================================
// PUT - Kampanya Güncelle
// =====================================================

export async function PUT(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, name, description, endsAt, is_active } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'Kampanya ID gerekli' }, { status: 400 });
    }

    // Kampanya sahibi mi kontrol et
    const { data: existing, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, teacher_id, purchase_count')
      .eq('id', campaignId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Kampanya bulunamadı' }, { status: 404 });
    }

    if (existing.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Bu kampanyayı düzenleme yetkiniz yok' }, { status: 403 });
    }

    // Satış yapılmışsa fiyat/ders sayısı değiştirilemez
    // Sadece isim, açıklama, bitiş tarihi, aktiflik değiştirilebilir
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (endsAt !== undefined) updateData.ends_at = endsAt;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updated, error: updateError } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) {
      console.error('Campaign update error:', updateError);
      return NextResponse.json({ error: 'Kampanya güncellenemedi' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign: updated,
    });
  } catch (error: any) {
    console.error('Campaign PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =====================================================
// DELETE - Kampanya Sil (Pasifleştir)
// =====================================================

export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ error: 'Kampanya ID gerekli' }, { status: 400 });
    }

    // Kampanya sahibi mi kontrol et
    const { data: existing, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, teacher_id, purchase_count')
      .eq('id', campaignId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Kampanya bulunamadı' }, { status: 404 });
    }

    if (existing.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Bu kampanyayı silme yetkiniz yok' }, { status: 403 });
    }

    // Satış yapılmışsa tamamen silme, sadece pasifleştir
    if (existing.purchase_count > 0) {
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ is_active: false })
        .eq('id', campaignId);

      if (updateError) {
        return NextResponse.json({ error: 'Kampanya pasifleştirilemedi' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Kampanya pasifleştirildi (satış olduğu için silinemez)',
      });
    }

    // Satış yoksa tamamen sil
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (deleteError) {
      console.error('Campaign delete error:', deleteError);
      return NextResponse.json({ error: 'Kampanya silinemedi' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kampanya silindi',
    });
  } catch (error: any) {
    console.error('Campaign DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
