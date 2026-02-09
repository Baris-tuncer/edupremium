import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import SupportWidgets from '@/components/SupportWidgets';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'EduPremium - Premium Özel Ders Platformu',
    template: '%s | EduPremium',
  },
  description: 'Türkiye\'nin en seçkin özel ders platformu. Alanında uzman öğretmenlerle birebir online eğitim deneyimi.',
  keywords: ['özel ders', 'online eğitim', 'matematik dersi', 'YKS hazırlık', 'LGS hazırlık', 'birebir ders'],
  authors: [{ name: 'EduPremium' }],
  creator: 'EduPremium',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://visserr.com',
    siteName: 'EduPremium',
    title: 'EduPremium - Premium Özel Ders Platformu',
    description: 'Türkiye\'nin en seçkin özel ders platformu. Alanında uzman öğretmenlerle birebir online eğitim deneyimi.',
    images: [
      {
        url: '/logo-512.png',
        width: 512,
        height: 512,
        alt: 'EduPremium Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'EduPremium - Premium Özel Ders Platformu',
    description: 'Türkiye\'nin en seçkin özel ders platformu.',
    images: ['/logo-512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1a365d" />
      </head>
      <body className="antialiased">
        {children}
        <SupportWidgets />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a365d',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
