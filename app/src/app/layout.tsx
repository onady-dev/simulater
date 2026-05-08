import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://klevx.com'),
  title: {
    default: 'KLEVX - 매수·전세·월세 주거비 비교',
    template: '%s | KLEVX',
  },
  description: '매수, 전세, 월세를 초기자금, 월 지출, 순자산 관점에서 비교하는 실거주자용 주거비 계산기와 가이드.',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KLEVX - 매수·전세·월세 주거비 비교',
    description: '실거주자를 위한 주거비 비교 계산기와 의사결정 가이드.',
    url: 'https://klevx.com',
    siteName: 'KLEVX',
    locale: 'ko_KR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3182F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
