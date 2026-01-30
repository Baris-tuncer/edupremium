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
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://edupremium.com',
    siteName: 'EduPremium',
    title: 'EduPremium - Premium Özel Ders Platformu',
    description: 'Türkiye\'nin en seçkin özel ders platformu. Alanında uzman öğretmenlerle birebir online eğitim deneyimi.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduPremium - Premium Özel Ders Platformu',
    description: 'Türkiye\'nin en seçkin özel ders platformu.',
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
