import type { JeonseInsuranceProvider } from '@/types';

export interface TaxBracket {
  maxBase: number;
  rate: number;
  cumulative: number;
}

export interface ComprehensiveTaxBracket {
  maxBase: number;
  rate: number;
  deduction: number;
}

export interface CapitalGainsBracket {
  maxBase: number;
  rate: number;
  deduction: number;
}

export interface AgentFeeBracket {
  maxPrice: number;
  rate: number;
  cap: number | null;
}

export interface InsuranceRate {
  min: number;
  max: number;
}

// 재산세 브라켓
export const PROPERTY_TAX_BRACKETS: TaxBracket[] = [
  { maxBase: 60_000_000,  rate: 0.001,  cumulative: 0 },
  { maxBase: 150_000_000, rate: 0.0015, cumulative: 60_000 },
  { maxBase: 300_000_000, rate: 0.0025, cumulative: 195_000 },
  { maxBase: Infinity,    rate: 0.004,  cumulative: 570_000 },
];

// 종합부동산세 브라켓
export const COMPREHENSIVE_TAX_BRACKETS: ComprehensiveTaxBracket[] = [
  { maxBase: 300_000_000,    rate: 0.005, deduction: 0 },
  { maxBase: 600_000_000,    rate: 0.007, deduction: 600_000 },
  { maxBase: 1_200_000_000,  rate: 0.010, deduction: 2_400_000 },
  { maxBase: 2_500_000_000,  rate: 0.013, deduction: 6_000_000 },
  { maxBase: 5_000_000_000,  rate: 0.015, deduction: 11_000_000 },
  { maxBase: 9_400_000_000,  rate: 0.020, deduction: 36_000_000 },
  { maxBase: Infinity,       rate: 0.027, deduction: 101_800_000 },
];

// 양도소득세 브라켓 (기본세율)
export const CAPITAL_GAINS_TAX_BRACKETS: CapitalGainsBracket[] = [
  { maxBase: 14_000_000,     rate: 0.06, deduction: 0 },
  { maxBase: 50_000_000,     rate: 0.15, deduction: 1_260_000 },
  { maxBase: 88_000_000,     rate: 0.24, deduction: 5_760_000 },
  { maxBase: 150_000_000,    rate: 0.35, deduction: 15_440_000 },
  { maxBase: 300_000_000,    rate: 0.38, deduction: 19_940_000 },
  { maxBase: 500_000_000,    rate: 0.40, deduction: 25_940_000 },
  { maxBase: 1_000_000_000,  rate: 0.42, deduction: 35_940_000 },
  { maxBase: Infinity,       rate: 0.45, deduction: 65_940_000 },
];

// 매매 중개수수료 브라켓
export const BUY_AGENT_FEE_BRACKETS: AgentFeeBracket[] = [
  { maxPrice: 50_000_000,    rate: 0.006, cap: 250_000 },
  { maxPrice: 200_000_000,   rate: 0.005, cap: 800_000 },
  { maxPrice: 900_000_000,   rate: 0.004, cap: null },
  { maxPrice: 1_200_000_000, rate: 0.005, cap: null },
  { maxPrice: 1_500_000_000, rate: 0.006, cap: null },
  { maxPrice: Infinity,      rate: 0.007, cap: null },
];

// 임대차 중개수수료 브라켓 (전세/월세)
export const RENT_AGENT_FEE_BRACKETS: AgentFeeBracket[] = [
  { maxPrice: 50_000_000,    rate: 0.005, cap: 200_000 },
  { maxPrice: 100_000_000,   rate: 0.004, cap: 300_000 },
  { maxPrice: 600_000_000,   rate: 0.003, cap: null },
  { maxPrice: 1_200_000_000, rate: 0.004, cap: null },
  { maxPrice: 1_500_000_000, rate: 0.005, cap: null },
  { maxPrice: Infinity,      rate: 0.006, cap: null },
];

// 전세보증보험 연간 보증료율
export const JEONSE_INSURANCE_RATES: Record<JeonseInsuranceProvider, InsuranceRate> = {
  none: { min: 0,       max: 0 },
  hf:   { min: 0.0004,  max: 0.0018 },
  hug:  { min: 0.00111, max: 0.00211 },
  sgi:  { min: 0.00183, max: 0.00208 },
};

// 법정 전월세전환율 상한 (기준금리 2.5% + 2%)
export const LEGAL_CONVERSION_RATE_CAP = 0.05;
