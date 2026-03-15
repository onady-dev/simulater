import { AdUnit } from './AdUnit';
import { adsConfig, isAdsEnabled } from '@/lib/config/ads';

export function SidebarAd() {
  if (!isAdsEnabled()) return null;

  return (
    <div className="hidden lg:block sticky top-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-xs text-gray-400 text-center mb-2">광고</p>
        <AdUnit
          adSlot={adsConfig.slots.sidebar}
          adFormat="vertical"
          adStyle={{ display: 'block', width: '300px', height: '600px' }}
          publisherId={adsConfig.publisherId}
        />
      </div>
    </div>
  );
}
