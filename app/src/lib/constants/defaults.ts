import type { BuyInputs, JeonseInputs, MonthlyRentInputs } from '@/types';

// research.md 10장 기본 시나리오 기반
export const DEFAULT_BUY_INPUTS: BuyInputs = {
  purchasePrice: 600_000_000,
  areaM2: 84,
  numHomes: 1,
  loanAmount: 360_000_000,      // LTV 60%
  loanRate: 0.038,              // 3.8% 시중은행 평균
  loanType: 'equal_payment',
  yearsToHold: 5,
  annualPriceChangeRate: 0.03,
  annualIncome: 50_000_000,
  isFirstHomeBuyer: false,
  isRegulatedZone: false,
  expectedInvestmentReturn: 0.04,
};

export const DEFAULT_JEONSE_INPUTS: JeonseInputs = {
  depositAmount: 450_000_000,
  loanAmount: 200_000_000,
  loanRate: 0.035,              // 3.5%
  insuranceProvider: 'hug',
  yearsToHold: 5,
  expectedInvestmentReturn: 0.04,
  annualIncome: 50_000_000,
};

export const DEFAULT_MONTHLY_RENT_INPUTS: MonthlyRentInputs = {
  depositAmount: 50_000_000,
  monthlyRent: 1_500_000,
  yearsToHold: 5,
  expectedInvestmentReturn: 0.04,
  annualIncome: 50_000_000,
  areaM2: 84,
  marketPrice: 600_000_000,
};
