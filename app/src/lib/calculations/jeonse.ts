import type { JeonseInputs, JeonseCostBreakdown } from '@/types';
import { calculateRentAgentFee } from './agentFees';
import { JEONSE_INSURANCE_RATES } from '@/lib/constants/taxRates';

function calcInsurancePremium(
  deposit: number,
  provider: JeonseInputs['insuranceProvider'],
  years: number,
): number {
  const { min, max } = JEONSE_INSURANCE_RATES[provider];
  if (max === 0) return 0;
  return Math.floor(deposit * ((min + max) / 2) * years);
}

function calcJeonseLoanDeduction(annualIncome: number, annualInterest: number): number {
  const deductibleAmount = Math.min(annualInterest, 4_000_000);
  const deductionAmount = deductibleAmount * 0.4;
  const marginalRate = annualIncome <= 55_000_000 ? 0.15 : 0.24;
  return Math.floor(deductionAmount * marginalRate);
}

export function calculateJeonseScenario(inputs: JeonseInputs): JeonseCostBreakdown {
  const {
    depositAmount,
    loanAmount,
    loanRate,
    insuranceProvider,
    yearsToHold,
    expectedInvestmentReturn,
    annualIncome,
  } = inputs;

  const agentFee = calculateRentAgentFee(depositAmount);
  const insurancePremium = calcInsurancePremium(depositAmount, insuranceProvider, yearsToHold);
  const initialTotal = agentFee + insurancePremium;

  // 전세대출은 만기일시상환 (이자만)
  const annualInterest = Math.floor(loanAmount * loanRate);
  const totalLoanInterest = annualInterest * yearsToHold;
  const opportunityCost = Math.floor(depositAmount * expectedInvestmentReturn * yearsToHold);
  const periodicTotal = totalLoanInterest + opportunityCost;

  const annualTaxBenefit = calcJeonseLoanDeduction(annualIncome, annualInterest);
  const totalTaxBenefit = annualTaxBenefit * yearsToHold;

  return {
    initialCosts: { agentFee, insurancePremium, total: initialTotal },
    periodicCosts: { loanInterest: totalLoanInterest, opportunityCost, total: periodicTotal },
    taxBenefits: { loanDeduction: totalTaxBenefit, total: totalTaxBenefit },
    grandTotal: initialTotal + periodicTotal,
    netTotal: initialTotal + periodicTotal - totalTaxBenefit,
  };
}
