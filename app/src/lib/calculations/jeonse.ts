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

/**
 * 연도별 전세 보증금 계산 (2년마다 재계약, 법정 상한 5%)
 */
function calculateJeonseDepositByYear(
  initialDeposit: number,
  rentGrowthRate: number,
  year: number
): number {
  const LEGAL_CAP = 0.05;
  const CONTRACT_PERIOD = 2;

  const renewalCount = Math.floor((year - 1) / CONTRACT_PERIOD);
  if (renewalCount === 0) return initialDeposit;

  const increaseRate = Math.min(rentGrowthRate, LEGAL_CAP);
  return Math.floor(initialDeposit * Math.pow(1 + increaseRate, renewalCount));
}

export function calculateJeonseScenario(inputs: JeonseInputs): JeonseCostBreakdown {
  const {
    depositAmount,
    loanAmount,
    loanRate,
    insuranceProvider,
    yearsToHold,
    expectedInvestmentReturn,
    rentGrowthRate,
  } = inputs;

  const agentFee = calculateRentAgentFee(depositAmount);
  const insurancePremium = calcInsurancePremium(depositAmount, insuranceProvider, yearsToHold);
  const initialTotal = agentFee + insurancePremium;

  // 전세대출은 만기일시상환 (이자만)
  const annualInterest = Math.floor(loanAmount * loanRate);
  const totalLoanInterest = annualInterest * yearsToHold;

  // 보증금 상승 반영 (2년마다 재계약, 법정 상한 5%)
  let totalOpportunityCost = 0;
  if (rentGrowthRate && yearsToHold > 2) {
    for (let year = 1; year <= yearsToHold; year++) {
      const currentDeposit = calculateJeonseDepositByYear(depositAmount, rentGrowthRate, year);
      const ownDeposit = Math.max(0, currentDeposit - loanAmount);
      totalOpportunityCost += Math.floor(ownDeposit * expectedInvestmentReturn);
    }
  } else {
    totalOpportunityCost = Math.floor(depositAmount * expectedInvestmentReturn * yearsToHold);
  }

  const periodicTotal = totalLoanInterest + totalOpportunityCost;

  return {
    initialCosts: { agentFee, insurancePremium, total: initialTotal },
    periodicCosts: { loanInterest: totalLoanInterest, opportunityCost: totalOpportunityCost, total: periodicTotal },
    taxBenefits: { loanDeduction: 0, total: 0 },
    grandTotal: initialTotal + periodicTotal,
    netTotal: initialTotal + periodicTotal,
  };
}
