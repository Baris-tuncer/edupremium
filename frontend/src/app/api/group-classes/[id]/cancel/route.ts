// /api/group-classes/[id]/cancel
// Öğrenci grup dersi kaydını iptal eder (48 saat önce)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Request body
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Sınıf bilgisi
    const { data: groupClass, error: classError } = await supabase
      .from('group_classes')
      .select('*')
      .eq('id', groupClassId)
      .single();

    if (classError || !groupClass) {
      return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
    }

    // Kayıt kontrolü
    const { data: enrollment, error: enrollError } = await supabase
      .from('group_class_enrollments')
      .select('*')
      .eq('group_class_id', groupClassId)
      .eq('student_id', user.id)
      .eq('payment_status', 'completed')
      .eq('status', 'enrolled')
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json({
        error: 'Bu sınıfa kaydınız bulunamadı'
      }, { status: 404 });
    }

    // 48 saat kuralı kontrolü
    const now = new Date();
    const scheduledAt = new Date(groupClass.scheduled_at);
    const hoursDiff = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 48) {
      return NextResponse.json({
        error: 'Ders saatine 48 saatten az kaldığı için iptal yapılamaz'
      }, { status: 400 });
    }

    // Kaydı iptal et ve tam iade işaretle
    const { error: cancelError } = await supabase
      .from('group_class_enrollments')
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
        refund_amount: enrollment.amount_paid, // Tam iade
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason || 'Öğrenci tarafından iptal edildi',
      })
      .eq('id', enrollment.id);

    if (cancelError) {
      console.error('Enrollment cancel error:', cancelError);
      return NextResponse.json({ error: 'İptal işlemi başarısız' }, { status: 500 });
    }

    // TODO: Gerçek iade işlemi (Paratika refund API)

    return NextResponse.json({
      success: true,
      message: 'Kaydınız iptal edildi. İade işlemi en kısa sürede hesabınıza yansıyacaktır.',
      refundAmount: enrollment.amount_paid,
    });
  } catch (error: any) {
    console.error('Group class cancel error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
