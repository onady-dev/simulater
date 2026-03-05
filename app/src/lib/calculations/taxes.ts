import {
  PROPERTY_TAX_BRACKETS,
  COMPREHENSIVE_TAX_BRACKETS,
  CAPITAL_GAINS_TAX_BRACKETS,
} from '@/lib/constants/taxRates';
import type { HomeOwnerCount } from '@/types';

/**
 * 취득세 계산 (지방교육세 + 농어촌특별세 포함)
 *
 * 6억~9억 1주택 점진 공식:
 *   세율 = (취득가액(억원) × 2 - 3) / 100
 */
export function calculateAcquisitionTax(
  purchasePrice: number,
  numHomes: HomeOwnerCount,
  areaM2: number,
  isFirstHomeBuyer: boolean,
): {
  baseTax: number;
  localEducationTax: number;
  ruralSpecialTax: number;
  firstHomeReduction: number;
  total: number;
} {
  let baseRate: number;

  if (numHomes >= 3) {
    baseRate = 0.12;
  } else if (numHomes === 2) {
    if (purchasePrice <= 600_000_000) {
      baseRate = 0.01;
    } else if (purchasePrice <= 900_000_000) {
      baseRate = ((purchasePrice / 100_000_000) * 2 - 3) / 100;
    } else {
      baseRate = 0.03;
    }
  } else {
    // 1주택
    if (purchasePrice <= 600_000_000) {
      baseRate = 0.01;
    } else if (purchasePrice <= 900_000_000) {
      baseRate = ((purchasePrice / 100_000_000) * 2 - 3) / 100;
    } else {
      baseRate = 0.03;
    }
  }

  const baseTax = Math.floor(purchasePrice * baseRate);
  const localEducationTax = Math.floor(baseTax * 0.1);
  // 농어촌특별세: 전용면적 85㎡ 초과 시만 부과
  const ruralSpecialTax = areaM2 > 85 ? Math.floor(baseTax * 0.1) : 0;
  // 생애최초 구입 감면: 12억 이하 주택, 최대 200만원
  const firstHomeReduction =
    isFirstHomeBuyer && purchasePrice <= 1_200_000_000
      ? Math.min(baseTax, 2_000_000)
      : 0;

  const total = baseTax + localEducationTax + ruralSpecialTax - firstHomeReduction;
  return { baseTax, localEducationTax, ruralSpecialTax, firstHomeReduction, total };
}

/**
 * 재산세 계산
 * 공시가격 ≈ 매매가 × 70% (근사치)
 * 과세표준 = 공시가격 × 공정시장가액비율(60%)
 */
export function calculatePropertyTax(purchasePrice: number): number {
  const assessedValue = purchasePrice * 0.7;
  const taxBase = assessedValue * 0.6;

  for (const b of PROPERTY_TAX_BRACKETS) {
    if (taxBase <= b.maxBase) {
      return Math.max(0, Math.floor(taxBase * b.rate - b.cumulative));
    }
  }
  return 0;
}

/**
 * 종합부동산세 계산
 * 기본공제: 1세대 1주택 12억, 일반 9억
 */
export function calculateComprehensiveRealEstateTax(
  purchasePrice: number,
  numHomes: HomeOwnerCount,
): number {
  const assessedValue = purchasePrice * 0.7;
  const basicDeduction = numHomes === 1 ? 1_200_000_000 : 900_000_000;

  if (assessedValue <= basicDeduction) return 0;

  const taxBase = (assessedValue - basicDeduction) * 0.6;

  for (const b of COMPREHENSIVE_TAX_BRACKETS) {
    if (taxBase <= b.maxBase) {
      return Math.max(0, Math.floor(taxBase * b.rate - b.deduction));
    }
  }
  return 0;
}

/**
 * 양도소득세 계산
 *
 * 1세대 1주택 비과세: 2년 보유 + 2년 거주 + 양도가 12억 이하
 * 장기보유특별공제: 보유 3년 이상, 1세대 1주택 실거주 시 연 4% (최대 80%)
 */
export function calculateCapitalGainsTax(params: {
  purchasePrice: number;
  salePrice: number;
  acquisitionCosts: number;
  yearsHeld: number;
  numHomes: HomeOwnerCount;
  isResidence: boolean;
}): number {
  const { purchasePrice, salePrice, acquisitionCosts, yearsHeld, numHomes, isResidence } = params;

  const capitalGain = salePrice - purchasePrice - acquisitionCosts;
  if (capitalGain <= 0) return 0;

  // 1세대 1주택 비과세 판단
  if (numHomes === 1 && yearsHeld >= 2 && isResidence) {
    if (salePrice <= 1_200_000_000) return 0;
    // 12억 초과분만 과세
    const taxableGain = capitalGain * ((salePrice - 1_200_000_000) / salePrice);
    return applyCapitalGainsTaxRate(taxableGain, yearsHeld, isResidence);
  }

  return applyCapitalGainsTaxRate(capitalGain, yearsHeld, isResidence);
}

function applyCapitalGainsTaxRate(capitalGain: number, yearsHeld: number, isResidence: boolean): number {
  // 장기보유특별공제
  let deductionRate = 0;
  if (yearsHeld >= 3) {
    deductionRate = isResidence
      ? Math.min(yearsHeld * 0.04, 0.8)
      : Math.min(yearsHeld * 0.02, 0.3);
  }

  const afterDeduction = capitalGain * (1 - deductionRate);
  const taxableIncome = Math.max(afterDeduction - 2_500_000, 0);

  for (const b of CAPITAL_GAINS_TAX_BRACKETS) {
    if (taxableIncome <= b.maxBase) {
      return Math.max(0, Math.floor(taxableIncome * b.rate - b.deduction));
    }
  }
  return 0;
}


/**
 * 연도별 재산세 계산 (시세 상승 반영)
 */
export function calculatePropertyTaxByYear(
  purchasePrice: number,
  annualPriceChangeRate: number,
  year: number
): number {
  const currentMarketPrice = purchasePrice * Math.pow(1 + annualPriceChangeRate, year - 1);
  return calculatePropertyTax(currentMarketPrice);
}

/**
 * 연도별 종합부동산세 계산 (시세 상승 반영)
 */
export function calculateComprehensiveRealEstateTaxByYear(
  purchasePrice: number,
  numHomes: HomeOwnerCount,
  annualPriceChangeRate: number,
  year: number
): number {
  const currentMarketPrice = purchasePrice * Math.pow(1 + annualPriceChangeRate, year - 1);
  return calculateComprehensiveRealEstateTax(currentMarketPrice, numHomes);
}
