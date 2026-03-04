import type {
  InflationScenario,
  CalculationResults,
  Recommendation,
  BuyInputs,
  ScenarioKey,
} from '@/types';
import { formatWon } from '@/lib/utils/format';

export function generateRecommendation(
  inflationScenario: InflationScenario,
  results: CalculationResults,
  buyInputs: BuyInputs
): Recommendation {
  const lastIdx = buyInputs.yearsToHold - 1;
  const finalAssets = results.assetProjectionSeries[lastIdx];

  const assets: Record<ScenarioKey, number> = {
    buy: finalAssets.buyNetAsset,
    jeonse: finalAssets.jeonseNetAsset,
    monthlyRent: finalAssets.monthlyRentNetAsset,
  };

  const sorted = (Object.entries(assets) as [ScenarioKey, number][]).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  const reasoning: string[] = [];
  const warnings: string[] = [];
  let leverageAdvice: string | undefined;

  const assetDiff = assets[primary] - assets[secondary];
  reasoning.push(`${buyInputs.yearsToHold}년 후 순자산이 ${formatWon(assetDiff)} 더 많습니다`);

  if (inflationScenario === 'low') {
    if (primary === 'monthlyRent') {
      reasoning.push('저인플레이션 시기에는 투자 수익으로 월세를 상쇄할 수 있습니다');
      reasoning.push('유동성을 확보하여 기회가 왔을 때 대응할 수 있습니다');
      warnings.push('투자 수익률 5% 이상 달성이 필요합니다');
    } else if (primary === 'buy') {
      reasoning.push('낮은 금리로 대출 부담이 적습니다');
      reasoning.push('안정적인 주거 환경을 확보할 수 있습니다');
      leverageAdvice = 'LTV 60% 활용 권장';
    }
  } else if (inflationScenario === 'medium') {
    if (primary === 'buy') {
      reasoning.push('중인플레이션 시기는 레버리지 효과가 큽니다');
      reasoning.push('주택가격 상승과 실질 부채 감소를 동시에 누릴 수 있습니다');
      leverageAdvice = 'LTV 60~70% 활용 + 여유자금 투자 병행';
      warnings.push('금리 변동 리스크를 고려하세요');
    } else if (primary === 'monthlyRent') {
      reasoning.push('투자 수익률이 높다면 월세가 유리합니다');
      warnings.push('투자 수익률 7% 이상 달성이 필요합니다');
    }
  } else {
    if (primary === 'buy') {
      reasoning.push('고인플레이션 시기 부동산은 강력한 헤지 수단입니다');
      reasoning.push('실질 부채가 빠르게 감소합니다');
      leverageAdvice = '최대 LTV 활용 권장 (70%)';
      warnings.push('금리가 높아 초기 이자 부담이 클 수 있습니다');
    } else if (primary === 'monthlyRent') {
      reasoning.push('공격적 투자로 인플레이션을 헤지할 수 있습니다');
      warnings.push('투자 수익률 10% 이상 달성이 필요합니다');
      warnings.push('월세 상승률이 높을 수 있으니 장기 계약을 고려하세요');
    }
  }

  if (primary === 'jeonse' || secondary === 'jeonse') {
    warnings.push('전세는 기회비용이 크고 자산 증식 효과가 없습니다');
  }

  return { primary, secondary, reasoning, warnings, leverageAdvice };
}
