// /api/admin/premium-settings
// Admin: Premium üyelik ayarlarını yönetir

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const supabase = getSupabase();

  try {
    // Planları al
    const { data: plans, error: plansError } = await supabase
      .from('premium_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (plansError) {
      console.error('Premium plans fetch error:', plansError);
    }

    // Özellikleri al
    const { data: features, error: featuresError } = await supabase
      .from('premium_features')
      .select('*')
      .order('sort_order', { ascending: true });

    if (featuresError) {
      console.error('Premium features fetch error:', featuresError);
    }

    // Platform ayarlarını al
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('*');

    if (settingsError) {
      console.error('Platform settings fetch error:', settingsError);
    }

    // Ayarları key-value objesi olarak dönüştür
    const settingsMap = (settings || []).reduce((acc: any, s: any) => {
      acc[s.setting_key] = {
        value: s.setting_value,
        type: s.setting_type,
        description: s.description
      };
      return acc;
    }, {});

    // İstatistikler
    const { data: activeCount } = await supabase
      .from('teacher_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_featured', true)
      .gte('featured_until', new Date().toISOString());

    const { data: totalPayments } = await supabase
      .from('featured_payments')
      .select('amount')
      .eq('payment_status', 'completed');

    const totalRevenue = (totalPayments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const { data: pendingCount } = await supabase
      .from('featured_payments')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'pending');

    // Kategori bazlı dağılım
    const { data: categoryStats } = await supabase
      .from('teacher_profiles')
      .select('featured_category')
      .eq('is_featured', true)
      .gte('featured_until', new Date().toISOString());

    const categoryDistribution = (categoryStats || []).reduce((acc: any, t: any) => {
      const cat = t.featured_category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      active_premium_count: activeCount || 0,
      pending_applications: pendingCount || 0,
      total_revenue: totalRevenue,
      category_distribution: categoryDistribution,
    };

    return NextResponse.json({
      plans: plans || [],
      features: features || [],
      settings: settingsMap,
      stats,
    });
  } catch (error: any) {
    console.error('Premium settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Plan güncelle
export async function PUT(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (type === 'plan') {
      // Plan güncelle
      const { error } = await supabase
        .from('premium_plans')
        .update({
          label: data.label,
          price: data.price,
          per_day: Math.round(data.price / data.days),
          is_popular: data.is_popular,
          is_active: data.is_active,
        })
        .eq('id', id);

      if (error) throw error;
    } else if (type === 'feature') {
      // Özellik güncelle
      const { error } = await supabase
        .from('premium_features')
        .update({
          title: data.title,
          description: data.description,
          is_active: data.is_active,
        })
        .eq('id', id);

      if (error) throw error;
    } else if (type === 'setting') {
      // Platform ayarı güncelle
      const { error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: data.value,
        })
        .eq('setting_key', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Premium settings update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Yeni özellik ekle
export async function POST(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'feature') {
      // Yeni özellik ekle
      const { data: maxOrder } = await supabase
        .from('premium_features')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase
        .from('premium_features')
        .insert({
          title: data.title,
          description: data.description,
          icon: data.icon || 'star',
          sort_order: (maxOrder?.sort_order || 0) + 1,
          is_active: true,
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Premium settings create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Özellik sil
export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (type === 'feature' && id) {
      const { error } = await supabase
        .from('premium_features')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Premium settings delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
