'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { formatWon } from '@/lib/utils/format';

const LABELS: Record<string, string> = { buy: '매수', jeonse: '전세', monthlyRent: '월세' };
const ICONS: Record<string, string> = { buy: '🏠', jeonse: '🔑', monthlyRent: '📋' };

export function AutoRecommendation() {
  const recommendation = useCalculatorStore((s) => s.recommendation);
  const results = useCalculatorStore((s) => s.results);
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);

  if (!recommendation || !results) return null;

  const finalAssets = results.assetProjectionSeries[yearsToHold - 1];
  const assets = {
    buy: finalAssets?.buyNetAsset ?? 0,
    jeonse: finalAssets?.jeonseNetAsset ?? 0,
    monthlyRent: finalAssets?.monthlyRentNetAsset ?? 0,
  };
  const primaryAsset = assets[recommendation.primary as keyof typeof assets];
  const secondaryAsset = assets[recommendation.secondary as keyof typeof assets];
  const diff = primaryAsset - secondaryAsset;

  return (
    <div className="mx-4 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{ICONS[recommendation.primary]}</span>
        <div>
          <p className="text-xs opacity-80">{yearsToHold}년 후 순자산 기준</p>
          <p className="text-xl font-bold">{LABELS[recommendation.primary]}가 유리해요</p>
        </div>
      </div>

      {diff > 0 && (
        <div className="bg-white/20 rounded-2xl px-4 py-2.5">
          <p className="text-xs opacity-80">차선 대비 순자산 차이</p>
          <p className="text-lg font-bold">+{formatWon(diff)}</p>
        </div>
      )}
    </div>
  );
}
