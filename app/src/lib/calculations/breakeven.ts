import type {
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  YearlyCostDataPoint,
  BreakevenDataPoint,
  AssetProjectionPoint,
} from '@/types';
import { calculateBuyScenario, calculateBuyInitialCosts } from './buy';
import { calculateJeonseScenario } from './jeonse';
import { calculateMonthlyRentScenario } from './monthlyRent';
import { calculateLoanRepayment } from './loanRepayment';
import { calculatePropertyTax, calculateComprehensiveRealEstateTax } from './taxes';
import { calculateRentAgentFee } from './agentFees';
import { calcInsurancePremium } from './jeonse';

/**
 * 연도별 누적 비용 시계열 생성
 * 각 연도에 대해 독립적으로 재계산 (정확성 보장)
 */
export function generateYearlyCostSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
  maxYears: number,
): YearlyCostDataPoint[] {
  return Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    return {
      year,
      buyCumulative: calculateBuyScenario({ ...buyInputs, yearsToHold: year }).effectiveCost,
      jeonseCumulative: calculateJeonseScenario({ ...jeonseInputs, yearsToHold: year }).netTotal,
      monthlyRentCumulative: calculateMonthlyRentScenario({
        ...monthlyRentInputs,
        yearsToHold: year,
      }).netTotal,
    };
  });
}

/**
 * 손익분기 분석: 주택가격 연간 변동률 -10%~+15% 범위
 */
export function generateBreakevenSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
): BreakevenDataPoint[] {
  const rates = [
    -0.1, -0.08, -0.05, -0.03, -0.01, 0, 0.01, 0.03, 0.05, 0.07, 0.1, 0.12, 0.15,
  ];
  const jeonseNet = calculateJeonseScenario(jeonseInputs).netTotal;
  const rentNet = calculateMonthlyRentScenario(monthlyRentInputs).netTotal;

  return rates.map((rate) => ({
    annualPriceChangeRate: rate,
    buyNetCost: calculateBuyScenario({ ...buyInputs, annualPriceChangeRate: rate }).effectiveCost,
    jeonseNetCost: jeonseNet,
    monthlyRentNetCost: rentNet,
  }));
}

/**
 * 전월세전환율 계산
 * 월세 = (전세금 - 보증금) × 전환율 ÷ 12
 */
export function convertJeonseToMonthlyRent(
  jeonseDeposit: number,
  newDeposit: number,
  conversionRate: number = 0.05,
): number {
  return Math.floor(((jeonseDeposit - newDeposit) * conversionRate) / 12);
}

/**
 * 각 시나리오의 월 지출액 계산
 */
export function calculateMonthlyExpense(
  scenario: 'buy' | 'jeonse' | 'monthlyRent',
  inputs: BuyInputs | JeonseInputs | MonthlyRentInputs,
): number {
  if (scenario === 'buy') {
    const buyInputs = inputs as BuyInputs;
    const loanSchedule = calculateLoanRepayment(
      buyInputs.loanAmount,
      buyInputs.loanRate,
      buyInputs.loanType,
      30,
      1,
    );
    const monthlyLoanPayment = loanSchedule.monthlyPayment;
    const monthlyTax = (calculatePropertyTax(buyInputs.purchasePrice) + calculateComprehensiveRealEstateTax(buyInputs.purchasePrice, buyInputs.numHomes)) / 12;
    return monthlyLoanPayment + monthlyTax;
  }
  
  if (scenario === 'jeonse') {
    const jeonseInputs = inputs as JeonseInputs;
    const monthlyInterest = (jeonseInputs.loanAmount * jeonseInputs.loanRate) / 12;
    return monthlyInterest;
  }
  
  if (scenario === 'monthlyRent') {
    const rentInputs = inputs as MonthlyRentInputs;
    return rentInputs.monthlyRent;
  }
  
  return 0;
}

/**
 * 월 지출이 월 저축액을 초과하는지 확인
 */
export function checkAffordability(
  scenario: 'buy' | 'jeonse' | 'monthlyRent',
  inputs: BuyInputs | JeonseInputs | MonthlyRentInputs,
  monthlySavings: number,
): {
  isAffordable: boolean;
  monthlyExpense: number;
  deficit: number;
  requiredCash: number;
  upfrontShortfall: number;
  hasEnoughMonthlyCash: boolean;
  hasEnoughUpfrontCash: boolean;
} {
  const monthlyExpense = calculateMonthlyExpense(scenario, inputs);
  let requiredCash = 0;

  if (scenario === 'buy') {
    const buyInputs = inputs as BuyInputs;
    requiredCash =
      Math.max(0, buyInputs.purchasePrice - buyInputs.loanAmount) +
      calculateBuyInitialCosts(
        buyInputs.purchasePrice,
        buyInputs.numHomes,
        buyInputs.areaM2,
        buyInputs.isFirstHomeBuyer,
        buyInputs.isRegulatedZone,
      );
  } else if (scenario === 'jeonse') {
    const jeonseInputs = inputs as JeonseInputs;
    requiredCash =
      Math.max(0, jeonseInputs.depositAmount - jeonseInputs.loanAmount) +
      calculateRentAgentFee(jeonseInputs.depositAmount) +
      calcInsurancePremium(
        jeonseInputs.depositAmount,
        jeonseInputs.insuranceProvider,
        jeonseInputs.yearsToHold,
      );
  } else {
    const rentInputs = inputs as MonthlyRentInputs;
    requiredCash =
      rentInputs.depositAmount +
      calculateRentAgentFee(
        rentInputs.depositAmount + rentInputs.monthlyRent * 100,
      );
  }

  const deficit = monthlyExpense - monthlySavings;
  const availableCash = inputs.availableCash;
  const upfrontShortfall = requiredCash - availableCash;
  const hasEnoughMonthlyCash = deficit <= 0;
  const hasEnoughUpfrontCash = upfrontShortfall <= 0;
  const isAffordable = hasEnoughMonthlyCash && hasEnoughUpfrontCash;
  
  return {
    isAffordable,
    monthlyExpense,
    deficit,
    requiredCash,
    upfrontShortfall,
    hasEnoughMonthlyCash,
    hasEnoughUpfrontCash,
  };
}

/**
 * 순자산 변화 시뮬레이션 시계열 생성
 *
 * 통일된 계산 방식: 순자산 = 금융자산 + 실물자산 - 부채
 * - 대출금은 availableCash 기준으로 자동 계산
 * - 월 저축액은 사용자 입력값에서 각 시나리오별 월 지출을 차감
 * - 금융자산 = 초기 여유금 복리운용 + 실제 월 저축액 적립
 */
export function generateAssetProjectionSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
): AssetProjectionPoint[] {
  const {
    purchasePrice,
    loanAmount,
    loanRate,
    loanType,
    annualPriceChangeRate,
    yearsToHold,
    availableCash,
    numHomes,
    monthlySavings,
  } = buyInputs;
  const buyRate = buyInputs.expectedInvestmentReturn;
  const jeonseRate = jeonseInputs.expectedInvestmentReturn;
  const rentRate = monthlyRentInputs.expectedInvestmentReturn;
  const rentGrowthRate = monthlyRentInputs.rentGrowthRate ?? 0;
  const jeonseGrowthRate = jeonseInputs.rentGrowthRate ?? 0;
  const LEGAL_CAP = 0.05;
  const CONTRACT_PERIOD = 2;

  // 대출금 자동 계산
  const buyLoanAmount = loanAmount;
  const jeonseLoanAmount = jeonseInputs.loanAmount;

  // 초기 여유금 계산
  const buyInitialInvestable = Math.max(
    0,
    availableCash - Math.max(0, purchasePrice - buyLoanAmount),
  );
  const jeonseInitialInvestable = Math.max(
    0,
    availableCash - Math.max(0, jeonseInputs.depositAmount - jeonseLoanAmount),
  );
  const rentInitialInvestable = Math.max(0, availableCash - monthlyRentInputs.depositAmount);

  // 초기 비용 계산 (1회만)
  const buyInitialCosts = calculateBuyInitialCosts(
    purchasePrice,
    numHomes,
    buyInputs.areaM2,
    buyInputs.isFirstHomeBuyer,
    buyInputs.isRegulatedZone,
  );
  
  const jeonseAgentFee = calculateRentAgentFee(jeonseInputs.depositAmount);
  const jeonseInsurancePremium = calcInsurancePremium(
    jeonseInputs.depositAmount,
    jeonseInputs.insuranceProvider,
    yearsToHold
  );
  const jeonseInitialCosts = jeonseAgentFee + jeonseInsurancePremium;
  
  const rentTransactionAmount = monthlyRentInputs.depositAmount + monthlyRentInputs.monthlyRent * 100;
  const rentAgentFee = calculateRentAgentFee(rentTransactionAmount);
  const rentInitialCosts = rentAgentFee;

  return Array.from({ length: yearsToHold }, (_, i) => {
    const year = i + 1;

    // ===== 매수 순자산 =====
    const buyLoanSchedule = calculateLoanRepayment(buyLoanAmount, loanRate, loanType, 30, year);
    const buyMonthlyLoanPayment = buyLoanSchedule.monthlyPayment;
    const buyMonthlyTax = (calculatePropertyTax(purchasePrice) + calculateComprehensiveRealEstateTax(purchasePrice, numHomes)) / 12;
    const buyMonthlyExpense = buyMonthlyLoanPayment + buyMonthlyTax;
    
    // 연도별 저축액 계산
    let buyFinancialAsset = buyInitialInvestable * Math.pow(1 + buyRate, year);
    for (let y = 1; y <= year; y++) {
      const actualSavings = Math.max(0, monthlySavings - buyMonthlyExpense);
      const remainingYears = year - y;
      const yearlyContribution = actualSavings * 12 * Math.pow(1 + buyRate, remainingYears);
      buyFinancialAsset += yearlyContribution;
    }
    
    const salePrice = Math.floor(purchasePrice * Math.pow(1 + annualPriceChangeRate, year));
    const buyNetAsset = Math.round(buyFinancialAsset - buyInitialCosts + salePrice - buyLoanSchedule.remainingPrincipal);

    // ===== 전세 순자산 =====
    const jeonseMonthlyInterest = (jeonseLoanAmount * jeonseInputs.loanRate) / 12;
    const jeonseIncreaseRate = jeonseGrowthRate > 0 ? Math.min(jeonseGrowthRate, LEGAL_CAP) : 0;
    
    // 연도별 보증금 인상액과 저축액 계산
    let jeonseFinancialAsset = jeonseInitialInvestable * Math.pow(1 + jeonseRate, year);
    let currentJeonseDeposit = jeonseInputs.depositAmount;
    
    for (let y = 1; y <= year; y++) {
      // 재계약 시점(2년마다)에 보증금 인상
      if (y > 1 && (y - 1) % CONTRACT_PERIOD === 0 && jeonseIncreaseRate > 0) {
        const prevDeposit = currentJeonseDeposit;
        currentJeonseDeposit = prevDeposit * (1 + jeonseIncreaseRate);
        const depositIncrease = currentJeonseDeposit - prevDeposit;
        
        // 보증금 인상액은 해당 시점에 금융자산에서 차감되고, 남은 기간만큼 기회비용 발생
        const remainingYears = year - y;
        jeonseFinancialAsset -= depositIncrease * Math.pow(1 + jeonseRate, remainingYears);
      }
      
      // 해당 연도의 월 저축액
      const actualSavings = Math.max(0, monthlySavings - jeonseMonthlyInterest);
      const remainingYears = year - y;
      const yearlyContribution = actualSavings * 12 * Math.pow(1 + jeonseRate, remainingYears);
      jeonseFinancialAsset += yearlyContribution;
    }
    const jeonseNetAsset = Math.round(jeonseFinancialAsset - jeonseInitialCosts + currentJeonseDeposit - jeonseLoanAmount);

    // ===== 월세 순자산 =====
    // 월세: 2년마다 재계약 시 법정 상한 적용, 연도별 실제 월세 반영
    let rentFinancialAsset = rentInitialInvestable * Math.pow(1 + rentRate, year);
    const rentIncreaseRate = rentGrowthRate > 0 ? Math.min(rentGrowthRate, LEGAL_CAP) : 0;
    
    for (let y = 1; y <= year; y++) {
      const renewalCount = Math.floor((y - 1) / CONTRACT_PERIOD);
      const currentRent = monthlyRentInputs.monthlyRent * Math.pow(1 + rentIncreaseRate, renewalCount);
      const actualSavings = Math.max(0, monthlySavings - currentRent);
      
      // 해당 연도의 월 저축액을 남은 기간만큼 복리 운용
      const remainingYears = year - y;
      const yearlyContribution = actualSavings * 12 * Math.pow(1 + rentRate, remainingYears);
      rentFinancialAsset += yearlyContribution;
    }
    
    const monthlyRentNetAsset = Math.round(rentFinancialAsset - rentInitialCosts + monthlyRentInputs.depositAmount);

    return { year, buyNetAsset, jeonseNetAsset, monthlyRentNetAsset };
  });
}
