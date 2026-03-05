import type { MonthlyRentInputs, MonthlyRentCostBreakdown } from '@/types';
import { calculateMonthlyRentTransactionAmount, calculateRentAgentFee } from './agentFees';

function calcRentTaxCredit(
  annualIncome: number,
  annualRent: number,
  areaM2: number,
  marketPrice: number,
): number {
  const isEligible =
    (areaM2 <= 85 || marketPrice <= 400_000_000) && annualIncome <= 80_000_000;
  if (!isEligible) return 0;

  const cappedRent = Math.min(annualRent, 10_000_000);
  const creditRate = annualIncome <= 55_000_000 ? 0.17 : 0.15;
  return Math.floor(cappedRent * creditRate);
}

/**
 * 법정 상한 적용 월세 계산 (2년마다 재계약, 5% 상한)
 */
function calculateTotalRentWithLegalCap(
  monthlyRent: number,
  rentGrowthRate: number,
  yearsToHold: number
): number {
  const LEGAL_CAP = 0.05;  // 5% 법정 상한
  const CONTRACT_PERIOD = 2;  // 2년 계약
  
  let total = 0;
  let currentRent = monthlyRent;
  
  for (let year = 0; year < yearsToHold; year++) {
    // 2년마다 재계약 시 인상 (법정 상한 적용)
    if (year > 0 && year % CONTRACT_PERIOD === 0) {
      const increaseRate = Math.min(rentGrowthRate, LEGAL_CAP);
      currentRent = currentRent * (1 + increaseRate);
    }
    total += currentRent * 12;
  }
  
  return Math.floor(total);
}

export function calculateMonthlyRentScenario(inputs: MonthlyRentInputs): MonthlyRentCostBreakdown {
  const {
    depositAmount,
    monthlyRent,
    yearsToHold,
    expectedInvestmentReturn,
    annualIncome,
    areaM2,
    marketPrice,
    rentGrowthRate,
  } = inputs;

  const txAmount = calculateMonthlyRentTransactionAmount(depositAmount, monthlyRent);
  const agentFee = calculateRentAgentFee(txAmount);

  // 월세 상승률 적용 (법정 상한 5%)
  const totalRentPaid = rentGrowthRate
    ? calculateTotalRentWithLegalCap(monthlyRent, rentGrowthRate, yearsToHold)
    : monthlyRent * 12 * yearsToHold;
    
  const opportunityCost = Math.floor(depositAmount * expectedInvestmentReturn * yearsToHold);
  const periodicTotal = totalRentPaid + opportunityCost;

  const annualTaxCredit = calcRentTaxCredit(annualIncome, monthlyRent * 12, areaM2, marketPrice);
  const totalTaxBenefit = annualTaxCredit * yearsToHold;

  return {
    initialCosts: { agentFee, total: agentFee },
    periodicCosts: { totalRentPaid, opportunityCost, total: periodicTotal },
    taxBenefits: { rentTaxCredit: totalTaxBenefit, total: totalTaxBenefit },
    grandTotal: agentFee + periodicTotal,
    netTotal: agentFee + periodicTotal - totalTaxBenefit,
  };
}
