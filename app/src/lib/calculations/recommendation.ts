import type {
  CalculationResults,
  Recommendation,
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  ScenarioKey,
} from '@/types';
import { formatWon } from '@/lib/utils/format';
import { checkAffordability } from './breakeven';

export function generateRecommendation(
  results: CalculationResults,
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
): Recommendation {
  const buyAffordability = checkAffordability('buy', buyInputs, buyInputs.monthlySavings);
  const jeonseAffordability = checkAffordability('jeonse', jeonseInputs, jeonseInputs.monthlySavings);
  const rentAffordability = checkAffordability(
    'monthlyRent',
    monthlyRentInputs,
    monthlyRentInputs.monthlySavings,
  );

  const lastIdx = buyInputs.yearsToHold - 1;
  const finalAssets = results.assetProjectionSeries[lastIdx];

  const scenarios: Array<{ key: ScenarioKey; asset: number; affordable: boolean }> = [
    { key: 'buy', asset: finalAssets.buyNetAsset, affordable: buyAffordability.isAffordable },
    { key: 'jeonse', asset: finalAssets.jeonseNetAsset, affordable: jeonseAffordability.isAffordable },
    { key: 'monthlyRent', asset: finalAssets.monthlyRentNetAsset, affordable: rentAffordability.isAffordable },
  ];

  const affordableScenarios = scenarios.filter((s) => s.affordable);

  if (affordableScenarios.length === 0) {
    return {
      primary: 'jeonse',
      secondary: 'monthlyRent',
      reasoning: [
        '모든 시나리오가 월 지출 또는 초기 필요자금 조건을 만족하지 못합니다.',
        '저축 여력, 보유 자산, 가격, 대출 규모를 다시 조정해야 합니다.',
      ],
      warnings: ['현재 조건으로는 즉시 선택 가능한 시나리오가 없습니다.'],
    };
  }

  const sorted = affordableScenarios.sort((a, b) => b.asset - a.asset);
  const primary = sorted[0].key;
  const secondary = sorted.length > 1 ? sorted[1].key : primary;

  const assets: Record<ScenarioKey, number> = {
    buy: finalAssets.buyNetAsset,
    jeonse: finalAssets.jeonseNetAsset,
    monthlyRent: finalAssets.monthlyRentNetAsset,
  };

  const reasoning: string[] = [];
  const warnings: string[] = [];
  let leverageAdvice: string | undefined;

  const assetDiff = assets[primary] - assets[secondary];
  reasoning.push(`${buyInputs.yearsToHold}년 후 순자산 차이가 ${formatWon(assetDiff)} 만큼 납니다`);

  if (primary === 'buy') {
    reasoning.push('레버리지 효과와 자산 상승분이 같이 반영됩니다');
    reasoning.push('주택 가격 상승과 남은 부채 감소가 동시에 작동합니다');
    leverageAdvice = 'LTV 60~70% 사용 권장';
    warnings.push('금리 변동 리스크를 함께 고려해야 합니다');
  } else if (primary === 'monthlyRent') {
    reasoning.push('유동성을 보존해 금융자산 투자 기회를 유지할 수 있습니다');
    reasoning.push('투자 수익으로 월세 부담을 일부 상쇄하는 구조입니다');
    warnings.push('가정한 투자수익률이 실제로 유지되는지 확인해야 합니다');
    warnings.push('월세 상승 가능성을 고려해 재계약 조건을 점검하세요');
  } else if (primary === 'jeonse') {
    reasoning.push('초기 자금 부담이 상대적으로 낮고 구조가 단순합니다');
    warnings.push('자산 증식 효과는 상대적으로 제한적입니다');
  }

  if (primary === 'jeonse' || secondary === 'jeonse') {
    warnings.push('전세는 기회비용이 크고 자산 증식 효과가 제한적일 수 있습니다');
  }

  const details = {
    buy: buyAffordability,
    jeonse: jeonseAffordability,
    monthlyRent: rentAffordability,
  } as const;
  const names = { buy: '매수', jeonse: '전세', monthlyRent: '월세' } as const;

  scenarios
    .filter((s) => !s.affordable)
    .forEach((s) => {
      const detail = details[s.key];
      const reasons: string[] = [];
      if (!detail.hasEnoughMonthlyCash) reasons.push('월 지출 초과');
      if (!detail.hasEnoughUpfrontCash) reasons.push('초기 자금 부족');
      warnings.push(`⚠️ ${names[s.key]}는 ${reasons.join(', ')} 상태입니다.`);
    });

  return { primary, secondary, reasoning, warnings, leverageAdvice };
}
