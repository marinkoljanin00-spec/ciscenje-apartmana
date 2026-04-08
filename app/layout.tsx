// TvojČistač - main layout - clean v3
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TvojČistač - Rezerviraj čišćenje u 30 sekundi',
  description: 'Rezerviraj profesionalno čišćenje apartmana i kuća. Brzo, pouzdano i transparentno. TvojČistač - tvoj dom, naša briga.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  openGraph: {
    title: 'TvojČistač - Rezerviraj čišćenje u 30 sekundi',
    description: 'Rezerviraj profesionalno čišćenje apartmana i kuća. Brzo, pouzdano i transparentno.',
    images: [{ url: '/logo.jpeg', width: 512, height: 512 }],
    type: 'website',
    locale: 'hr_HR',
  },
  twitter: {
    card: 'summary',
    title: 'TvojČistač - Rezerviraj čišćenje u 30 sekundi',
    description: 'Rezerviraj profesionalno čišćenje apartmana i kuća. Brzo, pouzdano i transparentno.',
    images: ['/logo.jpeg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TvojČistač',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hr">
      <head>
        <meta name="theme-color" content="#10b981" />
        <meta name="application-name" content="TvojČistač" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TvojČistač" />
        <link rel="manifest" href="/manifest.json" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HYX1QBVQLS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HYX1QBVQLS');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
