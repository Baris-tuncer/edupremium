// /api/group-classes/[id]
// Belirli bir grup dersinin detayları
// GET: Detay görüntüle
// DELETE: Sınıf iptal (sadece öğretmen)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET: Grup dersi detayı
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
          profile_photo_url,
          bio,
          subjects,
          total_lessons_completed,
          rating
        )
      `)
      .eq('id', id)
      .single();

    if (error || !groupClass) {
      return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
    }

    // Kayıtlı öğrenci sayısı
    const { count } = await supabase
      .from('group_class_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('group_class_id', id)
      .eq('payment_status', 'completed')
      .eq('status', 'enrolled');

    // Kullanıcı kayıtlı mı kontrol et
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    let isEnrolled = false;
    let enrollment = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: userEnrollment } = await supabase
          .from('group_class_enrollments')
          .select('*')
          .eq('group_class_id', id)
          .eq('student_id', user.id)
          .eq('payment_status', 'completed')
          .eq('status', 'enrolled')
          .single();

        if (userEnrollment) {
          isEnrolled = true;
          enrollment = userEnrollment;
        }
      }
    }

    return NextResponse.json({
      groupClass: {
        ...groupClass,
        enrolled_count: count || 0,
        spots_left: groupClass.max_capacity - (count || 0),
      },
      isEnrolled,
      enrollment,
    });
  } catch (error: any) {
    console.error('Group class detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Sınıf iptal et (sadece öğretmen)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

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

    // Sınıf bilgisi ve yetki kontrolü
    const { data: groupClass, error: classError } = await supabase
      .from('group_classes')
      .select('*')
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single();

    if (classError || !groupClass) {
      return NextResponse.json({
        error: 'Sınıf bulunamadı veya bu işlem için yetkiniz yok'
      }, { status: 403 });
    }

    // Zaten iptal edilmiş mi?
    if (groupClass.status === 'cancelled') {
      return NextResponse.json({ error: 'Sınıf zaten iptal edilmiş' }, { status: 400 });
    }

    // Tamamlanmış mı?
    if (groupClass.status === 'completed') {
      return NextResponse.json({ error: 'Tamamlanmış sınıf iptal edilemez' }, { status: 400 });
    }

    // Kayıtlı öğrencileri al
    const { data: enrollments } = await supabase
      .from('group_class_enrollments')
      .select('*')
      .eq('group_class_id', id)
      .eq('payment_status', 'completed')
      .eq('status', 'enrolled');

    // TODO: Tüm öğrencilere iade işlemi
    // Şimdilik sadece status'u refunded olarak işaretle
    if (enrollments && enrollments.length > 0) {
      await supabase
        .from('group_class_enrollments')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
          refund_amount: 0, // TODO: Gerçek iade tutarı
          cancelled_at: new Date().toISOString(),
          cancel_reason: 'Öğretmen tarafından iptal edildi',
        })
        .eq('group_class_id', id)
        .eq('payment_status', 'completed')
        .eq('status', 'enrolled');
    }

    // Sınıfı iptal et
    const { error: cancelError } = await supabase
      .from('group_classes')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (cancelError) {
      console.error('Group class cancel error:', cancelError);
      return NextResponse.json({ error: 'Sınıf iptal edilemedi' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Sınıf iptal edildi',
      refundedStudents: enrollments?.length || 0,
    });
  } catch (error: any) {
    console.error('Group class delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
