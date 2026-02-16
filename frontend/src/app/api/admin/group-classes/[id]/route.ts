// /api/admin/group-classes/[id]
// Admin: Belirli bir grup dersinin detayları ve kayıtlı öğrenciler

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET: Detay + öğrenciler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  try {
    // Sınıf bilgisi
    const { data: groupClass, error } = await supabase
      .from('group_classes')
      .select(`
        *,
        teacher:teacher_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error || !groupClass) {
      return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
    }

    // Kayıtlı öğrenciler
    const { data: enrollments } = await supabase
      .from('group_class_enrollments')
      .select(`
        *,
        student:student_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('group_class_id', id)
      .order('created_at', { ascending: true });

    // İstatistikler
    const completedEnrollments = (enrollments || []).filter(
      e => e.payment_status === 'completed' && e.status === 'enrolled'
    );

    const stats = {
      enrolled_count: completedEnrollments.length,
      spots_left: groupClass.max_capacity - completedEnrollments.length,
      total_revenue: completedEnrollments.reduce((sum, e) => sum + (e.amount_paid || 0), 0),
      teacher_earnings: completedEnrollments.length * groupClass.net_price,
      pending_count: (enrollments || []).filter(e => e.payment_status === 'pending').length,
      cancelled_count: (enrollments || []).filter(e => e.status === 'cancelled').length,
      refunded_count: (enrollments || []).filter(e => e.payment_status === 'refunded').length,
    };

    return NextResponse.json({
      groupClass,
      enrollments: enrollments || [],
      stats,
    });
  } catch (error: any) {
    console.error('Admin group class detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Sınıf güncelle (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  try {
    const body = await request.json();
    const { status, meeting_link } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (meeting_link !== undefined) updateData.meeting_link = meeting_link;

    const { data, error } = await supabase
      .from('group_classes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Admin group class update error:', error);
      return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
    }

    return NextResponse.json({ success: true, groupClass: data });
  } catch (error: any) {
    console.error('Admin group class update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
