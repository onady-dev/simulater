import type {
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  YearlyCostDataPoint,
  BreakevenDataPoint,
  AssetProjectionPoint,
} from '@/types';
import { calculateBuyScenario, estimateAnnualMaintenanceFee } from './buy';
import { calculateJeonseScenario } from './jeonse';
import { calculateMonthlyRentScenario } from './monthlyRent';
import { calculateLoanRepayment } from './loanRepayment';
import { calculatePropertyTax } from './taxes';

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
 * 순자산 변화 시뮬레이션 시계열 생성
 *
 * 공통 기준: 매수 자기자본(purchasePrice - loanAmount)을 초기 보유 현금으로 설정.
 * 전세·월세는 (초기여유금 + 매달 매수 대비 절약액)을 expectedInvestmentReturn으로 운용.
 */
export function generateAssetProjectionSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
): AssetProjectionPoint[] {
  const { purchasePrice, loanAmount, loanRate, loanType, annualPriceChangeRate, yearsToHold } =
    buyInputs;
  const r = jeonseInputs.expectedInvestmentReturn;
  const rentGrowthRate = monthlyRentInputs.rentGrowthRate || 0;
  const jeonseGrowthRate = jeonseInputs.rentGrowthRate || 0;
  const LEGAL_CAP = 0.05;
  const CONTRACT_PERIOD = 2;

  // 매수 월 현금지출: 원리금 + 재산세/관리비 월할
  const buySchedule = calculateLoanRepayment(loanAmount, loanRate, loanType, 30, yearsToHold);
  const buyMonthlyMortgage = buySchedule.monthlyPayment;
  const propertyTax = calculatePropertyTax(purchasePrice);
  const maintenanceFee = estimateAnnualMaintenanceFee(buyInputs.areaM2);
  const buyMonthlyOutflow = buyMonthlyMortgage + (propertyTax + maintenanceFee) / 12;

  // 전세 월 현금지출 (이자만 — 만기일시상환 가정)
  const jeonseMonthlyOutflow = (jeonseInputs.loanAmount * jeonseInputs.loanRate) / 12;

  // 초기 여유금: 매수 자기자본에서 각 시나리오 보증금 자부담 차감
  const buyEquity = purchasePrice - loanAmount;
  const jeonseOwnDeposit = Math.max(0, jeonseInputs.depositAmount - jeonseInputs.loanAmount);
  const jeonseInitialInvestable = Math.max(0, buyEquity - jeonseOwnDeposit);
  const rentInitialInvestable = Math.max(0, buyEquity - monthlyRentInputs.depositAmount);

  // 월 절약액 (음수 = 해당 시나리오가 더 비쌈)
  const jeonseMonthlySaving = buyMonthlyOutflow - jeonseMonthlyOutflow;

  return Array.from({ length: yearsToHold }, (_, i) => {
    const year = i + 1;
    const months = year * 12;

    // 매수 순자산: 시세 - 잔여대출
    const salePrice = Math.floor(purchasePrice * Math.pow(1 + annualPriceChangeRate, year));
    const remainingLoan = calculateLoanRepayment(
      loanAmount,
      loanRate,
      loanType,
      30,
      year,
    ).remainingPrincipal;
    const buyNetAsset = salePrice - remainingLoan;

    // 연금 미래가치 계수
    const fvFactor = r > 0 ? (Math.pow(1 + r / 12, months) - 1) / (r / 12) : months;

    // 전세 보증금 (2년마다 재계약, 법정 상한 적용)
    let currentJeonseDeposit = jeonseInputs.depositAmount;
    const jeonseRenewalCount = Math.floor((year - 1) / CONTRACT_PERIOD);
    if (jeonseRenewalCount > 0 && jeonseGrowthRate > 0) {
      const increaseRate = Math.min(jeonseGrowthRate, LEGAL_CAP);
      currentJeonseDeposit = jeonseInputs.depositAmount * Math.pow(1 + increaseRate, jeonseRenewalCount);
    }
    
    // 전세 순자산
    const fvInitialJeonse = jeonseInitialInvestable * Math.pow(1 + r, year);
    const fvSavingJeonse = jeonseMonthlySaving * fvFactor;
    const jeonseNetAsset = Math.round(
      fvInitialJeonse + fvSavingJeonse + currentJeonseDeposit - jeonseInputs.loanAmount,
    );

    // 월세 월 현금지출 (2년마다 재계약, 법정 상한 적용)
    let currentMonthlyRent = monthlyRentInputs.monthlyRent;
    const rentRenewalCount = Math.floor((year - 1) / CONTRACT_PERIOD);
    if (rentRenewalCount > 0 && rentGrowthRate > 0) {
      const increaseRate = Math.min(rentGrowthRate, LEGAL_CAP);
      currentMonthlyRent = monthlyRentInputs.monthlyRent * Math.pow(1 + increaseRate, rentRenewalCount);
    }
    
    // 월세 순자산 (연도별 월세 변화 반영)
    const rentMonthlySaving = buyMonthlyOutflow - currentMonthlyRent;
    const fvInitialRent = rentInitialInvestable * Math.pow(1 + r, year);
    const fvSavingRent = rentMonthlySaving * fvFactor;
    const monthlyRentNetAsset = Math.round(
      fvInitialRent + fvSavingRent + monthlyRentInputs.depositAmount,
    );

    return { year, buyNetAsset, jeonseNetAsset, monthlyRentNetAsset };
  });
}
