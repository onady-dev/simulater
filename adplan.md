# 광고 수익화 구현 계획서 (Ad Implementation Plan)

## 프로젝트 개요

**프로젝트명**: 집 살까? 전세 살까? (부동산 계산기)  
**기술 스택**: Next.js 14 (Static Export), React 18, TypeScript, Tailwind CSS  
**배포 환경**: AWS S3 + CloudFront (정적 호스팅)  
**현재 상태**: 완전한 정적 사이트 (output: 'export')

## 1. 광고 전략 개요

### 1.1 단계별 접근 방식

**Phase 1: Google AdSense (즉시 시작 가능)**
- 진입 장벽: 최소 트래픽 요구사항 없음
- 예상 수익: 월 10,000 페이지뷰 기준 $20-50
- 구현 난이도: 낮음 (JavaScript 삽입만 필요)

**Phase 2: 트래픽 증가 후 프리미엄 네트워크**
- Mediavine Journey (월 10,000 세션 이하)
- Ezoic Incubator (월 250,000 활성 사용자 미만)
- Mediavine (월 50,000 세션 이상)

### 1.2 광고 배치 전략

**모바일 우선 설계** (현재 코드베이스가 모바일 중심)
- 상단 배너 (TopBar 하단)
- 콘텐츠 중간 (입력 섹션과 결과 섹션 사이)
- 하단 고정 배너 (Sticky Bottom)
- 사이드바 (데스크톱 전용)

**사용자 경험 우선**
- 과도한 광고 지양
- 페이지 로딩 속도 유지
- 콘텐츠 가독성 보장

## 2. Google AdSense 구현

### 2.1 계정 설정 및 승인 프로세스

**1단계: AdSense 계정 생성**
```
1. https://www.google.com/adsense 방문
2. Google 계정으로 로그인
3. 사이트 URL 입력 (예: https://your-domain.com)
4. 계정 정보 입력 (이름, 주소, 전화번호)
5. 이용약관 동의
```

**2단계: 사이트 승인 대기**
- 승인 기간: 수일 ~ 수주
- 승인 기준: 고품질 콘텐츠, 정책 준수, 충분한 콘텐츠량
- 거부 시: 콘텐츠 개선 후 재신청

**3단계: 광고 단위 생성**
```
1. AdSense 대시보드 → 광고 → 광고 단위별
2. 디스플레이 광고 선택
3. 광고 단위 이름 지정
4. 광고 크기 선택 (반응형 권장)
5. 광고 코드 복사
```

### 2.2 코드 구현

#### 2.2.1 AdSense Script 컴포넌트

**파일 생성**: `app/src/components/ads/AdSenseScript.tsx`

```typescript
'use client';

import { useEffect } from 'react';

interface AdSenseScriptProps {
  publisherId: string; // ca-pub-XXXXXXXXXX
}

export function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  useEffect(() => {
    // 이미 로드된 경우 중복 방지
    if (document.querySelector(`script[data-ad-client="${publisherId}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-ad-client', publisherId);
    
    document.head.appendChild(script);

    return () => {
      // Cleanup (필요시)
      const existingScript = document.querySelector(
        `script[data-ad-client="${publisherId}"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [publisherId]);

  return null;
}
```

#### 2.2.2 광고 단위 컴포넌트

**파일 생성**: `app/src/components/ads/AdUnit.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  adSlot: string; // 광고 슬롯 ID
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

export function AdUnit({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = '',
  fullWidthResponsive = true,
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    // 광고 차단기 감지 및 광고 푸시
    try {
      if (adRef.current && !isAdPushed.current) {
        // @ts-ignore - adsbygoogle는 전역 객체
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdPushed.current = true;
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={adStyle}
      data-ad-client="ca-pub-XXXXXXXXXX" // 실제 Publisher ID로 교체
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}
```

#### 2.2.3 특정 위치별 광고 컴포넌트

**파일 생성**: `app/src/components/ads/TopBannerAd.tsx`

```typescript
import { AdUnit } from './AdUnit';

export function TopBannerAd() {
  return (
    <div className="w-full bg-gray-100 py-2 px-4">
      <div className="max-w-screen-lg mx-auto">
        <AdUnit
          adSlot="1234567890" // 실제 슬롯 ID로 교체
          adFormat="horizontal"
          adStyle={{ display: 'block', minHeight: '90px' }}
          className="text-center"
        />
      </div>
    </div>
  );
}
```

**파일 생성**: `app/src/components/ads/InContentAd.tsx`

```typescript
import { AdUnit } from './AdUnit';

export function InContentAd() {
  return (
    <div className="w-full py-4 px-4">
      <div className="max-w-screen-lg mx-auto bg-white rounded-lg shadow-sm p-4">
        <p className="text-xs text-gray-400 text-center mb-2">광고</p>
        <AdUnit
          adSlot="0987654321" // 실제 슬롯 ID로 교체
          adFormat="auto"
          adStyle={{ display: 'block', minHeight: '250px' }}
        />
      </div>
    </div>
  );
}
```

**파일 생성**: `app/src/components/ads/StickyBottomAd.tsx`

```typescript
'use client';

import { useState } from 'react';
import { AdUnit } from './AdUnit';

export function StickyBottomAd() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-bottom">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
        aria-label="광고 닫기"
      >
        ✕
      </button>
      <div className="px-4 py-2">
        <AdUnit
          adSlot="1122334455" // 실제 슬롯 ID로 교체
          adFormat="horizontal"
          adStyle={{ display: 'block', minHeight: '50px', maxHeight: '100px' }}
        />
      </div>
    </div>
  );
}
```

**파일 생성**: `app/src/components/ads/SidebarAd.tsx`

```typescript
import { AdUnit } from './AdUnit';

export function SidebarAd() {
  return (
    <div className="hidden lg:block sticky top-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-xs text-gray-400 text-center mb-2">광고</p>
        <AdUnit
          adSlot="5544332211" // 실제 슬롯 ID로 교체
          adFormat="vertical"
          adStyle={{ display: 'block', width: '300px', height: '600px' }}
        />
      </div>
    </div>
  );
}
```

### 2.3 Layout 통합

**파일 수정**: `app/src/app/layout.tsx`

```typescript
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AdSenseScript } from '@/components/ads/AdSenseScript';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: '집 살까? 전세 살까?',
  description: '매수 vs 전세 vs 월세 — 어떤 선택이 유리한지 계산해보세요',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3182F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense Script */}
        <AdSenseScript publisherId="ca-pub-XXXXXXXXXX" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

### 2.4 Calculator Page 통합

**파일 수정**: `app/src/app/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { TopBar } from '@/components/layout/TopBar';
import { PriceStepCard } from '@/components/inputs/PriceStepCard';
import { PeriodStepCard } from '@/components/inputs/PeriodStepCard';
import { AutoRecommendation } from '@/components/results/AutoRecommendation';
import { AssetProjectionChart } from '@/components/charts/AssetProjectionChart';
import { MonthlyCostSummary } from '@/components/results/MonthlyCostSummary';
import { TopBannerAd } from '@/components/ads/TopBannerAd';
import { InContentAd } from '@/components/ads/InContentAd';
import { StickyBottomAd } from '@/components/ads/StickyBottomAd';

export default function CalculatorPage() {
  const calculate = useCalculatorStore((s) => s.calculate);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      {/* 상단 배너 광고 */}
      <TopBannerAd />

      <main className="pb-10 pt-4">
        {/* 입력 섹션 */}
        <section className="px-4 space-y-3 mb-4">
          <PriceStepCard />
          <PeriodStepCard />
        </section>

        {/* 콘텐츠 중간 광고 */}
        <InContentAd />

        {/* 추천 결과 */}
        <AutoRecommendation />

        {/* 순자산 변화 차트 */}
        <div className="px-4 mb-4">
          <AssetProjectionChart />
        </div>

        {/* 예상 월 지출 비용 */}
        <MonthlyCostSummary />

        <p className="text-xs text-gray-400 text-center px-6 mt-4">
          ※ 공시가격은 시세의 70% 근사치 적용. 본 계산기는 참고용이며 법적 효력이 없습니다.
        </p>
      </main>

      {/* 하단 고정 광고 */}
      <StickyBottomAd />
    </div>
  );
}
```


## 3. 환경 변수 관리

### 3.1 환경 변수 파일 생성

**파일 생성**: `app/.env.local` (개발 환경)

```bash
# Google AdSense
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_TOP_BANNER_SLOT=1234567890
NEXT_PUBLIC_ADSENSE_IN_CONTENT_SLOT=0987654321
NEXT_PUBLIC_ADSENSE_STICKY_BOTTOM_SLOT=1122334455
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=5544332211

# Feature Flags
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ENABLE_STICKY_AD=true
```

**파일 생성**: `app/.env.production` (프로덕션 환경)

```bash
# Google AdSense (실제 승인된 ID로 교체)
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_TOP_BANNER_SLOT=1234567890
NEXT_PUBLIC_ADSENSE_IN_CONTENT_SLOT=0987654321
NEXT_PUBLIC_ADSENSE_STICKY_BOTTOM_SLOT=1122334455
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=5544332211

# Feature Flags
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ENABLE_STICKY_AD=true
```

### 3.2 환경 변수 타입 정의

**파일 생성**: `app/src/lib/config/ads.ts`

```typescript
export const adsConfig = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '',
  slots: {
    topBanner: process.env.NEXT_PUBLIC_ADSENSE_TOP_BANNER_SLOT || '',
    inContent: process.env.NEXT_PUBLIC_ADSENSE_IN_CONTENT_SLOT || '',
    stickyBottom: process.env.NEXT_PUBLIC_ADSENSE_STICKY_BOTTOM_SLOT || '',
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
  },
  enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
  stickyEnabled: process.env.NEXT_PUBLIC_ENABLE_STICKY_AD === 'true',
};

export const isAdsEnabled = () => {
  return adsConfig.enabled && adsConfig.publisherId !== '';
};
```

### 3.3 컴포넌트 업데이트 (환경 변수 사용)

**파일 수정**: `app/src/components/ads/AdSenseScript.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { adsConfig } from '@/lib/config/ads';

export function AdSenseScript() {
  const publisherId = adsConfig.publisherId;

  useEffect(() => {
    if (!publisherId) {
      console.warn('AdSense Publisher ID not configured');
      return;
    }

    if (document.querySelector(`script[data-ad-client="${publisherId}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-ad-client', publisherId);
    
    document.head.appendChild(script);
  }, [publisherId]);

  return null;
}
```

**파일 수정**: `app/src/components/ads/TopBannerAd.tsx`

```typescript
import { AdUnit } from './AdUnit';
import { adsConfig, isAdsEnabled } from '@/lib/config/ads';

export function TopBannerAd() {
  if (!isAdsEnabled()) return null;

  return (
    <div className="w-full bg-gray-100 py-2 px-4">
      <div className="max-w-screen-lg mx-auto">
        <AdUnit
          adSlot={adsConfig.slots.topBanner}
          adFormat="horizontal"
          adStyle={{ display: 'block', minHeight: '90px' }}
          className="text-center"
        />
      </div>
    </div>
  );
}
```

## 4. 광고 차단기 대응

### 4.1 광고 차단 감지 컴포넌트

**파일 생성**: `app/src/components/ads/AdBlockDetector.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

export function AdBlockDetector() {
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // 광고 차단기 감지
    const detectAdBlock = async () => {
      try {
        // 가짜 광고 요청으로 차단 여부 확인
        const response = await fetch(
          'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
          { method: 'HEAD', mode: 'no-cors' }
        );
        setIsAdBlocked(false);
      } catch (error) {
        setIsAdBlocked(true);
        // 3초 후 메시지 표시 (즉시 표시하면 UX 저해)
        setTimeout(() => setShowMessage(true), 3000);
      }
    };

    detectAdBlock();
  }, []);

  if (!isAdBlocked || !showMessage) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-40">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">ℹ️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900 mb-1">
            광고 차단기가 감지되었습니다
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            이 서비스는 광고 수익으로 운영됩니다. 광고를 허용해주시면 더 나은 서비스를 제공할 수 있습니다.
          </p>
          <button
            onClick={() => setShowMessage(false)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4.2 Calculator Page에 통합

```typescript
import { AdBlockDetector } from '@/components/ads/AdBlockDetector';

// ... 기존 코드 ...

return (
  <div className="min-h-screen bg-gray-50">
    {/* ... 기존 코드 ... */}
    
    {/* 광고 차단기 감지 */}
    <AdBlockDetector />
  </div>
);
```

## 5. 성능 최적화

### 5.1 광고 지연 로딩

**파일 생성**: `app/src/components/ads/LazyAdUnit.tsx`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { AdUnit } from './AdUnit';

interface LazyAdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
  threshold?: number; // Intersection Observer threshold
}

export function LazyAdUnit({
  adSlot,
  adFormat = 'auto',
  adStyle,
  className,
  threshold = 0.1,
}: LazyAdUnitProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <AdUnit
          adSlot={adSlot}
          adFormat={adFormat}
          adStyle={adStyle}
          className={className}
        />
      ) : (
        <div style={{ ...adStyle, background: '#f3f4f6' }} className={className} />
      )}
    </div>
  );
}
```

### 5.2 광고 스크립트 최적화

**파일 수정**: `app/src/components/ads/AdSenseScript.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { adsConfig } from '@/lib/config/ads';

export function AdSenseScript() {
  const publisherId = adsConfig.publisherId;

  useEffect(() => {
    if (!publisherId) return;
    if (document.querySelector(`script[data-ad-client="${publisherId}"]`)) return;

    // requestIdleCallback으로 광고 스크립트 로딩 지연
    const loadAds = () => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', publisherId);
      document.head.appendChild(script);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadAds, { timeout: 2000 });
    } else {
      setTimeout(loadAds, 1000);
    }
  }, [publisherId]);

  return null;
}
```

## 6. 개인정보 보호 및 법적 준수

### 6.1 쿠키 동의 배너

**파일 생성**: `app/src/components/legal/CookieConsent.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 safe-bottom">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm mb-1">
              이 웹사이트는 쿠키를 사용하여 사용자 경험을 개선하고 광고를 제공합니다.
            </p>
            <a
              href="/privacy"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              개인정보 처리방침 보기
            </a>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800"
            >
              거부
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700"
            >
              동의
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6.2 개인정보 처리방침 페이지

**파일 생성**: `app/src/app/privacy/page.tsx`

```typescript
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. 수집하는 정보</h2>
          <p className="text-gray-700 mb-2">
            본 웹사이트는 다음과 같은 정보를 수집할 수 있습니다:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>쿠키 및 유사 기술을 통한 사용 정보</li>
            <li>Google AdSense를 통한 광고 관련 정보</li>
            <li>Google Analytics를 통한 웹사이트 사용 통계</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. 정보 사용 목적</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>웹사이트 기능 제공 및 개선</li>
            <li>맞춤형 광고 제공</li>
            <li>사용자 경험 분석 및 최적화</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. 제3자 서비스</h2>
          <p className="text-gray-700 mb-2">
            본 웹사이트는 다음 제3자 서비스를 사용합니다:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>
              <strong>Google AdSense</strong>: 광고 제공
              <br />
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-600 hover:underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 개인정보 처리방침
              </a>
            </li>
            <li>
              <strong>Google Analytics</strong>: 웹사이트 분석
              <br />
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-600 hover:underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 개인정보 처리방침
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. 쿠키 관리</h2>
          <p className="text-gray-700">
            브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다. 
            단, 쿠키를 차단하면 일부 기능이 제한될 수 있습니다.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. 문의</h2>
          <p className="text-gray-700">
            개인정보 처리방침에 대한 문의사항이 있으시면 
            [이메일 주소]로 연락주시기 바랍니다.
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          최종 업데이트: 2026년 3월 13일
        </p>
      </div>
    </div>
  );
}
```

## 7. Google Analytics 통합

### 7.1 GA4 설정

**파일 생성**: `app/src/components/analytics/GoogleAnalytics.tsx`

```typescript
'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string; // G-XXXXXXXXXX
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
```

### 7.2 환경 변수 추가

**파일 수정**: `app/.env.local`

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 7.3 Layout 통합

**파일 수정**: `app/src/app/layout.tsx`

```typescript
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

// ... 기존 코드 ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <AdSenseScript />
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
```


## 8. 배포 및 테스트

### 8.1 빌드 및 배포 프로세스

**1단계: 로컬 테스트**

```bash
# 개발 서버 실행
cd app
npm run dev

# 브라우저에서 http://localhost:9999 접속
# 광고 영역이 표시되는지 확인 (실제 광고는 승인 후 표시)
```

**2단계: 프로덕션 빌드**

```bash
# 정적 사이트 빌드
npm run build

# out 디렉토리 생성 확인
ls -la out/
```

**3단계: S3 업로드**

```bash
# AWS CLI 설치 및 설정 (이미 완료된 경우 생략)
aws configure

# S3 버킷에 업로드
aws s3 sync out/ s3://your-bucket-name/ --delete

# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

**4단계: AdSense 사이트 승인 신청**

```
1. AdSense 대시보드 접속
2. 사이트 → 사이트 추가
3. 배포된 도메인 입력 (예: https://your-domain.com)
4. 승인 대기 (수일~수주)
```

### 8.2 테스트 체크리스트

**기능 테스트**
- [ ] 광고 스크립트가 정상적으로 로드되는가?
- [ ] 광고 영역이 올바른 위치에 표시되는가?
- [ ] 모바일/데스크톱에서 모두 정상 작동하는가?
- [ ] 광고 차단기 감지가 작동하는가?
- [ ] 쿠키 동의 배너가 표시되는가?

**성능 테스트**
- [ ] 페이지 로딩 속도가 3초 이내인가?
- [ ] Lighthouse 성능 점수가 80점 이상인가?
- [ ] 광고 로딩이 페이지 렌더링을 차단하지 않는가?

**정책 준수**
- [ ] 개인정보 처리방침 페이지가 있는가?
- [ ] 쿠키 동의 메커니즘이 작동하는가?
- [ ] AdSense 정책을 준수하는가? (클릭 유도 금지 등)

### 8.3 AdSense 승인 팁

**콘텐츠 품질**
- 최소 15-20개의 고품질 페이지 권장
- 각 페이지는 최소 300-500단어
- 독창적이고 가치 있는 콘텐츠

**기술적 요구사항**
- HTTPS 필수
- 모바일 친화적 디자인
- 빠른 로딩 속도
- 명확한 네비게이션

**정책 준수**
- 저작권 침해 콘텐츠 없음
- 성인 콘텐츠 없음
- 불법 콘텐츠 없음
- 명확한 개인정보 처리방침

## 9. 수익 모니터링 및 최적화

### 9.1 AdSense 대시보드 주요 지표

**일일 확인 지표**
- 페이지뷰 (Page Views)
- 노출수 (Impressions)
- 클릭수 (Clicks)
- CTR (Click-Through Rate)
- CPC (Cost Per Click)
- RPM (Revenue Per Mille)
- 예상 수익 (Estimated Earnings)

**최적화 목표**
- CTR: 1-3% (일반적 범위)
- RPM: $1-5 (초기 목표)
- 페이지 RPM 증가 추세

### 9.2 A/B 테스트 전략

**테스트 항목**
1. 광고 위치 (상단 vs 중간 vs 하단)
2. 광고 크기 (반응형 vs 고정 크기)
3. 광고 개수 (2개 vs 3개 vs 4개)
4. 광고 스타일 (텍스트 vs 디스플레이 vs 혼합)

**테스트 방법**
```typescript
// 파일 생성: app/src/lib/utils/abTest.ts

export function getABTestVariant(testName: string): 'A' | 'B' {
  const stored = localStorage.getItem(`ab-test-${testName}`);
  if (stored) return stored as 'A' | 'B';

  const variant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem(`ab-test-${testName}`, variant);
  return variant;
}

// 사용 예시
const adVariant = getABTestVariant('ad-position');
if (adVariant === 'A') {
  // 상단 광고 표시
} else {
  // 중간 광고 표시
}
```

### 9.3 수익 최적화 체크리스트

**단기 최적화 (1-3개월)**
- [ ] 광고 배치 A/B 테스트
- [ ] 광고 크기 최적화
- [ ] 광고 차단기 대응 강화
- [ ] 페이지 로딩 속도 개선

**중기 최적화 (3-6개월)**
- [ ] 트래픽 증가 전략 (SEO, 콘텐츠 마케팅)
- [ ] 고CPM 니치 콘텐츠 추가
- [ ] 사용자 참여도 향상 (체류 시간 증가)
- [ ] 모바일 경험 최적화

**장기 최적화 (6개월 이상)**
- [ ] 프리미엄 광고 네트워크 전환 (Mediavine, Ezoic)
- [ ] Header Bidding 도입 검토
- [ ] 다각화된 수익 모델 (제휴 마케팅, 스폰서십)

## 10. 트러블슈팅

### 10.1 일반적인 문제 및 해결책

**문제 1: 광고가 표시되지 않음**

원인:
- AdSense 승인 대기 중
- 광고 차단기 사용
- 광고 코드 오류
- 정책 위반

해결책:
```typescript
// 디버깅 코드 추가
useEffect(() => {
  console.log('AdSense Publisher ID:', adsConfig.publisherId);
  console.log('Ad Slot:', adSlot);
  console.log('adsbygoogle array:', window.adsbygoogle);
}, []);
```

**문제 2: 광고 로딩이 느림**

해결책:
- LazyAdUnit 사용 (Intersection Observer)
- requestIdleCallback으로 스크립트 지연 로딩
- 광고 개수 줄이기

**문제 3: 모바일에서 레이아웃 깨짐**

해결책:
```css
/* globals.css에 추가 */
.adsbygoogle {
  max-width: 100%;
  overflow: hidden;
}
```

**문제 4: AdSense 정책 위반 경고**

일반적인 위반 사항:
- 클릭 유도 문구 ("광고를 클릭해주세요")
- 광고와 콘텐츠 구분 불명확
- 과도한 광고 밀도
- 부적절한 콘텐츠

해결책:
- 정책 검토 및 수정
- 광고 개수 줄이기
- 명확한 "광고" 라벨 추가

### 10.2 성능 문제 해결

**Lighthouse 점수 개선**

```typescript
// 파일 수정: app/src/components/ads/AdSenseScript.tsx

export function AdSenseScript() {
  useEffect(() => {
    // 중요 콘텐츠 로딩 후 광고 스크립트 로드
    if (document.readyState === 'complete') {
      loadAdScript();
    } else {
      window.addEventListener('load', loadAdScript);
      return () => window.removeEventListener('load', loadAdScript);
    }
  }, []);

  const loadAdScript = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => insertScript(), { timeout: 2000 });
    } else {
      setTimeout(insertScript, 1000);
    }
  };

  // ... 나머지 코드
}
```

**Core Web Vitals 최적화**

```typescript
// 파일 생성: app/src/lib/utils/webVitals.ts

export function reportWebVitals(metric: any) {
  // Google Analytics로 전송
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}
```

## 11. 프리미엄 네트워크 전환 준비

### 11.1 Mediavine 준비 체크리스트

**트래픽 요구사항**
- [ ] 월 50,000 세션 달성 (또는 Mediavine Journey: 10,000 세션 이하)
- [ ] Google Analytics 설치 및 30일 데이터 수집
- [ ] 트래픽이 유기적이고 지속 가능한가?

**콘텐츠 요구사항**
- [ ] 독창적이고 고품질 콘텐츠
- [ ] 긴 형식의 콘텐츠 (최소 300단어)
- [ ] 정기적인 콘텐츠 업데이트

**기술적 요구사항**
- [ ] Google AdSense 정상 운영 중
- [ ] HTTPS 적용
- [ ] 모바일 최적화
- [ ] 빠른 로딩 속도

**신청 프로세스**
1. https://www.mediavine.com/apply 방문
2. 신청서 작성 (사이트 URL, Google Analytics 연동)
3. 승인 대기 (약 2주)
4. 승인 시 Mediavine 스크립트로 교체

### 11.2 Ezoic 준비 체크리스트

**트래픽 요구사항**
- [ ] 월 250,000+ 활성 사용자 (메인 프로그램)
- [ ] 또는 Incubator 프로그램 신청 (트래픽 미달 시)

**신청 프로세스**
1. https://www.ezoic.com 방문
2. 계정 생성 및 사이트 추가
3. Ezoic 스크립트 통합 (DNS 또는 CloudFlare 연동)
4. AI 학습 기간 (수주)

### 11.3 전환 시 코드 수정

**Mediavine 전환 예시**

```typescript
// 파일 수정: app/src/components/ads/AdSenseScript.tsx
// → app/src/components/ads/MediavineScript.tsx

'use client';

import Script from 'next/script';

export function MediavineScript() {
  return (
    <Script
      id="mediavine-script"
      src="https://scripts.mediavine.com/tags/your-site-id.js"
      strategy="afterInteractive"
      data-noptimize="1"
    />
  );
}
```

**Ezoic 전환 예시**

```typescript
// Ezoic는 일반적으로 DNS 또는 CloudFlare 통합 사용
// 또는 직접 스크립트 삽입

export function EzoicScript() {
  return (
    <Script
      id="ezoic-script"
      src="//go.ezoic.net/ezoic/ezoic.js"
      strategy="afterInteractive"
    />
  );
}
```

## 12. 예상 수익 시뮬레이션

### 12.1 시나리오별 수익 예측

**시나리오 A: AdSense (보수적)**
- 월 10,000 페이지뷰
- CPM: $2
- 광고 차단률: 30%
- 예상 수익: 10,000 × 0.7 × ($2 / 1,000) = **$14/월**

**시나리오 B: AdSense (중간)**
- 월 50,000 페이지뷰
- CPM: $3.5
- 광고 차단률: 30%
- 예상 수익: 50,000 × 0.7 × ($3.5 / 1,000) = **$122.5/월**

**시나리오 C: AdSense (낙관적)**
- 월 100,000 페이지뷰
- CPM: $5
- 광고 차단률: 25%
- 예상 수익: 100,000 × 0.75 × ($5 / 1,000) = **$375/월**

**시나리오 D: Mediavine (프리미엄)**
- 월 100,000 페이지뷰
- CPM: $20
- 광고 차단률: 25%
- 예상 수익: 100,000 × 0.75 × ($20 / 1,000) = **$1,500/월**

### 12.2 수익 계산기 컴포넌트 (선택 사항)

**파일 생성**: `app/src/components/admin/RevenueCalculator.tsx`

```typescript
'use client';

import { useState } from 'react';

export function RevenueCalculator() {
  const [pageViews, setPageViews] = useState(10000);
  const [cpm, setCpm] = useState(3);
  const [adBlockRate, setAdBlockRate] = useState(30);

  const effectivePageViews = pageViews * (1 - adBlockRate / 100);
  const estimatedRevenue = (effectivePageViews * cpm) / 1000;

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">광고 수익 계산기</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            월 페이지뷰: {pageViews.toLocaleString()}
          </label>
          <input
            type="range"
            min="1000"
            max="500000"
            step="1000"
            value={pageViews}
            onChange={(e) => setPageViews(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            CPM: ${cpm}
          </label>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={cpm}
            onChange={(e) => setCpm(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            광고 차단률: {adBlockRate}%
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={adBlockRate}
            onChange={(e) => setAdBlockRate(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600 mb-1">
            유효 페이지뷰: {effectivePageViews.toLocaleString()}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            예상 수익: ${estimatedRevenue.toFixed(2)}/월
          </div>
          <div className="text-sm text-gray-500 mt-1">
            연간: ${(estimatedRevenue * 12).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 13. 실행 타임라인

### Week 1: 기본 구현
- [ ] AdSense 계정 생성
- [x] 광고 컴포넌트 개발 (AdUnit, TopBannerAd 등)
- [x] Layout 통합
- [ ] 로컬 테스트

### Week 2: 법적 준수 및 최적화
- [x] 쿠키 동의 배너 구현
- [x] 개인정보 처리방침 페이지 작성
- [x] Google Analytics 통합
- [x] 광고 차단기 감지 구현

### Week 3: 배포 및 승인 신청
- [x] 프로덕션 빌드
- [ ] S3/CloudFront 배포
- [ ] AdSense 사이트 승인 신청
- [ ] 승인 대기

### Week 4-8: 모니터링 및 최적화
- [ ] 일일 수익 모니터링
- [ ] A/B 테스트 실행
- [ ] 광고 배치 최적화
- [ ] 성능 개선

### Month 3-6: 트래픽 증가 및 프리미엄 전환 준비
- [ ] SEO 최적화
- [ ] 콘텐츠 마케팅
- [ ] 트래픽 목표 달성
- [ ] Mediavine/Ezoic 신청

## 14. 참고 자료

### 공식 문서
- [Google AdSense 고객센터](https://support.google.com/adsense)
- [AdSense 정책](https://support.google.com/adsense/answer/48182)
- [Mediavine 요구사항](https://www.mediavine.com/requirements)
- [Ezoic 시작 가이드](https://support.ezoic.com/kb/getting-started)

### 유용한 도구
- [Google Analytics](https://analytics.google.com)
- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [AdSense 수익 계산기](https://www.chartatlas.com/calculators/adsense-earnings)

### 커뮤니티
- [r/Adsense (Reddit)](https://www.reddit.com/r/Adsense/)
- [Mediavine Facebook Group](https://www.facebook.com/groups/mediavine/)

---

## 요약

이 계획서는 Next.js 정적 사이트에 Google AdSense를 통합하는 완전한 가이드입니다.

**핵심 단계:**
1. AdSense 계정 생성 및 승인 신청
2. 광고 컴포넌트 개발 및 통합
3. 법적 준수 (쿠키 동의, 개인정보 처리방침)
4. 배포 및 모니터링
5. 최적화 및 프리미엄 네트워크 전환

**예상 타임라인:** 4-8주 (승인 기간 포함)

**예상 초기 수익:** 월 $20-100 (트래픽에 따라 변동)

**장기 목표:** 프리미엄 네트워크 전환으로 월 $1,000+ 수익

이 계획을 단계별로 실행하면 안정적인 광고 수익화를 달성할 수 있습니다.
