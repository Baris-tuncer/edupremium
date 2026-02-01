import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('Featured Callback Data:', JSON.stringify(data));

    const responseCode = data.responseCode;
    const merchantPaymentId = data.merchantPaymentId;

    if (responseCode === '00') {
      // Ödeme başarılı - featured_payments kaydını bul
      const { data: payment, error: fetchError } = await supabase
        .from('featured_payments')
        .select('*')
        .eq('paratika_payment_id', merchantPaymentId)
        .single();

      console.log('Featured Payment:', payment, 'Error:', fetchError);

      if (payment) {
        const now = new Date();
        const endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 gün

        // featured_payments güncelle
        await supabase
          .from('featured_payments')
          .update({
            payment_status: 'completed',
            starts_at: now.toISOString(),
            ends_at: endsAt.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', payment.id);

        // teacher_profiles güncelle - öne çıkar
        await supabase
          .from('teacher_profiles')
          .update({
            is_featured: true,
            featured_until: endsAt.toISOString(),
            featured_category: payment.category,
            featured_headline: payment.headline,
          })
          .eq('id', payment.teacher_id);

        console.log('Teacher featured successfully:', payment.teacher_id);
      }

      return htmlRedirect(`${baseUrl}/teacher/one-cik?success=true`);
    } else {
      // Ödeme başarısız
      if (merchantPaymentId) {
        await supabase
          .from('featured_payments')
          .update({
            payment_status: 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('paratika_payment_id', merchantPaymentId);
      }

      return htmlRedirect(`${baseUrl}/teacher/one-cik?error=odeme_basarisiz`);
    }
  } catch (error: any) {
    console.error('Featured Callback Error:', error);
    return htmlRedirect(`${baseUrl}/teacher/one-cik?error=sistem_hatasi`);
  }
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.visserr.com';
  const searchParams = request.nextUrl.searchParams;
  const responseCode = searchParams.get('responseCode');

  if (responseCode === '00') {
    return htmlRedirect(`${baseUrl}/teacher/one-cik?success=true`);
  }
  return htmlRedirect(`${baseUrl}/teacher/one-cik?error=odeme_basarisiz`);
}