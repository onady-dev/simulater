import type {
  CalculationResults,
  Recommendation,
  BuyInputs,
  ScenarioKey,
} from '@/types';
import { formatWon } from '@/lib/utils/format';

export function generateRecommendation(
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

  return { primary, secondary, reasoning, warnings, leverageAdvice };
}
