import { LazyAdUnit } from './LazyAdUnit';
import { adsConfig, isAdsEnabled } from '@/lib/config/ads';

export function InContentAd() {
  if (!isAdsEnabled()) return null;

  return (
    <div className="w-full py-4 px-4">
      <div className="max-w-screen-lg mx-auto bg-white rounded-lg shadow-sm p-4">
        <p className="text-xs text-gray-400 text-center mb-2">광고</p>
        <LazyAdUnit
          adSlot={adsConfig.slots.inContent}
          adFormat="auto"
          adStyle={{ display: 'block', minHeight: '250px' }}
          publisherId={adsConfig.publisherId}
        />
      </div>
    </div>
  );
}
