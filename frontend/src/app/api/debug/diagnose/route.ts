import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic' // Onbelleklemeyi kapat

export async function GET() {
  const report: any = {
    checks: {},
    resend_domains: [],
    test_email: {}
  }

  try {
    // 1. CEVRE DEGISKENLERI KONTROLU (Environment Variables)
    report.checks.env_vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'OK' : 'MISSING',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'Not Set (Using Fallback)'
    }

    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY Eksik!')

    const resend = new Resend(process.env.RESEND_API_KEY)

    // 2. RESEND DOMAIN SORGUSU (En Kritik Yer)
    // Resend'de kayitli ve dogrulanmis domainleri listeler.
    try {
      const domains = await resend.domains.list()
      report.resend_domains = domains.data || []
    } catch (e: any) {
      report.resend_domains = { error: e.message }
    }

    // 3. SUPABASE LINK TESTI
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing',
      { auth: { persistSession: false } }
    )

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: 'test@visserr.com',
      options: { redirectTo: 'https://www.visserr.com' }
    })

    report.checks.supabase_link = linkError ? 'ERROR: ' + linkError.message : 'OK (Link Generated)'

    // 4. TEST MAILI GONDERIMI
    // Varsa ilk dogrulanmis domaini kullan, yoksa hata ver.
    const verifiedDomain = Array.isArray(report.resend_domains)
      ? report.resend_domains.find((d: any) => d.status === 'verified')?.name
      : null

    if (verifiedDomain) {
      const { data, error } = await resend.emails.send({
        from: 'Diagnostic Test <info@' + verifiedDomain + '>',
        to: ['info@visserr.com'], // Kendi mailine gonder
        subject: 'Diagnostic Test Mail',
        html: '<p>System check running...</p>'
      })
      report.test_email = error ? { status: 'FAILED', error: error.message, name: error.name } : { status: 'SUCCESS', id: data?.id }
    } else {
      report.test_email = { status: 'SKIPPED', reason: 'No verified domain found in Resend Account' }
    }

    return NextResponse.json(report, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ CRITICAL_FAILURE: error.message, stack: error.stack }, { status: 500 })
  }
}
