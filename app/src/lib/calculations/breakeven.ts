import type {
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  YearlyCostDataPoint,
  BreakevenDataPoint,
} from '@/types';
import { calculateBuyScenario } from './buy';
import { calculateJeonseScenario } from './jeonse';
import { calculateMonthlyRentScenario } from './monthlyRent';

/**
 * 연도별 누적 비용 시계열 생성
 * 각 연도에 대해 독립적으로 재계산 (정확성 보장)
 */
export function generateYearlyCostSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
  maxYears: number,
): YearlyCostDataPoint[] {
  return Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    return {
      year,
      buyCumulative: calculateBuyScenario({ ...buyInputs, yearsToHold: year }).effectiveCost,
      jeonseCumulative: calculateJeonseScenario({ ...jeonseInputs, yearsToHold: year }).netTotal,
      monthlyRentCumulative: calculateMonthlyRentScenario({
        ...monthlyRentInputs,
        yearsToHold: year,
      }).netTotal,
    };
  });
}

/**
 * 손익분기 분석: 주택가격 연간 변동률 -10%~+15% 범위
 */
export function generateBreakevenSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
): BreakevenDataPoint[] {
  const rates = [
    -0.1, -0.08, -0.05, -0.03, -0.01, 0, 0.01, 0.03, 0.05, 0.07, 0.1, 0.12, 0.15,
  ];
  const jeonseNet = calculateJeonseScenario(jeonseInputs).netTotal;
  const rentNet = calculateMonthlyRentScenario(monthlyRentInputs).netTotal;

  return rates.map((rate) => ({
    annualPriceChangeRate: rate,
    buyNetCost: calculateBuyScenario({ ...buyInputs, annualPriceChangeRate: rate }).effectiveCost,
    jeonseNetCost: jeonseNet,
    monthlyRentNetCost: rentNet,
  }));
}

/**
 * 전월세전환율 계산
 * 월세 = (전세금 - 보증금) × 전환율 ÷ 12
 */
export function convertJeonseToMonthlyRent(
  jeonseDeposit: number,
  newDeposit: number,
  conversionRate: number = 0.05,
): number {
  return Math.floor(((jeonseDeposit - newDeposit) * conversionRate) / 12);
}
