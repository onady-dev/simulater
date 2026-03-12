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
  monthlyRentInputs: MonthlyRentInputs
): Recommendation {
  // 월 지출 초과 확인
  const buyAffordability = checkAffordability('buy', buyInputs, buyInputs.monthlySavings);
  const jeonseAffordability = checkAffordability('jeonse', jeonseInputs, jeonseInputs.monthlySavings);
  const rentAffordability = checkAffordability('monthlyRent', monthlyRentInputs, monthlyRentInputs.monthlySavings);

  const lastIdx = buyInputs.yearsToHold - 1;
  const finalAssets = results.assetProjectionSeries[lastIdx];

  const scenarios: Array<{ key: ScenarioKey; asset: number; affordable: boolean }> = [
    { key: 'buy', asset: finalAssets.buyNetAsset, affordable: buyAffordability.isAffordable },
    { key: 'jeonse', asset: finalAssets.jeonseNetAsset, affordable: jeonseAffordability.isAffordable },
    { key: 'monthlyRent', asset: finalAssets.monthlyRentNetAsset, affordable: rentAffordability.isAffordable },
  ];

  // 가능한 시나리오만 필터링
  const affordableScenarios = scenarios.filter(s => s.affordable);

  if (affordableScenarios.length === 0) {
    return {
      primary: 'jeonse',
      secondary: 'monthlyRent',
      reasoning: ['⚠️ 모든 시나리오에서 월 지출이 저축액을 초과합니다.', '월 저축액을 늘리거나 조건을 조정해주세요.'],
      warnings: ['현재 설정으로는 어떤 선택도 불가능합니다.'],
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
  reasoning.push(`${buyInputs.yearsToHold}년 후 순자산이 ${formatWon(assetDiff)} 더 많습니다`);

  // 일반적인 조언 (인플레이션 시나리오 제거)
  if (primary === 'buy') {
    reasoning.push('레버리지 효과로 자산을 증식할 수 있습니다');
    reasoning.push('주택가격 상승과 실질 부채 감소를 동시에 누릴 수 있습니다');
    leverageAdvice = 'LTV 60~70% 활용 권장';
    warnings.push('금리 변동 리스크를 고려하세요');
  } else if (primary === 'monthlyRent') {
    reasoning.push('유동성을 확보하여 투자 기회에 대응할 수 있습니다');
    reasoning.push('투자 수익으로 월세를 상쇄할 수 있습니다');
    warnings.push('안정적인 투자 수익률 달성이 필요합니다');
    warnings.push('월세 상승률을 고려하여 장기 계약을 검토하세요');
  } else if (primary === 'jeonse') {
    reasoning.push('초기 자금 부담이 적고 안정적입니다');
    warnings.push('자산 증식 효과가 제한적입니다');
  }

  if (primary === 'jeonse' || secondary === 'jeonse') {
    warnings.push('전세는 기회비용이 크고 자산 증식 효과가 없습니다');
  }

  // 불가능한 시나리오 경고 추가
  const unaffordableScenarios = scenarios.filter(s => !s.affordable);
  if (unaffordableScenarios.length > 0) {
    const names = { buy: '매수', jeonse: '전세', monthlyRent: '월세' };
    unaffordableScenarios.forEach(s => {
      warnings.push(`⚠️ ${names[s.key]}는 월 지출이 초과되어 선택할 수 없습니다.`);
    });
  }

  return { primary, secondary, reasoning, warnings, leverageAdvice };
}
