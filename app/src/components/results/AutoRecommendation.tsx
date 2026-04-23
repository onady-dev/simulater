'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { formatWon } from '@/lib/utils/format';
import { checkAffordability } from '@/lib/calculations/breakeven';
import type { ScenarioKey } from '@/types';

const LABELS: Record<ScenarioKey, string> = {
  buy: '매수',
  jeonse: '전세',
  monthlyRent: '월세',
};

const ICONS: Record<ScenarioKey, string> = {
  buy: '🏠',
  jeonse: '🔐',
  monthlyRent: '💸',
};

export function AutoRecommendation() {
  const recommendation = useCalculatorStore((s) => s.recommendation);
  const results = useCalculatorStore((s) => s.results);
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);
  const buyInputs = useCalculatorStore((s) => s.buyInputs);
  const jeonseInputs = useCalculatorStore((s) => s.jeonseInputs);
  const monthlyRentInputs = useCalculatorStore((s) => s.monthlyRentInputs);

  if (!recommendation || !results) return null;

  const finalAssets = results.assetProjectionSeries[yearsToHold - 1];
  const assets: Record<ScenarioKey, number> = {
    buy: finalAssets?.buyNetAsset ?? 0,
    jeonse: finalAssets?.jeonseNetAsset ?? 0,
    monthlyRent: finalAssets?.monthlyRentNetAsset ?? 0,
  };
  const primaryAsset = assets[recommendation.primary];
  const secondaryAsset = assets[recommendation.secondary];
  const diff = primaryAsset - secondaryAsset;

  const affordability = {
    buy: checkAffordability('buy', buyInputs, buyInputs.monthlySavings),
    jeonse: checkAffordability('jeonse', jeonseInputs, jeonseInputs.monthlySavings),
    monthlyRent: checkAffordability(
      'monthlyRent',
      monthlyRentInputs,
      monthlyRentInputs.monthlySavings,
    ),
  };

  const rawTopScenario = (Object.entries(assets) as Array<[ScenarioKey, number]>)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  const rawTopIsDifferent = Boolean(rawTopScenario && rawTopScenario !== recommendation.primary);
  const rawTopIsUnaffordable = rawTopScenario
    ? !affordability[rawTopScenario].isAffordable
    : false;

  return (
    <div className="mx-4 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{ICONS[recommendation.primary]}</span>
        <div>
          <p className="text-xs opacity-80">{yearsToHold}년 기준, 조건 충족 시나리오 기준</p>
          <p className="text-xl font-bold">{LABELS[recommendation.primary]}가 유리해요</p>
        </div>
      </div>

      {diff > 0 && (
        <div className="bg-white/20 rounded-2xl px-4 py-2.5">
          <p className="text-xs opacity-80">차선 대비 순자산 차이</p>
          <p className="text-lg font-bold">+{formatWon(diff)}</p>
        </div>
      )}

      {rawTopIsDifferent && rawTopIsUnaffordable && rawTopScenario && (
        <p className="text-xs text-white/85 mt-3">
          그래프에서 가장 높아 보이는 {LABELS[rawTopScenario]}는 순자산은 더 크지만 월 지출
          또는 초기 자금 조건을 충족하지 못해 추천에서 제외됐습니다.
        </p>
      )}
    </div>
  );
}
