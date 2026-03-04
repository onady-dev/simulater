import type {
  InflationScenario,
  InflationParameters,
  ScenarioComparison,
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
} from '@/types';
import { runAllCalculations } from './index';

export function calculateRealValue(
  nominalValue: number,
  inflationRate: number,
  years: number
): number {
  return nominalValue / Math.pow(1 + inflationRate, years);
}

export function getInflationParameters(scenario: InflationScenario): InflationParameters {
  const params: Record<InflationScenario, InflationParameters> = {
    low: {
      inflationRate: 0.015,
      housingPriceGrowth: 0.02,
      rentGrowthRate: 0.02,
      loanInterestRate: 0.03,
      expectedInvestmentReturn: 0.05,
    },
    medium: {
      inflationRate: 0.03,
      housingPriceGrowth: 0.04,
      rentGrowthRate: 0.045,
      loanInterestRate: 0.04,
      expectedInvestmentReturn: 0.07,
    },
    high: {
      inflationRate: 0.05,
      housingPriceGrowth: 0.065,
      rentGrowthRate: 0.07,
      loanInterestRate: 0.055,
      expectedInvestmentReturn: 0.10,
    },
  };
  return params[scenario];
}

export function compareInflationScenarios(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs
): ScenarioComparison[] {
  const scenarios: InflationScenario[] = ['low', 'medium', 'high'];

  return scenarios.map((scenario) => {
    const params = getInflationParameters(scenario);

    const adjustedBuy: BuyInputs = {
      ...buyInputs,
      annualPriceChangeRate: params.housingPriceGrowth,
      loanRate: params.loanInterestRate,
      expectedInvestmentReturn: params.expectedInvestmentReturn,
    };
    const adjustedJeonse: JeonseInputs = {
      ...jeonseInputs,
      loanRate: params.loanInterestRate,
      expectedInvestmentReturn: params.expectedInvestmentReturn,
    };
    const adjustedRent: MonthlyRentInputs = {
      ...monthlyRentInputs,
      expectedInvestmentReturn: params.expectedInvestmentReturn,
    };

    const results = runAllCalculations(adjustedBuy, adjustedJeonse, adjustedRent);
    const lastIdx = buyInputs.yearsToHold - 1;
    const nominal = results.assetProjectionSeries[lastIdx];

    return {
      scenario,
      parameters: params,
      results,
      realAssetValue: {
        buy: Math.round(calculateRealValue(nominal.buyNetAsset, params.inflationRate, buyInputs.yearsToHold)),
        jeonse: Math.round(calculateRealValue(nominal.jeonseNetAsset, params.inflationRate, buyInputs.yearsToHold)),
        monthlyRent: Math.round(calculateRealValue(nominal.monthlyRentNetAsset, params.inflationRate, buyInputs.yearsToHold)),
      },
    };
  });
}
