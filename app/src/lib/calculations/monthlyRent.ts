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

export function calculateMonthlyRentScenario(inputs: MonthlyRentInputs): MonthlyRentCostBreakdown {
  const {
    depositAmount,
    monthlyRent,
    yearsToHold,
    expectedInvestmentReturn,
    annualIncome,
    areaM2,
    marketPrice,
  } = inputs;

  const txAmount = calculateMonthlyRentTransactionAmount(depositAmount, monthlyRent);
  const agentFee = calculateRentAgentFee(txAmount);

  const totalRentPaid = monthlyRent * 12 * yearsToHold;
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
