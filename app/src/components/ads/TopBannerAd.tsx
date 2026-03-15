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
          publisherId={adsConfig.publisherId}
        />
      </div>
    </div>
  );
}
