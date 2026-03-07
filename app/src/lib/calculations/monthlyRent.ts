import type { MonthlyRentInputs, MonthlyRentCostBreakdown } from '@/types';
import { calculateMonthlyRentTransactionAmount, calculateRentAgentFee } from './agentFees';

/**
 * 법정 상한 적용 월세 계산 (2년마다 재계약, 5% 상한)
 */
function calculateTotalRentWithLegalCap(
  monthlyRent: number,
  rentGrowthRate: number,
  yearsToHold: number
): number {
  const LEGAL_CAP = 0.05;
  const CONTRACT_PERIOD = 2;

  let total = 0;
  let currentRent = monthlyRent;

  for (let year = 0; year < yearsToHold; year++) {
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
    rentGrowthRate,
  } = inputs;

  const txAmount = calculateMonthlyRentTransactionAmount(depositAmount, monthlyRent);
  const agentFee = calculateRentAgentFee(txAmount);

  const totalRentPaid = rentGrowthRate
    ? calculateTotalRentWithLegalCap(monthlyRent, rentGrowthRate, yearsToHold)
    : monthlyRent * 12 * yearsToHold;

  const opportunityCost = Math.floor(depositAmount * expectedInvestmentReturn * yearsToHold);
  const periodicTotal = totalRentPaid + opportunityCost;

  return {
    initialCosts: { agentFee, total: agentFee },
    periodicCosts: { totalRentPaid, opportunityCost, total: periodicTotal },
    taxBenefits: { rentTaxCredit: 0, total: 0 },
    grandTotal: agentFee + periodicTotal,
    netTotal: agentFee + periodicTotal,
  };
}
