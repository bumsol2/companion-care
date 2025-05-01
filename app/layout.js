import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '../lib/utils';
import Topbar from '../components/layouts/Topbar';
import PWARegister from './pwa-register';
import { Providers } from './providers';

// Note: Pretendard is not available in Google Fonts, so we would need to import it separately
// For this example, we'll use Inter for both English and Korean
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Next.js 14에서는 themeColor와 viewport를 별도로 export해야 함
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const themeColor = '#A7D7A7';

export const metadata = {
  title: 'Companion Care',
  description: '반려식물과 반려동물을 위한 케어 알림 서비스',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Companion Care',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#A7D7A7" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Companion Care" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.variable
      )}>
        <Providers>
          <PWARegister />
          <Topbar />
          <main className="container py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
