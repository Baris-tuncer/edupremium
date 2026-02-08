// /api/packages/cancel
// Paket iptali ve iade hesaplama
// Kural: Yapılan dersler TEKİL fiyattan hesaplanır

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { calculateRefund, CHANGE_REASONS } from '@/lib/package-calculator';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// =====================================================
// GET - İade Hesaplama (Önizleme)
// =====================================================

export async function GET(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const { searchParams } = new URL(request.url);
    const packagePaymentId = searchParams.get('packagePaymentId');

    if (!packagePaymentId) {
      return NextResponse.json({ error: 'packagePaymentId gerekli' }, { status: 400 });
    }

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

    // Package payment'ı al
    const { data: packagePayment, error: fetchError } = await supabase
      .from('package_payments')
      .select('*')
      .eq('id', packagePaymentId)
      .single();

    if (fetchError || !packagePayment) {
      return NextResponse.json({ error: 'Paket bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü (öğrenci veya admin)
    if (packagePayment.student_id !== user.id) {
      // Admin kontrolü eklenebilir
      return NextResponse.json({ error: 'Bu paketi iptal etme yetkiniz yok' }, { status: 403 });
    }

    // Zaten iptal edilmiş mi?
    if (packagePayment.status === 'cancelled' || packagePayment.status === 'refunded') {
      return NextResponse.json({ error: 'Bu paket zaten iptal edilmiş' }, { status: 400 });
    }

    // Tamamlanan ders sayısını hesapla
    const { count: completedLessons, error: countError } = await supabase
      .from('lessons')
      .select('id', { count: 'exact' })
      .eq('package_payment_id', packagePaymentId)
      .eq('status', 'COMPLETED');

    const completedCount = completedLessons || 0;

    // İade hesapla
    const refundCalc = calculateRefund(
      packagePayment.total_amount,
      packagePayment.single_lesson_display_price,
      packagePayment.total_lessons,
      completedCount,
      0 // Platform ücreti şimdilik 0
    );

    return NextResponse.json({
      success: true,
      packagePayment: {
        id: packagePayment.id,
        campaign_name: packagePayment.campaign_name,
        total_lessons: packagePayment.total_lessons,
        total_amount: packagePayment.total_amount,
        single_lesson_display_price: packagePayment.single_lesson_display_price,
      },
      refundCalculation: refundCalc,
    });

  } catch (error: any) {
    console.error('Cancel preview error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =====================================================
// POST - Paketi İptal Et
// =====================================================

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const resend = getResend();

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

    const body = await request.json();
    const {
      packagePaymentId,
      reasonCategory,
      reasonText,
      confirmRefundAmount, // Kullanıcının onayladığı iade tutarı
    } = body;

    // Validasyon
    if (!packagePaymentId || !reasonCategory) {
      return NextResponse.json({
        error: 'packagePaymentId ve reasonCategory gerekli',
      }, { status: 400 });
    }

    // Sebep kategorisi kontrolü
    const validReasons = CHANGE_REASONS.cancel.map(r => r.value);
    if (!validReasons.includes(reasonCategory)) {
      return NextResponse.json({ error: 'Geçersiz sebep kategorisi' }, { status: 400 });
    }

    // Package payment'ı al
    const { data: packagePayment, error: fetchError } = await supabase
      .from('package_payments')
      .select('*')
      .eq('id', packagePaymentId)
      .single();

    if (fetchError || !packagePayment) {
      return NextResponse.json({ error: 'Paket bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü
    if (packagePayment.student_id !== user.id) {
      return NextResponse.json({ error: 'Bu paketi iptal etme yetkiniz yok' }, { status: 403 });
    }

    // Zaten iptal edilmiş mi?
    if (packagePayment.status === 'cancelled' || packagePayment.status === 'refunded') {
      return NextResponse.json({ error: 'Bu paket zaten iptal edilmiş' }, { status: 400 });
    }

    // Tamamlanan ders sayısını hesapla
    const { data: completedLessonsList, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, status')
      .eq('package_payment_id', packagePaymentId);

    const completedCount = completedLessonsList?.filter(l => l.status === 'COMPLETED').length || 0;
    const pendingLessons = completedLessonsList?.filter(l => l.status !== 'COMPLETED' && l.status !== 'CANCELLED') || [];

    // İade hesapla
    const refundCalc = calculateRefund(
      packagePayment.total_amount,
      packagePayment.single_lesson_display_price,
      packagePayment.total_lessons,
      completedCount,
      0
    );

    // Kullanıcının onayladığı tutar doğru mu?
    if (confirmRefundAmount !== undefined && Math.abs(confirmRefundAmount - refundCalc.netRefund) > 10) {
      return NextResponse.json({
        error: 'İade tutarı değişti. Lütfen sayfayı yenileyip tekrar deneyin.',
        expectedRefund: refundCalc.netRefund,
      }, { status: 400 });
    }

    // Bekleyen dersleri iptal et
    if (pendingLessons.length > 0) {
      const pendingIds = pendingLessons.map(l => l.id);

      await supabase
        .from('lessons')
        .update({ status: 'CANCELLED' })
        .in('id', pendingIds);

      // Müsaitlikleri serbest bırak (karmaşık, şimdilik atlıyoruz)
    }

    // Package payment'ı güncelle
    const { error: updateError } = await supabase
      .from('package_payments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason_category: reasonCategory,
        cancel_reason_text: reasonText || null,
        refund_amount: refundCalc.netRefund,
        completed_lessons: completedCount,
        cancelled_lessons: pendingLessons.length,
      })
      .eq('id', packagePaymentId);

    if (updateError) {
      console.error('Package cancel update error:', updateError);
      return NextResponse.json({ error: 'Paket iptal edilemedi' }, { status: 500 });
    }

    // Değişiklik kaydı oluştur
    await supabase
      .from('lesson_changes')
      .insert({
        lesson_id: pendingLessons[0]?.id || null, // İlk ders referansı
        package_payment_id: packagePaymentId,
        change_type: 'package_cancel',
        initiated_by: 'student',
        reason_category: reasonCategory,
        reason_text: reasonText || null,
      });

    // E-posta bildirimleri
    await sendCancellationEmails(packagePayment, refundCalc, reasonCategory, reasonText, supabase, resend);

    return NextResponse.json({
      success: true,
      message: 'Paket iptal edildi',
      refundAmount: refundCalc.netRefund,
      completedLessons: completedCount,
      cancelledLessons: pendingLessons.length,
      note: refundCalc.netRefund > 0
        ? 'İade işlemi admin tarafından manuel olarak yapılacaktır.'
        : 'Yapılan ders sayısı nedeniyle iade tutarı bulunmamaktadır.',
    });

  } catch (error: any) {
    console.error('Package cancel error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// İptal bildirimleri
async function sendCancellationEmails(
  packagePayment: any,
  refundCalc: any,
  reasonCategory: string,
  reasonText: string | null,
  supabase: any,
  resend: any
) {
  try {
    const { data: student } = await supabase
      .from('student_profiles')
      .select('full_name, email')
      .eq('id', packagePayment.student_id)
      .single();

    const { data: teacher } = await supabase
      .from('teacher_profiles')
      .select('full_name, email')
      .eq('id', packagePayment.teacher_id)
      .single();

    if (!student || !teacher) return;

    const reasonLabel = CHANGE_REASONS.cancel.find(r => r.value === reasonCategory)?.label || reasonCategory;

    // Öğrenciye e-posta
    await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: student.email,
      subject: '📋 Paket İptali Onayı',
      html: `
        <h2>Paket İptali</h2>
        <p>Merhaba ${student.full_name},</p>
        <p><strong>${packagePayment.campaign_name}</strong> paketiniz iptal edildi.</p>
        <ul>
          <li>Toplam Ders: ${packagePayment.total_lessons}</li>
          <li>Tamamlanan: ${refundCalc.completedLessons}</li>
          <li>İptal Edilen: ${refundCalc.remainingLessons}</li>
        </ul>
        ${refundCalc.netRefund > 0 ? `
          <p><strong>İade Tutarı:</strong> ${refundCalc.netRefund.toLocaleString('tr-TR')} TL</p>
          <p>İade işlemi 5-10 iş günü içinde hesabınıza yansıyacaktır.</p>
        ` : `
          <p>Yapılan ders sayısı nedeniyle iade tutarı bulunmamaktadır.</p>
        `}
        <p><strong>İptal Sebebi:</strong> ${reasonLabel}${reasonText ? ` - ${reasonText}` : ''}</p>
      `,
    });

    // Öğretmene e-posta
    await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: teacher.email,
      subject: '📋 Paket İptali Bildirimi',
      html: `
        <h2>Paket İptali</h2>
        <p>Merhaba ${teacher.full_name},</p>
        <p>${student.full_name} öğrenciniz <strong>${packagePayment.campaign_name}</strong> paketini iptal etti.</p>
        <ul>
          <li>Toplam Ders: ${packagePayment.total_lessons}</li>
          <li>Tamamlanan: ${refundCalc.completedLessons}</li>
          <li>İptal Edilen: ${refundCalc.remainingLessons}</li>
        </ul>
        <p><strong>İptal Sebebi:</strong> ${reasonLabel}${reasonText ? ` - ${reasonText}` : ''}</p>
        <p>Tamamlanan dersler için kazancınız etkilenmez.</p>
      `,
    });

    // Admin'e bildir (önemli işlem)
    // TODO: Admin e-posta adresi eklenebilir

  } catch (error) {
    console.error('Cancellation email error:', error);
  }
}
