export { calculateBuyScenario } from './buy';
export { calculateJeonseScenario } from './jeonse';
export { calculateMonthlyRentScenario } from './monthlyRent';
export { generateYearlyCostSeries, generateBreakevenSeries, convertJeonseToMonthlyRent, generateAssetProjectionSeries } from './breakeven';
export { calculateLoanRepayment } from './loanRepayment';

import type {
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  CalculationResults,
  ScenarioKey,
} from '@/types';
import { calculateBuyScenario } from './buy';
import { calculateJeonseScenario } from './jeonse';
import { calculateMonthlyRentScenario } from './monthlyRent';
import { generateYearlyCostSeries, generateBreakevenSeries, generateAssetProjectionSeries } from './breakeven';

export function runAllCalculations(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
): CalculationResults {
  const buy = calculateBuyScenario(buyInputs);
  const jeonse = calculateJeonseScenario(jeonseInputs);
  const monthlyRent = calculateMonthlyRentScenario(monthlyRentInputs);

  const yearlyCostSeries = generateYearlyCostSeries(
    buyInputs,
    jeonseInputs,
    monthlyRentInputs,
    buyInputs.yearsToHold,
  );
  const breakevenSeries = generateBreakevenSeries(buyInputs, jeonseInputs, monthlyRentInputs);
  const assetProjectionSeries = generateAssetProjectionSeries(buyInputs, jeonseInputs, monthlyRentInputs);

  const nets: Record<ScenarioKey, number> = {
    buy: buy.effectiveCost,   // 실질 주거비 (자산이익 반영)
    jeonse: jeonse.netTotal,
    monthlyRent: monthlyRent.netTotal,
  };
  const recommendation = (Object.keys(nets) as ScenarioKey[]).reduce((a, b) =>
    nets[b] < nets[a] ? b : a,
  );

  return { buy, jeonse, monthlyRent, yearlyCostSeries, breakevenSeries, assetProjectionSeries, recommendation };
}
