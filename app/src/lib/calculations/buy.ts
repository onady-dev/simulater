import type { BuyInputs, CostBreakdown } from '@/types';
import {
  calculateAcquisitionTax,
  calculateCapitalGainsTax,
  calculatePropertyTaxByYear,
  calculateComprehensiveRealEstateTaxByYear,
} from './taxes';
import { calculateBuyAgentFee } from './agentFees';
import { calculateLoanRepayment } from './loanRepayment';

function estimateLegalFee(price: number): number {
  if (price <= 100_000_000) return 300_000;
  if (price <= 300_000_000) return 450_000;
  if (price <= 600_000_000) return 600_000;
  return 800_000;
}

function estimateBondDiscountCost(price: number): number {
  return Math.floor(price * 0.004);
}

function calcRegistrationCosts(price: number): { registrationTax: number; stampDuty: number } {
  const registrationTax = Math.floor(price * 0.002);
  let stampDuty = 0;
  if (price >= 1_000_000_000) stampDuty = 350_000;
  else if (price >= 100_000_000) stampDuty = 150_000;
  return { registrationTax, stampDuty };
}

export function calculateBuyScenario(inputs: BuyInputs): CostBreakdown {
  const {
    purchasePrice,
    areaM2,
    numHomes,
    loanAmount,
    loanRate,
    loanType,
    yearsToHold,
    annualPriceChangeRate,
    isFirstHomeBuyer,
    expectedInvestmentReturn,
  } = inputs;

  // 초기 비용
  const acqTax = calculateAcquisitionTax(purchasePrice, numHomes, areaM2, isFirstHomeBuyer);
  const buyAgentFee = calculateBuyAgentFee(purchasePrice);
  const legalFee = estimateLegalFee(purchasePrice);
  const bondDiscount = estimateBondDiscountCost(purchasePrice);
  const { registrationTax, stampDuty } = calcRegistrationCosts(purchasePrice);
  const initialTotal =
    acqTax.total + buyAgentFee + legalFee + bondDiscount + registrationTax + stampDuty;

  // 연도별 재산세/종부세 합산
  let totalPropertyTax = 0;
  let totalComprehensiveTax = 0;
  
  for (let year = 1; year <= yearsToHold; year++) {
    totalPropertyTax += calculatePropertyTaxByYear(purchasePrice, annualPriceChangeRate, year);
    totalComprehensiveTax += calculateComprehensiveRealEstateTaxByYear(
      purchasePrice, numHomes, annualPriceChangeRate, year
    );
  }
  
  const avgPropertyTax = Math.floor(totalPropertyTax / yearsToHold);
  const avgComprehensiveTax = Math.floor(totalComprehensiveTax / yearsToHold);
  
  const loanSchedule = calculateLoanRepayment(loanAmount, loanRate, loanType, 30, yearsToHold);
  const annualLoanInterest = loanSchedule.yearlyInterestSchedule[0] ?? 0;
  const annualHoldingTotal = avgPropertyTax + avgComprehensiveTax + annualLoanInterest;

  // 처분 비용
  const salePrice = Math.floor(
    purchasePrice * Math.pow(1 + annualPriceChangeRate, yearsToHold),
  );
  const sellAgentFee = calculateBuyAgentFee(salePrice);
  const capitalGainsTax = calculateCapitalGainsTax({
    purchasePrice,
    salePrice,
    acquisitionCosts: initialTotal,
    yearsHeld: yearsToHold,
    numHomes,
    isResidence: true,
  });
  const disposalTotal = capitalGainsTax + sellAgentFee;

  // 자기자본 기회비용
  const buyEquity = purchasePrice - loanAmount;
  const opportunityCost = Math.floor(buyEquity * expectedInvestmentReturn * yearsToHold);

  const grandTotal = initialTotal + annualHoldingTotal * yearsToHold + opportunityCost + disposalTotal;
  const netTotal = grandTotal - acqTax.firstHomeReduction;

  // 자산 이익
  const priceGain = salePrice - purchasePrice;
  const effectiveCost = netTotal - priceGain;

  return {
    initialCosts: {
      acquisitionTax: acqTax.total,
      agentFee: buyAgentFee,
      legalFee,
      bondDiscount,
      registrationTax,
      stampDuty,
      total: initialTotal,
    },
    annualHoldingCosts: {
      propertyTax: avgPropertyTax,
      comprehensiveTax: avgComprehensiveTax,
      loanInterest: annualLoanInterest,
      total: annualHoldingTotal,
    },
    disposalCosts: {
      capitalGainsTax,
      agentFee: sellAgentFee,
      total: disposalTotal,
    },
    opportunityCost,
    taxBenefits: {
      firstHomeReduction: acqTax.firstHomeReduction,
      total: acqTax.firstHomeReduction,
    },
    assetGain: {
      finalPropertyValue: salePrice,
      priceGain,
      effectiveCost,
    },
    grandTotal,
    netTotal,
    effectiveCost,
  };
}
