/** 원화 금액 (정수, 원 단위) */
export type Won = number;
/** 비율 (소수): 5% = 0.05 */
export type Rate = number;
/** 연수 (양의 정수) */
export type Years = number;

export type HomeOwnerCount = 1 | 2 | 3;

export type LoanRepaymentType =
  | 'equal_payment'
  | 'equal_principal'
  | 'bullet';

export type JeonseInsuranceProvider =
  | 'none'
  | 'hf'
  | 'hug'
  | 'sgi';

export type ScenarioKey = 'buy' | 'jeonse' | 'monthlyRent';

// ─── 입력 타입 ───────────────────────────────────────────────────────────────

export interface BuyInputs {
  purchasePrice: Won;
  areaM2: number;
  numHomes: HomeOwnerCount;
  loanAmount: Won;
  loanRate: Rate;
  loanType: LoanRepaymentType;
  yearsToHold: Years;
  annualPriceChangeRate: Rate;
  annualIncome: Won;
  isFirstHomeBuyer: boolean;
  isRegulatedZone: boolean;
  expectedInvestmentReturn: Rate; // 자기자본 기회비용 계산용 투자수익률
}

export interface JeonseInputs {
  depositAmount: Won;
  loanAmount: Won;
  loanRate: Rate;
  insuranceProvider: JeonseInsuranceProvider;
  yearsToHold: Years;
  expectedInvestmentReturn: Rate;
  annualIncome: Won;
}

export interface MonthlyRentInputs {
  depositAmount: Won;
  monthlyRent: Won;
  yearsToHold: Years;
  expectedInvestmentReturn: Rate;
  annualIncome: Won;
  areaM2: number;
  marketPrice: Won;
}

// ─── 결과 타입 ───────────────────────────────────────────────────────────────

export interface BuyInitialCosts {
  acquisitionTax: Won;
  agentFee: Won;
  legalFee: Won;
  bondDiscount: Won;
  registrationTax: Won;
  stampDuty: Won;
  total: Won;
}

export interface BuyAnnualHoldingCosts {
  propertyTax: Won;
  comprehensiveTax: Won;
  maintenanceFee: Won;
  loanInterest: Won;
  total: Won;
}

export interface BuyDisposalCosts {
  capitalGainsTax: Won;
  agentFee: Won;
  total: Won;
}

export interface BuyAssetGain {
  finalPropertyValue: Won;
  priceGain: Won;
  effectiveCost: Won;
}

export interface CostBreakdown {
  initialCosts: BuyInitialCosts;
  annualHoldingCosts: BuyAnnualHoldingCosts;
  disposalCosts: BuyDisposalCosts;
  opportunityCost: Won;   // 자기자본(매수가 - 대출) 기회비용 총계
  taxBenefits: { firstHomeReduction: Won; total: Won };
  assetGain: BuyAssetGain;
  grandTotal: Won;
  netTotal: Won;
  effectiveCost: Won;
}

export interface JeonseInitialCosts {
  agentFee: Won;
  insurancePremium: Won;
  total: Won;
}

export interface JeonsePeriodicCosts {
  loanInterest: Won;
  opportunityCost: Won;
  total: Won;
}

export interface JeonseCostBreakdown {
  initialCosts: JeonseInitialCosts;
  periodicCosts: JeonsePeriodicCosts;
  taxBenefits: { loanDeduction: Won; total: Won };
  grandTotal: Won;
  netTotal: Won;
}

export interface RentInitialCosts {
  agentFee: Won;
  total: Won;
}

export interface RentPeriodicCosts {
  totalRentPaid: Won;
  opportunityCost: Won;
  total: Won;
}

export interface MonthlyRentCostBreakdown {
  initialCosts: RentInitialCosts;
  periodicCosts: RentPeriodicCosts;
  taxBenefits: { rentTaxCredit: Won; total: Won };
  grandTotal: Won;
  netTotal: Won;
}

export interface AssetProjectionPoint {
  year: number;
  buyNetAsset: Won;         // 부동산 순자산 = 시세(년도별) - 잔여대출
  jeonseNetAsset: Won;      // 전세 순자산 = 초기여유금 투자 + 월절약액 적립 + 보증금 - 전세대출
  monthlyRentNetAsset: Won; // 월세 순자산 = 초기여유금 투자 + 월절약액 적립 + 보증금
}

export interface YearlyCostDataPoint {
  year: number;
  buyCumulative: Won;
  jeonseCumulative: Won;
  monthlyRentCumulative: Won;
}

export interface BreakevenDataPoint {
  annualPriceChangeRate: Rate;
  buyNetCost: Won;
  jeonseNetCost: Won;
  monthlyRentNetCost: Won;
}

export interface CalculationResults {
  buy: CostBreakdown;
  jeonse: JeonseCostBreakdown;
  monthlyRent: MonthlyRentCostBreakdown;
  yearlyCostSeries: YearlyCostDataPoint[];
  breakevenSeries: BreakevenDataPoint[];
  assetProjectionSeries: AssetProjectionPoint[];
  recommendation: ScenarioKey;
}

// ─── 바텀시트 프리셋 ─────────────────────────────────────────────────────────

export interface PresetOption {
  label: string;
  value: Won;
}
