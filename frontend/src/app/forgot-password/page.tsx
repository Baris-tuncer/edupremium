'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      // Dinamik URL: Canlıda visserr.com, lokalde localhost
      const redirectUrl = `${window.location.origin}/update-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) throw error

      setMessage('Sifre sifirlama baglantisi e-postaniza gonderildi. Lutfen kontrol edin.')
    } catch (err: any) {
      setError('Bir hata olustu. Lutfen tekrar deneyin.')
      console.error('Reset password error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-serif">
            Sifre Sifirlama
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            E-posta adresinizi girin, size sifirlama baglantisi gonderelim.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          {message && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm text-center border border-green-200">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email-address" className="sr-only">
              E-posta Adresi
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Gonderiliyor...' : 'Sifre Sifirlama Baglantisi Gonder'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
              Giris sayfasina don
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
