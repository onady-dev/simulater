import type {
  InflationScenario,
  InflationParameters,
} from '@/types';

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
