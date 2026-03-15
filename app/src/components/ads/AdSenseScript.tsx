'use client';

import { useEffect } from 'react';
import { adsConfig } from '@/lib/config/ads';

export function AdSenseScript() {
  const publisherId = adsConfig.publisherId;

  useEffect(() => {
    if (!publisherId) return;
    if (document.querySelector(`script[data-ad-client="${publisherId}"]`)) return;

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
