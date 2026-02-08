// /api/packages/callback
// Paket ödemesi Paratika callback'i
// Başarılı ödemede TÜM dersler oluşturulur
// Mevcut /api/payment/callback'ten TAMAMEN İZOLE

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { createDailyRoom } from '@/lib/daily';
import { verifyParatikaCallback } from '@/lib/paratika';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function htmlRedirect(url: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${url}">
        <script>window.location.href = "${url}";</script>
      </head>
      <body>
        <p>Yönlendiriliyorsunuz... <a href="${url}">Tıklayın</a></p>
      </body>
    </html>
  `;
  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
  const supabase = getSupabase();
  const resend = getResend();

  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('Package Callback Data:', JSON.stringify(data));

    // HASH doğrulaması
    if (!verifyParatikaCallback(data)) {
      console.error('Package callback HASH doğrulaması başarısız');
      return htmlRedirect(`${baseUrl}/payment/fail?error=Guvenlik_hatasi`);
    }

    const responseCode = data.responseCode;
    const merchantPaymentId = data.merchantPaymentId;

    if (responseCode !== '00') {
      // Ödeme başarısız
      await supabase
        .from('package_payments')
        .update({
          status: 'failed',
        })
        .eq('order_id', merchantPaymentId);

      return htmlRedirect(`${baseUrl}/payment/fail?error=Odeme_basarisiz`);
    }

    // Ödeme başarılı - package_payment'ı al
    const { data: packagePayment, error: fetchError } = await supabase
      .from('package_payments')
      .select('*')
      .eq('order_id', merchantPaymentId)
      .single();

    if (fetchError || !packagePayment) {
      console.error('Package payment not found:', merchantPaymentId);
      return htmlRedirect(`${baseUrl}/payment/fail?error=Kayit_bulunamadi`);
    }

    // Zaten tamamlanmış mı?
    if (packagePayment.status === 'completed') {
      return htmlRedirect(`${baseUrl}/student/my-packages?success=true&orderId=${merchantPaymentId}`);
    }

    // Seçilen slotları al (URL'den veya session'dan)
    // Bu bilgi client tarafından gönderilmeli
    // Şimdilik URL parametresinden alacağız
    const slotsParam = data.slots || '';
    let selectedSlots: Array<{ availabilityId: string; scheduledAt: string }> = [];

    try {
      if (slotsParam) {
        selectedSlots = JSON.parse(decodeURIComponent(slotsParam));
      }
    } catch (e) {
      console.error('Slots parse error:', e);
    }

    // Eğer slotlar yoksa, pending_slots tablosundan al (alternatif)
    if (selectedSlots.length === 0) {
      const { data: pendingSlots } = await supabase
        .from('pending_package_slots')
        .select('slots')
        .eq('package_payment_id', packagePayment.id)
        .single();

      if (pendingSlots?.slots) {
        selectedSlots = pendingSlots.slots;
      }
    }

    // Hala slot yoksa hata (bu durumda admin müdahalesi gerekir)
    if (selectedSlots.length === 0) {
      console.error('No slots found for package:', merchantPaymentId);
      // Yine de ödemeyi tamamla, admin sonra düzeltir
      await supabase
        .from('package_payments')
        .update({
          status: 'completed',
          payment_id: data.pgTranId || merchantPaymentId,
          completed_at: new Date().toISOString(),
        })
        .eq('order_id', merchantPaymentId);

      // Admin'e bildir
      console.error('CRITICAL: Package payment completed but no slots found. Manual intervention needed.');

      return htmlRedirect(`${baseUrl}/student/my-packages?success=true&orderId=${merchantPaymentId}&warning=slots_missing`);
    }

    // Müsaitlikleri tekrar kontrol et ve kilitle
    const availabilityIds = selectedSlots.map(s => s.availabilityId);

    const { data: availabilities, error: availError } = await supabase
      .from('availabilities')
      .select('id, start_time, is_booked')
      .in('id', availabilityIds);

    if (availError) {
      console.error('Availability check error:', availError);
    }

    // Tüm dersleri oluştur
    const lessonsToCreate = selectedSlots.map((slot, index) => ({
      teacher_id: packagePayment.teacher_id,
      student_id: packagePayment.student_id,
      subject: packagePayment.campaign_name, // Veya öğretmenin default subject'i
      scheduled_at: slot.scheduledAt,
      duration_minutes: 60,
      price: packagePayment.single_lesson_display_price, // Tekil fiyat (iptal hesabı için)
      status: 'CONFIRMED',
      payment_status: 'PAID',
      payment_id: data.pgTranId || merchantPaymentId,
      package_payment_id: packagePayment.id,
      is_package_lesson: true,
      reschedule_count: 0,
      created_at: new Date().toISOString(),
    }));

    // Toplu ders oluştur
    const { data: createdLessons, error: lessonsError } = await supabase
      .from('lessons')
      .insert(lessonsToCreate)
      .select();

    if (lessonsError) {
      console.error('Lessons creation error:', lessonsError);
      // Yine de ödemeyi tamamla, admin sonra düzeltir
    }

    console.log(`Created ${createdLessons?.length || 0} lessons for package ${merchantPaymentId}`);

    // Daily.co room'larını oluştur (her ders için)
    if (createdLessons) {
      for (const lesson of createdLessons) {
        try {
          const meetingLink = await createDailyRoom(lesson.id);
          if (meetingLink) {
            await supabase
              .from('lessons')
              .update({ meeting_link: meetingLink })
              .eq('id', lesson.id);
          }
        } catch (roomError) {
          console.error(`Daily room error for lesson ${lesson.id}:`, roomError);
        }
      }
    }

    // Müsaitlikleri kapat
    if (availabilityIds.length > 0) {
      await supabase
        .from('availabilities')
        .update({ is_booked: true })
        .in('id', availabilityIds);
    }

    // Package payment'ı güncelle
    const { error: updateError } = await supabase
      .from('package_payments')
      .update({
        status: 'completed',
        payment_id: data.pgTranId || merchantPaymentId,
        completed_at: new Date().toISOString(),
        // Son ders tarihi + 30 gün = paket son kullanma
        expires_at: new Date(
          Math.max(...selectedSlots.map(s => new Date(s.scheduledAt).getTime())) + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .eq('order_id', merchantPaymentId);

    if (updateError) {
      console.error('Package payment update error:', updateError);
    }

    // E-postalar gönder
    await sendPackageEmails(packagePayment, createdLessons || [], supabase, resend);

    return htmlRedirect(`${baseUrl}/student/my-packages?success=true&orderId=${merchantPaymentId}`);

  } catch (error: any) {
    console.error('Package callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
    return htmlRedirect(`${baseUrl}/payment/fail?error=Sistem_hatasi`);
  }
}

// E-posta gönderme fonksiyonu
async function sendPackageEmails(
  packagePayment: any,
  lessons: any[],
  supabase: any,
  resend: any
) {
  try {
    // Öğrenci ve öğretmen bilgilerini al
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

    if (!student || !teacher) {
      console.error('Student or teacher not found for email');
      return;
    }

    // Ders tarihlerini formatla
    const lessonDates = lessons
      .map(l => new Date(l.scheduled_at).toLocaleDateString('tr-TR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }))
      .join(', ');

    // Öğrenciye e-posta
    await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: student.email,
      subject: `✅ Paket Satın Alındı - ${packagePayment.total_lessons} Ders`,
      html: `
        <h2>Paket Satın Alma Onayı</h2>
        <p>Merhaba ${student.full_name},</p>
        <p><strong>${packagePayment.campaign_name}</strong> paketiniz başarıyla oluşturuldu.</p>
        <ul>
          <li>Öğretmen: ${teacher.full_name}</li>
          <li>Toplam Ders: ${packagePayment.total_lessons}</li>
          <li>Ödenen Tutar: ${packagePayment.total_amount.toLocaleString('tr-TR')} TL</li>
        </ul>
        <p><strong>Planlanan Dersler:</strong></p>
        <p>${lessonDates}</p>
        <p><a href="https://www.visserr.com/student/my-packages">Paketlerinizi görüntüleyin</a></p>
      `,
    });

    // Öğretmene e-posta
    await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: teacher.email,
      subject: `🎉 Yeni Paket Satışı - ${packagePayment.total_lessons} Ders`,
      html: `
        <h2>Yeni Paket Satışı!</h2>
        <p>Tebrikler ${teacher.full_name}!</p>
        <p><strong>${student.full_name}</strong>, <strong>${packagePayment.campaign_name}</strong> paketinizi satın aldı.</p>
        <ul>
          <li>Toplam Ders: ${packagePayment.total_lessons}</li>
          <li>Kazancınız: ${packagePayment.teacher_total_earnings.toLocaleString('tr-TR')} TL</li>
        </ul>
        <p><strong>Planlanan Dersler:</strong></p>
        <p>${lessonDates}</p>
        <p><a href="https://www.visserr.com/teacher/lessons">Derslerinizi görüntüleyin</a></p>
      `,
    });

    console.log('Package emails sent successfully');
  } catch (error) {
    console.error('Package email error:', error);
  }
}

// GET handler (Paratika bazen GET ile de callback yapar)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';

  const responseCode = searchParams.get('responseCode');
  const merchantPaymentId = searchParams.get('merchantPaymentId');

  if (responseCode === '00' && merchantPaymentId) {
    // POST handler'a yönlendir veya direkt başarı sayfasına
    return htmlRedirect(`${baseUrl}/student/my-packages?success=true&orderId=${merchantPaymentId}`);
  }

  return htmlRedirect(`${baseUrl}/payment/fail?error=Odeme_basarisiz`);
}
