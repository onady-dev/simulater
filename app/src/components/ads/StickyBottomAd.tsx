'use client';

import { useState } from 'react';
import { AdUnit } from './AdUnit';
import { adsConfig, isAdsEnabled } from '@/lib/config/ads';

export function StickyBottomAd() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isAdsEnabled() || !adsConfig.stickyEnabled) return null;
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
        aria-label="광고 닫기"
      >
        ✕
      </button>
      <div className="px-4 py-2">
        <AdUnit
          adSlot={adsConfig.slots.stickyBottom}
          adFormat="horizontal"
          adStyle={{ display: 'block', minHeight: '50px', maxHeight: '100px' }}
          publisherId={adsConfig.publisherId}
        />
      </div>
    </div>
  );
}
