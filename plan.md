# 부동산 매수 vs 전세 vs 월세 비교 계산기 — 구현 계획서

> research.md 기반으로 작성된 웹 서비스 상세 구현 계획
>
> **설계 방향**: 모바일 최적화 · 최소 입력 · 토스 스타일 UI/UX
>
> **서비스 핵심 방향**
> - 🏦 **메인**: 시나리오별 순자산 변화 비교 — "N년 후 내 자산은 얼마인가"
> - 💸 **보조**: 시나리오별 비용 비교 — "얼마를 지출하는가"
> - 화면 구성·컴포넌트 배치·추천 문구 모두 자산 관점이 우선순위

---

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | **Next.js 14 (App Router)** | 클라이언트 전용 계산, Vercel 무료 배포, 코드 스플리팅 |
| 언어 | **TypeScript (strict)** | 세율 브라켓 인덱싱 오류 방지, 원화/비율 단위 혼용 방지 |
| 스타일링 | **Tailwind CSS + shadcn/ui** | 런타임 CSS-in-JS 오버헤드 없음, 접근성 컴포넌트 |
| 애니메이션 | **Framer Motion** | 토스 스타일 카드 전환, 바텀시트 슬라이드, 숫자 롤업 효과 |
| 차트 | **Recharts** | 순수 React API, SSR 호환, 세 가지 차트 타입 네이티브 지원 |
| 폼 상태 | **React Hook Form + Zod** | 유효성 검사 스키마 = TypeScript 타입 (단일 소스) |
| 앱 상태 | **Zustand** | 경량, Context 보일러플레이트 없음, devtools 내장 |
| 숫자 포맷 | **Intl.NumberFormat** (내장) | 외부 의존성 없이 한국 원화 형식 처리 |

---

## 2. 프로젝트 구조

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                         # / → /calculator 리다이렉트
│   │   └── calculator/
│   │       └── page.tsx                     # 메인 계산기 페이지 (모바일 단일 컬럼)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx                   # 상단 타이틀 + 초기화 버튼
│   │   │   └── BottomNav.tsx                # 하단 탭 (입력/결과/분석)
│   │   │
│   │   ├── inputs/
│   │   │   ├── PriceStepCard.tsx            # Step 1: 핵심 가격 입력 (3종 한번에)
│   │   │   ├── PeriodStepCard.tsx           # Step 2: 거주 기간 슬라이더
│   │   │   ├── AdvancedSheet.tsx            # 고급 설정 바텀시트 (선택사항)
│   │   │   ├── NumberPadInput.tsx           # 토스 스타일 숫자 키패드
│   │   │   ├── PresetButtons.tsx            # 금액 프리셋 버튼 (1억/3억/5억…)
│   │   │   └── SliderWithLabel.tsx          # 레이블 + 슬라이더 + 값 표시
│   │   │
│   │   ├── results/
│   │   │   ├── ResultStickyBar.tsx          # 화면 하단 고정: 추천 시나리오 + 순비용
│   │   │   ├── ScenarioSwipeCards.tsx       # 좌우 스와이프 가능한 시나리오 카드 3장
│   │   │   ├── WinnerBanner.tsx             # "이 조건에서는 월세가 유리해요" 배너
│   │   │   └── CostDetailSheet.tsx          # 비용 상세 바텀시트 (탭 클릭 시 열림)
│   │   │
│   │   └── charts/
│   │       ├── YearlyCostChart.tsx         # 연도별 누적 비용 (모바일 가로 스크롤)
│   │       ├── ScenarioBarChart.tsx        # 3가지 시나리오 비교
│   │       ├── BreakevenChart.tsx          # 손익분기 분석
│   │       └── AssetProjectionChart.tsx   # 순자산 변화 시뮬레이션 (핵심 신규)
│   │
│   ├── lib/
│   │   ├── calculations/
│   │   │   ├── index.ts                    # 공개 API 배럴
│   │   │   ├── buy.ts                      # 매수 계산 엔진
│   │   │   ├── jeonse.ts                   # 전세 계산 엔진
│   │   │   ├── monthlyRent.ts              # 월세 계산 엔진
│   │   │   ├── taxes.ts                    # 세금 계산 함수
│   │   │   ├── agentFees.ts                # 중개수수료 계산
│   │   │   ├── loanRepayment.ts            # 대출 상환 계산
│   │   │   └── breakeven.ts               # 손익분기/시계열 생성
│   │   │
│   │   ├── schemas/
│   │   │   ├── buySchema.ts
│   │   │   ├── jeonseSchema.ts
│   │   │   └── monthlyRentSchema.ts
│   │   │
│   │   ├── store/
│   │   │   └── calculatorStore.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── taxRates.ts                 # 세율 상수
│   │   │   └── defaults.ts                 # 기본값
│   │   │
│   │   └── utils/
│   │       ├── format.ts                   # 숫자 포맷팅
│   │       └── math.ts                     # 공통 수학 유틸
│   │
│   └── types/
│       └── index.ts                        # 도메인 타입 정의
│
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. 타입 정의 (`/src/types/index.ts`)

```typescript
/** 원화 금액 (정수) */
type Won = number;
/** 비율 (소수): 5% = 0.05 */
type Rate = number;
/** 연수 (양의 정수) */
type Years = number;

export type HomeOwnerCount = 1 | 2 | 3; // 1주택, 2주택, 3주택 이상

export type LoanRepaymentType =
  | 'equal_payment'    // 원리금균등상환
  | 'equal_principal'  // 원금균등상환
  | 'bullet';          // 만기일시상환

export type JeonseInsuranceProvider =
  | 'none'
  | 'hf'   // 주택금융공사 (0.04~0.18%)
  | 'hug'  // 주택도시보증공사 (0.111~0.211%)
  | 'sgi'; // 서울보증보험 (0.183~0.208%)

// ─── 입력 타입 ───────────────────────────────────────────────────────────────

export interface BuyInputs {
  purchasePrice: Won;           // 매매가격
  areaM2: number;               // 전용면적 (㎡)
  numHomes: HomeOwnerCount;     // 취득 후 보유 주택 수
  loanAmount: Won;              // 주택담보대출 금액
  loanRate: Rate;               // 대출 금리 (연)
  loanType: LoanRepaymentType;  // 상환 방식
  yearsToHold: Years;           // 예상 거주 기간
  annualPriceChangeRate: Rate;  // 예상 연간 주택가격 변동률
  annualIncome: Won;            // 연 소득 (세제혜택 계산용)
  isFirstHomeBuyer: boolean;    // 생애최초 주택 구입 여부
  isRegulatedZone: boolean;     // 조정대상지역 여부
}

export interface JeonseInputs {
  depositAmount: Won;
  loanAmount: Won;
  loanRate: Rate;
  insuranceProvider: JeonseInsuranceProvider;
  yearsToHold: Years;
  expectedInvestmentReturn: Rate;  // 기회비용 계산용
  annualIncome: Won;
}

export interface MonthlyRentInputs {
  depositAmount: Won;
  monthlyRent: Won;
  yearsToHold: Years;
  expectedInvestmentReturn: Rate;
  annualIncome: Won;
  areaM2: number;        // 세액공제 자격 확인
  marketPrice: Won;      // 기준시가 (세액공제 자격 확인)
}

// ─── 결과 타입 ───────────────────────────────────────────────────────────────

export interface BuyAssetGain {
  finalPropertyValue: Won;  // n년 후 예상 시세 = 매수가 × (1 + 변동률)^n
  priceGain: Won;           // 시세 상승분 = finalPropertyValue - purchasePrice
                            // (양도세는 이미 disposalCosts에 포함 → 별도 차감 불필요)
  effectiveCost: Won;       // 실질 주거비 = netTotal - priceGain
                            // 음수이면 매수로 오히려 이익
}

export interface CostBreakdown {
  initialCosts: {
    acquisitionTax: Won;    // 취득세 (지방교육세, 농특세 포함)
    agentFee: Won;
    legalFee: Won;
    bondDiscount: Won;
    registrationTax: Won;
    stampDuty: Won;
    total: Won;
  };
  annualHoldingCosts: {
    propertyTax: Won;
    comprehensiveTax: Won;
    maintenanceFee: Won;
    loanInterest: Won;
    total: Won;
  };
  disposalCosts: {
    capitalGainsTax: Won;
    agentFee: Won;
    total: Won;
  };
  taxBenefits: { firstHomeReduction: Won; total: Won };
  assetGain: BuyAssetGain;
  grandTotal: Won;
  netTotal: Won;       // 총 지출 비용 (자산이익 미반영)
  effectiveCost: Won;  // 실질 주거비 = netTotal - priceGain  ← 비교 기준값
}

export interface JeonseCostBreakdown {
  initialCosts: { agentFee: Won; insurancePremium: Won; total: Won };
  periodicCosts: { loanInterest: Won; opportunityCost: Won; total: Won };
  taxBenefits: { loanDeduction: Won; total: Won };
  grandTotal: Won;
  netTotal: Won;
}

export interface MonthlyRentCostBreakdown {
  initialCosts: { agentFee: Won; total: Won };
  periodicCosts: { totalRentPaid: Won; opportunityCost: Won; total: Won };
  taxBenefits: { rentTaxCredit: Won; total: Won };
  grandTotal: Won;
  netTotal: Won;
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

/**
 * 순자산 변화 시뮬레이션 — 연도별 데이터 포인트
 *
 * 공통 전제: 매수 자기자본(purchasePrice - loanAmount)을 초기 보유 현금으로 설정.
 * 전세·월세는 보증금 외의 여유 현금 + 매달 매수 대비 절약액을 투자수익률(opportunityRate)로 운용.
 */
export interface AssetProjectionPoint {
  year: number;
  buyNetAsset: Won;         // 부동산 순자산 = 시세(년도별) - 잔여대출
  jeonseNetAsset: Won;      // 전세 순자산 = 초기여유금 투자 + 월절약액 적립 + 보증금 - 전세대출
  monthlyRentNetAsset: Won; // 월세 순자산 = 초기여유금 투자 + 월절약액 적립 + 보증금
}

export interface CalculationResults {
  buy: CostBreakdown;
  jeonse: JeonseCostBreakdown;
  monthlyRent: MonthlyRentCostBreakdown;
  yearlyCostSeries: YearlyCostDataPoint[];
  breakevenSeries: BreakevenDataPoint[];
  assetProjectionSeries: AssetProjectionPoint[];  // 순자산 변화 시뮬레이션
  recommendation: 'buy' | 'jeonse' | 'monthlyRent';
}
```

---

## 4. 세율 상수 (`/src/lib/constants/taxRates.ts`)

```typescript
// 취득세 (3주택 이상 단일세율)
export const ACQUISITION_TAX_3PLUS = 0.12;

// 재산세 브라켓 [과세표준 상한, 세율, 누진공제]
export const PROPERTY_TAX_BRACKETS = [
  { maxBase: 60_000_000,   rate: 0.001,  cumulative: 0 },
  { maxBase: 150_000_000,  rate: 0.0015, cumulative: 60_000 },
  { maxBase: 300_000_000,  rate: 0.0025, cumulative: 195_000 },
  { maxBase: Infinity,     rate: 0.004,  cumulative: 570_000 },
] as const;

// 종합부동산세 브라켓 [과세표준 상한, 세율, 누진공제]
export const COMPREHENSIVE_TAX_BRACKETS = [
  { maxBase: 300_000_000,    rate: 0.005, deduction: 0 },
  { maxBase: 600_000_000,    rate: 0.007, deduction: 600_000 },
  { maxBase: 1_200_000_000,  rate: 0.010, deduction: 2_400_000 },
  { maxBase: 2_500_000_000,  rate: 0.013, deduction: 6_000_000 },
  { maxBase: 5_000_000_000,  rate: 0.015, deduction: 11_000_000 },
  { maxBase: 9_400_000_000,  rate: 0.020, deduction: 36_000_000 },
  { maxBase: Infinity,       rate: 0.027, deduction: 101_800_000 },
] as const;

// 양도소득세 브라켓 (기본세율) [과세표준 상한, 세율, 누진공제]
export const CAPITAL_GAINS_TAX_BRACKETS = [
  { maxBase: 14_000_000,    rate: 0.06, deduction: 0 },
  { maxBase: 50_000_000,    rate: 0.15, deduction: 1_260_000 },
  { maxBase: 88_000_000,    rate: 0.24, deduction: 5_760_000 },
  { maxBase: 150_000_000,   rate: 0.35, deduction: 15_440_000 },
  { maxBase: 300_000_000,   rate: 0.38, deduction: 19_940_000 },
  { maxBase: 500_000_000,   rate: 0.40, deduction: 25_940_000 },
  { maxBase: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { maxBase: Infinity,      rate: 0.45, deduction: 65_940_000 },
] as const;

// 매매 중개수수료 브라켓 [거래금액 상한, 요율, 한도액]
export const BUY_AGENT_FEE_BRACKETS = [
  { maxPrice: 50_000_000,    rate: 0.006, cap: 250_000 },
  { maxPrice: 200_000_000,   rate: 0.005, cap: 800_000 },
  { maxPrice: 900_000_000,   rate: 0.004, cap: null },
  { maxPrice: 1_200_000_000, rate: 0.005, cap: null },
  { maxPrice: 1_500_000_000, rate: 0.006, cap: null },
  { maxPrice: Infinity,      rate: 0.007, cap: null },
] as const;

// 임대차 중개수수료 브라켓 (전세/월세)
export const RENT_AGENT_FEE_BRACKETS = [
  { maxPrice: 50_000_000,    rate: 0.005, cap: 200_000 },
  { maxPrice: 100_000_000,   rate: 0.004, cap: 300_000 },
  { maxPrice: 600_000_000,   rate: 0.003, cap: null },
  { maxPrice: 1_200_000_000, rate: 0.004, cap: null },
  { maxPrice: 1_500_000_000, rate: 0.005, cap: null },
  { maxPrice: Infinity,      rate: 0.006, cap: null },
] as const;

// 전세보증보험 연간 보증료율 [최소, 최대]
export const JEONSE_INSURANCE_RATES = {
  none: { min: 0,       max: 0 },
  hf:   { min: 0.0004,  max: 0.0018 },   // 주택금융공사
  hug:  { min: 0.00111, max: 0.00211 },  // 주택도시보증공사
  sgi:  { min: 0.00183, max: 0.00208 },  // 서울보증보험
} as const;

// 법정 전월세전환율 상한 (기준금리 2.5% + 2%)
export const LEGAL_CONVERSION_RATE_CAP = 0.05;
```

---

## 5. 세금 계산 함수 (`/src/lib/calculations/taxes.ts`)

### 5.1 취득세

```typescript
import { PROPERTY_TAX_BRACKETS, COMPREHENSIVE_TAX_BRACKETS, CAPITAL_GAINS_TAX_BRACKETS } from '../constants/taxRates';
import type { HomeOwnerCount } from '../../types';

/**
 * 취득세 계산 (지방교육세 + 농어촌특별세 포함)
 *
 * 6억~9억 1주택 점진 공식:
 *   세율 = (취득가액(억) × 2 - 3) / 100
 */
export function calculateAcquisitionTax(
  purchasePrice: number,
  numHomes: HomeOwnerCount,
  areaM2: number,
  isFirstHomeBuyer: boolean
): { baseTax: number; localEducationTax: number; ruralSpecialTax: number; firstHomeReduction: number; total: number } {
  let baseRate: number;

  if (numHomes >= 3) {
    baseRate = 0.12;
  } else if (numHomes === 2) {
    if (purchasePrice <= 600_000_000) baseRate = 0.01;
    else if (purchasePrice <= 900_000_000) baseRate = ((purchasePrice / 100_000_000) * 2 - 3) / 100;
    else baseRate = 0.03;
  } else {
    // 1주택
    if (purchasePrice <= 600_000_000) baseRate = 0.01;
    else if (purchasePrice <= 900_000_000) baseRate = ((purchasePrice / 100_000_000) * 2 - 3) / 100;
    else baseRate = 0.03;
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
```

### 5.2 재산세 · 종합부동산세

```typescript
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
      return Math.floor(taxBase * b.rate - b.cumulative);
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
  numHomes: HomeOwnerCount
): number {
  const assessedValue = purchasePrice * 0.7;
  const basicDeduction = numHomes === 1 ? 1_200_000_000 : 900_000_000;

  if (assessedValue <= basicDeduction) return 0;

  const taxBase = (assessedValue - basicDeduction) * 0.6;

  for (const b of COMPREHENSIVE_TAX_BRACKETS) {
    if (taxBase <= b.maxBase) {
      return Math.floor(taxBase * b.rate - b.deduction);
    }
  }
  return 0;
}
```

### 5.3 양도소득세

```typescript
/**
 * 양도소득세 계산
 *
 * 1세대 1주택 비과세: 2년 보유 + 2년 거주 + 양도가 12억 이하
 * 장기보유특별공제: 보유 3년 이상, 1세대 1주택 실거주 시 연 4% (최대 80%)
 */
export function calculateCapitalGainsTax(params: {
  purchasePrice: number;
  salePrice: number;
  acquisitionCosts: number;  // 필요경비
  yearsHeld: number;
  numHomes: HomeOwnerCount;
  isResidence: boolean;      // 2년 이상 거주
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
      ? Math.min(yearsHeld * 0.04, 0.8)  // 1세대 1주택: 연 4%, 최대 80%
      : Math.min(yearsHeld * 0.02, 0.3); // 일반: 연 2%, 최대 30%
  }

  const afterDeduction = capitalGain * (1 - deductionRate);
  const taxableIncome = Math.max(afterDeduction - 2_500_000, 0); // 기본공제 250만원

  for (const b of CAPITAL_GAINS_TAX_BRACKETS) {
    if (taxableIncome <= b.maxBase) {
      return Math.floor(taxableIncome * b.rate - b.deduction);
    }
  }
  return 0;
}
```

---

## 6. 중개수수료 (`/src/lib/calculations/agentFees.ts`)

```typescript
import { BUY_AGENT_FEE_BRACKETS, RENT_AGENT_FEE_BRACKETS } from '../constants/taxRates';

function applyFeeBracket(
  amount: number,
  brackets: typeof BUY_AGENT_FEE_BRACKETS | typeof RENT_AGENT_FEE_BRACKETS
): number {
  for (const b of brackets) {
    if (amount <= b.maxPrice) {
      const calculated = Math.floor(amount * b.rate);
      return b.cap !== null ? Math.min(calculated, b.cap) : calculated;
    }
  }
  return 0;
}

/** 매매 중개수수료 */
export function calculateBuyAgentFee(purchasePrice: number): number {
  return applyFeeBracket(purchasePrice, BUY_AGENT_FEE_BRACKETS);
}

/**
 * 월세 거래금액 환산
 * 기본: 보증금 + (월세 × 100)
 * 5천만 미만 시: 보증금 + (월세 × 70)
 */
export function calculateMonthlyRentTransactionAmount(deposit: number, monthlyRent: number): number {
  const standard = deposit + monthlyRent * 100;
  return standard < 50_000_000 ? deposit + monthlyRent * 70 : standard;
}

/** 임대차 중개수수료 (전세/월세) */
export function calculateRentAgentFee(transactionAmount: number): number {
  return applyFeeBracket(transactionAmount, RENT_AGENT_FEE_BRACKETS);
}
```

---

## 7. 대출 상환 계산 (`/src/lib/calculations/loanRepayment.ts`)

```typescript
export interface LoanRepaymentResult {
  totalInterestPaid: number;
  yearlyInterestSchedule: number[];  // 연도별 이자 납부액
  remainingPrincipal: number;        // 보유 기간 종료 후 잔여 원금
  monthlyPayment: number;            // 월 실납부액(원리금 합계) — 순자산 비교 기준
}

/**
 * 원리금균등상환 (Annuity)
 * 월 상환액 = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateEqualPayment(
  principal: number,
  annualRate: number,
  totalYears: number,
  holdingYears: number
): LoanRepaymentResult {
  const r = annualRate / 12;
  const n = totalYears * 12;
  const monthlyPayment =
    r === 0 ? principal / n : (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

  let balance = principal;
  const yearlyInterestSchedule: number[] = [];
  let totalInterestPaid = 0;

  for (let year = 1; year <= holdingYears; year++) {
    let yearlyInterest = 0;
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const principalPayment = monthlyPayment - interest;
      yearlyInterest += interest;
      balance = Math.max(balance - principalPayment, 0);
    }
    yearlyInterestSchedule.push(Math.round(yearlyInterest));
    totalInterestPaid += yearlyInterest;
  }

  return {
    totalInterestPaid: Math.round(totalInterestPaid),
    yearlyInterestSchedule,
    remainingPrincipal: Math.round(balance),
  };
}

/**
 * 원금균등상환
 * 매월 원금 고정 = P / 총개월수
 * 이자 = 잔여원금 × 월이자율 (감소)
 */
export function calculateEqualPrincipal(
  principal: number,
  annualRate: number,
  totalYears: number,
  holdingYears: number
): LoanRepaymentResult {
  const r = annualRate / 12;
  const monthlyPrincipal = principal / (totalYears * 12);

  let balance = principal;
  const yearlyInterestSchedule: number[] = [];
  let totalInterestPaid = 0;

  for (let year = 1; year <= holdingYears; year++) {
    let yearlyInterest = 0;
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      yearlyInterest += interest;
      balance = Math.max(balance - monthlyPrincipal, 0);
    }
    yearlyInterestSchedule.push(Math.round(yearlyInterest));
    totalInterestPaid += yearlyInterest;
  }

  return {
    totalInterestPaid: Math.round(totalInterestPaid),
    yearlyInterestSchedule,
    remainingPrincipal: Math.round(balance),
  };
}

/**
 * 만기일시상환 (이자만 납부)
 * 전세대출, 일부 주택담보대출에서 사용
 */
export function calculateBullet(
  principal: number,
  annualRate: number,
  holdingYears: number
): LoanRepaymentResult {
  const yearlyInterest = Math.round(principal * annualRate);
  return {
    totalInterestPaid: yearlyInterest * holdingYears,
    yearlyInterestSchedule: Array(holdingYears).fill(yearlyInterest),
    remainingPrincipal: principal,
  };
}

export function calculateLoanRepayment(
  principal: number,
  annualRate: number,
  loanType: 'equal_payment' | 'equal_principal' | 'bullet',
  totalLoanYears: number,
  holdingYears: number
): LoanRepaymentResult {
  switch (loanType) {
    case 'equal_payment':   return calculateEqualPayment(principal, annualRate, totalLoanYears, holdingYears);
    case 'equal_principal': return calculateEqualPrincipal(principal, annualRate, totalLoanYears, holdingYears);
    case 'bullet':          return calculateBullet(principal, annualRate, holdingYears);
  }
}
```

---

## 8. 시나리오별 계산 엔진

### 8.1 매수 계산 (`/src/lib/calculations/buy.ts`)

```typescript
import type { BuyInputs, CostBreakdown } from '../../types';
import { calculateAcquisitionTax, calculatePropertyTax,
         calculateComprehensiveRealEstateTax, calculateCapitalGainsTax } from './taxes';
import { calculateBuyAgentFee } from './agentFees';
import { calculateLoanRepayment } from './loanRepayment';

function estimateLegalFee(price: number): number {
  if (price <= 100_000_000) return 300_000;
  if (price <= 300_000_000) return 450_000;
  if (price <= 600_000_000) return 600_000;
  return 800_000;
}

function estimateBondDiscountCost(price: number): number {
  return Math.floor(price * 0.004); // 시가표준액 × 매입률 × 할인율 근사
}

function calcRegistrationCosts(price: number) {
  const registrationTax = Math.floor(price * 0.002); // 0.2%
  const stampDuty =
    price >= 1_000_000_000 ? 350_000 :
    price >= 100_000_000   ? 150_000 : 0;
  return { registrationTax, stampDuty };
}

function estimateAnnualMaintenanceFee(areaM2: number): number {
  return Math.floor(areaM2 * 2_920 * 12); // 전국 평균 ㎡당 월 2,920원
}

export function calculateBuyScenario(inputs: BuyInputs): CostBreakdown {
  const { purchasePrice, areaM2, numHomes, loanAmount, loanRate,
          loanType, yearsToHold, annualPriceChangeRate, isFirstHomeBuyer } = inputs;

  // 초기 비용
  const acqTax = calculateAcquisitionTax(purchasePrice, numHomes, areaM2, isFirstHomeBuyer);
  const buyAgentFee = calculateBuyAgentFee(purchasePrice);
  const legalFee = estimateLegalFee(purchasePrice);
  const bondDiscount = estimateBondDiscountCost(purchasePrice);
  const { registrationTax, stampDuty } = calcRegistrationCosts(purchasePrice);
  const initialTotal = acqTax.total + buyAgentFee + legalFee + bondDiscount + registrationTax + stampDuty;

  // 연간 보유비용
  const propertyTax = calculatePropertyTax(purchasePrice);
  const comprehensiveTax = calculateComprehensiveRealEstateTax(purchasePrice, numHomes);
  const maintenanceFee = estimateAnnualMaintenanceFee(areaM2);
  const loanSchedule = calculateLoanRepayment(loanAmount, loanRate, loanType, 30, yearsToHold);
  const annualLoanInterest = loanSchedule.yearlyInterestSchedule[0] ?? 0;
  const annualHoldingTotal = propertyTax + comprehensiveTax + maintenanceFee + annualLoanInterest;

  // 처분 비용
  const salePrice = Math.floor(purchasePrice * Math.pow(1 + annualPriceChangeRate, yearsToHold));
  const sellAgentFee = calculateBuyAgentFee(salePrice);
  const capitalGainsTax = calculateCapitalGainsTax({
    purchasePrice, salePrice,
    acquisitionCosts: initialTotal,
    yearsHeld: yearsToHold,
    numHomes,
    isResidence: true,
  });
  const disposalTotal = capitalGainsTax + sellAgentFee;

  const grandTotal = initialTotal + annualHoldingTotal * yearsToHold + disposalTotal;
  const netTotal = grandTotal - acqTax.firstHomeReduction;

  // ─── 자산 이익 계산 ────────────────────────────────────────────────────────
  // 시세 상승분 (priceGain): 양도소득세는 이미 disposalCosts에 포함되어 있으므로
  // 별도 차감 없이 gross 상승분만 자산이익으로 인정
  const priceGain = salePrice - purchasePrice;
  // 실질 주거비: 총지출 - 자산가치 상승분
  // → 음수이면 매수로 오히려 순이익 발생
  const effectiveCost = netTotal - priceGain;

  return {
    initialCosts: { acquisitionTax: acqTax.total, agentFee: buyAgentFee, legalFee,
                    bondDiscount, registrationTax, stampDuty, total: initialTotal },
    annualHoldingCosts: { propertyTax, comprehensiveTax, maintenanceFee,
                          loanInterest: annualLoanInterest, total: annualHoldingTotal },
    disposalCosts: { capitalGainsTax, agentFee: sellAgentFee, total: disposalTotal },
    taxBenefits: { firstHomeReduction: acqTax.firstHomeReduction, total: acqTax.firstHomeReduction },
    assetGain: {
      finalPropertyValue: salePrice,
      priceGain,
      effectiveCost,
    },
    grandTotal,
    netTotal,
    effectiveCost,  // 비교 기준값 (전세·월세의 netTotal과 대등 비교)
  };
}
```

### 8.2 전세 계산 (`/src/lib/calculations/jeonse.ts`)

```typescript
import type { JeonseInputs, JeonseCostBreakdown } from '../../types';
import { calculateRentAgentFee } from './agentFees';
import { JEONSE_INSURANCE_RATES } from '../constants/taxRates';

function calcInsurancePremium(deposit: number, provider: JeonseInputs['insuranceProvider'], years: number): number {
  const { min, max } = JEONSE_INSURANCE_RATES[provider];
  if (max === 0) return 0;
  return Math.floor(deposit * ((min + max) / 2) * years); // 중간값 사용
}

function calcJeonseLoanDeduction(annualIncome: number, annualInterest: number): number {
  const deductibleAmount = Math.min(annualInterest, 4_000_000); // 한도 400만원
  const deductionAmount = deductibleAmount * 0.4;               // 40% 공제
  const marginalRate = annualIncome <= 55_000_000 ? 0.15 : 0.24;
  return Math.floor(deductionAmount * marginalRate);
}

export function calculateJeonseScenario(inputs: JeonseInputs): JeonseCostBreakdown {
  const { depositAmount, loanAmount, loanRate, insuranceProvider,
          yearsToHold, expectedInvestmentReturn, annualIncome } = inputs;

  const agentFee = calculateRentAgentFee(depositAmount);
  const insurancePremium = calcInsurancePremium(depositAmount, insuranceProvider, yearsToHold);
  const initialTotal = agentFee + insurancePremium;

  // 전세대출은 통상 만기일시상환 (이자만)
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
```

### 8.3 월세 계산 (`/src/lib/calculations/monthlyRent.ts`)

```typescript
import type { MonthlyRentInputs, MonthlyRentCostBreakdown } from '../../types';
import { calculateMonthlyRentTransactionAmount, calculateRentAgentFee } from './agentFees';

function calcRentTaxCredit(annualIncome: number, annualRent: number, areaM2: number, marketPrice: number): number {
  const isEligible = (areaM2 <= 85 || marketPrice <= 400_000_000) && annualIncome <= 80_000_000;
  if (!isEligible) return 0;

  const cappedRent = Math.min(annualRent, 10_000_000); // 한도 1,000만원
  const creditRate = annualIncome <= 55_000_000 ? 0.17 : 0.15;
  return Math.floor(cappedRent * creditRate);
}

export function calculateMonthlyRentScenario(inputs: MonthlyRentInputs): MonthlyRentCostBreakdown {
  const { depositAmount, monthlyRent, yearsToHold,
          expectedInvestmentReturn, annualIncome, areaM2, marketPrice } = inputs;

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
```

---

## 9. 시계열 · 손익분기 생성 (`/src/lib/calculations/breakeven.ts`)

```typescript
import type { BuyInputs, JeonseInputs, MonthlyRentInputs,
              YearlyCostDataPoint, BreakevenDataPoint } from '../../types';
import { calculateBuyScenario } from './buy';
import { calculateJeonseScenario } from './jeonse';
import { calculateMonthlyRentScenario } from './monthlyRent';

/**
 * 연도별 누적 비용 시계열 생성
 * 각 연도에 대해 시나리오를 독립적으로 재계산 (정확성 보장)
 */
export function generateYearlyCostSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
  maxYears: number
): YearlyCostDataPoint[] {
  return Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    return {
      year,
      // 매수는 effectiveCost(자산이익 반영), 전세·월세는 netTotal
      buyCumulative:         calculateBuyScenario({ ...buyInputs, yearsToHold: year }).effectiveCost,
      jeonseCumulative:      calculateJeonseScenario({ ...jeonseInputs, yearsToHold: year }).netTotal,
      monthlyRentCumulative: calculateMonthlyRentScenario({ ...monthlyRentInputs, yearsToHold: year }).netTotal,
    };
  });
}

/**
 * 손익분기 분석: 주택가격 연간 변동률 -10%~+15% 범위
 * 전세/월세는 가격 변동률과 무관하므로 1회만 계산
 */
export function generateBreakevenSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs
): BreakevenDataPoint[] {
  const rates = [-0.10, -0.08, -0.05, -0.03, -0.01, 0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.12, 0.15];
  const jeonseNet = calculateJeonseScenario(jeonseInputs).netTotal;
  const rentNet = calculateMonthlyRentScenario(monthlyRentInputs).netTotal;

  return rates.map((rate) => ({
    annualPriceChangeRate: rate,
    // 가격변동률이 달라지면 자산이익도 달라지므로 effectiveCost 사용
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
  conversionRate: number = 0.05
): number {
  return Math.floor(((jeonseDeposit - newDeposit) * conversionRate) / 12);
}

/**
 * 순자산 변화 시뮬레이션 시계열 생성
 *
 * 목적: 동일한 초기 자본(매수 자기자본 = 매매가 - 대출)을 기준으로
 *       각 시나리오의 순자산이 시간에 따라 어떻게 달라지는지 비교.
 *
 * ─── 핵심 로직 ────────────────────────────────────────────────────
 *
 * [공통 기준]
 *   buyEquity = purchasePrice - loanAmount  ← 초기 보유 현금
 *
 * [매수 월 현금지출]
 *   buyMonthlyOutflow = loanSchedule.monthlyPayment   // 원리금 (원금+이자)
 *                     + propertyTax / 12
 *                     + maintenanceFee / 12
 *
 * [전세 월 현금지출] (실제 현금만, 기회비용 제외)
 *   jeonseMonthlyOutflow = jeonseInputs.loanAmount × loanRate / 12
 *
 * [월세 월 현금지출]
 *   rentMonthlyOutflow = monthlyRentInputs.monthlyRent
 *
 * [초기 여유금] — 매수 자기자본에서 각 시나리오 보증금 자부담 제외
 *   jeonseOwnDeposit         = depositAmount - jeonseInputs.loanAmount
 *   jeonseInitialInvestable  = max(0, buyEquity - jeonseOwnDeposit)
 *   rentInitialInvestable    = max(0, buyEquity - rentDeposit)
 *
 * [월 절약액] — 매수 월지출 대비 절약분 → 매달 투자
 *   jeonseMonthlySaving = buyMonthlyOutflow - jeonseMonthlyOutflow
 *   rentMonthlySaving   = buyMonthlyOutflow - rentMonthlyOutflow
 *   (음수면 해당 시나리오가 더 비쌈 → 자산 차감)
 *
 * ─── 연도별 순자산 계산 ────────────────────────────────────────────
 *
 * r = jeonseInputs.expectedInvestmentReturn  // 투자수익률 (기본 4%)
 * months = year × 12
 *
 * [매수]
 *   salePrice(year)   = purchasePrice × (1 + annualPriceChangeRate)^year
 *   remainingLoan(year) = calculateLoanRepayment(..., year).remainingPrincipal
 *   buyNetAsset       = salePrice(year) - remainingLoan(year)
 *
 * [전세] — FV: 미래가치 = 현재가치 × 복리 | 연금 미래가치 공식
 *   FV_initial  = jeonseInitialInvestable × (1+r)^year
 *   FV_saving   = jeonseMonthlySaving × [(1+r/12)^months - 1] / (r/12)
 *   jeonseNetAsset = FV_initial + FV_saving + depositAmount - jeonseInputs.loanAmount
 *
 * [월세]
 *   FV_initial  = rentInitialInvestable × (1+r)^year
 *   FV_saving   = rentMonthlySaving × [(1+r/12)^months - 1] / (r/12)
 *   rentNetAsset = FV_initial + FV_saving + depositAmount
 *
 * ─── 코드 스니펫 ──────────────────────────────────────────────────
 */
export function generateAssetProjectionSeries(
  buyInputs: BuyInputs,
  jeonseInputs: JeonseInputs,
  monthlyRentInputs: MonthlyRentInputs,
): AssetProjectionPoint[] {
  const { purchasePrice, loanAmount, loanRate, loanType, annualPriceChangeRate, yearsToHold } = buyInputs;
  const r = jeonseInputs.expectedInvestmentReturn;

  // 매수 월 현금지출 계산 (1년치 스케줄에서 역산)
  const buyFullSchedule = calculateLoanRepayment(loanAmount, loanRate, loanType, 30, yearsToHold);
  const buyMonthlyMortgage = buyFullSchedule.monthlyPayment;
  const propertyTax = calculatePropertyTax(purchasePrice);
  const maintenanceFee = estimateAnnualMaintenanceFee(buyInputs.areaM2);
  const buyMonthlyOutflow = buyMonthlyMortgage + (propertyTax + maintenanceFee) / 12;

  // 전세 월 현금지출 (이자만 — 전세대출은 보통 만기일시상환)
  const jeonseMonthlyOutflow = jeonseInputs.loanAmount * jeonseInputs.loanRate / 12;

  // 월세 월 현금지출
  const rentMonthlyOutflow = monthlyRentInputs.monthlyRent;

  // 초기 여유금
  const buyEquity = purchasePrice - loanAmount;
  const jeonseOwnDeposit = Math.max(0, jeonseInputs.depositAmount - jeonseInputs.loanAmount);
  const jeonseInitialInvestable = Math.max(0, buyEquity - jeonseOwnDeposit);
  const rentInitialInvestable = Math.max(0, buyEquity - monthlyRentInputs.depositAmount);

  // 월 절약액
  const jeonseMonthlySaving = buyMonthlyOutflow - jeonseMonthlyOutflow;
  const rentMonthlySaving   = buyMonthlyOutflow - rentMonthlyOutflow;

  return Array.from({ length: yearsToHold }, (_, i) => {
    const year = i + 1;
    const months = year * 12;

    // 매수 순자산
    const salePrice = Math.floor(purchasePrice * Math.pow(1 + annualPriceChangeRate, year));
    const remainingLoan = calculateLoanRepayment(loanAmount, loanRate, loanType, 30, year).remainingPrincipal;
    const buyNetAsset = salePrice - remainingLoan;

    // 복리 계수 (연금 미래가치)
    const fvFactor = r > 0
      ? (Math.pow(1 + r / 12, months) - 1) / (r / 12)
      : months;

    // 전세 순자산
    const fvInitialJeonse = jeonseInitialInvestable * Math.pow(1 + r, year);
    const fvSavingJeonse  = jeonseMonthlySaving * fvFactor;
    const jeonseNetAsset  = Math.round(
      fvInitialJeonse + fvSavingJeonse + jeonseInputs.depositAmount - jeonseInputs.loanAmount,
    );

    // 월세 순자산
    const fvInitialRent = rentInitialInvestable * Math.pow(1 + r, year);
    const fvSavingRent  = rentMonthlySaving * fvFactor;
    const monthlyRentNetAsset = Math.round(
      fvInitialRent + fvSavingRent + monthlyRentInputs.depositAmount,
    );

    return { year, buyNetAsset, jeonseNetAsset, monthlyRentNetAsset };
  });
}
```

---

## 10. Zustand 스토어 (`/src/lib/store/calculatorStore.ts`)

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { BuyInputs, JeonseInputs, MonthlyRentInputs, CalculationResults } from '../../types';
import { DEFAULT_BUY_INPUTS, DEFAULT_JEONSE_INPUTS, DEFAULT_MONTHLY_RENT_INPUTS } from '../constants/defaults';
import { calculateBuyScenario } from '../calculations/buy';
import { calculateJeonseScenario } from '../calculations/jeonse';
import { calculateMonthlyRentScenario } from '../calculations/monthlyRent';
import { generateYearlyCostSeries, generateBreakevenSeries } from '../calculations/breakeven';

interface CalculatorState {
  buyInputs: BuyInputs;
  jeonseInputs: JeonseInputs;
  monthlyRentInputs: MonthlyRentInputs;
  results: CalculationResults | null;
  activeTab: 'buy' | 'jeonse' | 'monthlyRent';

  updateBuyInputs: (partial: Partial<BuyInputs>) => void;
  updateJeonseInputs: (partial: Partial<JeonseInputs>) => void;
  updateMonthlyRentInputs: (partial: Partial<MonthlyRentInputs>) => void;
  calculate: () => void;
  resetAll: () => void;
  setActiveTab: (tab: CalculatorState['activeTab']) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  devtools((set, get) => ({
    buyInputs: DEFAULT_BUY_INPUTS,
    jeonseInputs: DEFAULT_JEONSE_INPUTS,
    monthlyRentInputs: DEFAULT_MONTHLY_RENT_INPUTS,
    results: null,
    activeTab: 'buy',

    updateBuyInputs: (partial) =>
      set((s) => ({ buyInputs: { ...s.buyInputs, ...partial } })),

    updateJeonseInputs: (partial) =>
      set((s) => ({ jeonseInputs: { ...s.jeonseInputs, ...partial } })),

    updateMonthlyRentInputs: (partial) =>
      set((s) => ({ monthlyRentInputs: { ...s.monthlyRentInputs, ...partial } })),

    calculate: () => {
      const { buyInputs, jeonseInputs, monthlyRentInputs } = get();

      const buy = calculateBuyScenario(buyInputs);
      const jeonse = calculateJeonseScenario(jeonseInputs);
      const monthlyRent = calculateMonthlyRentScenario(monthlyRentInputs);

      const yearlyCostSeries = generateYearlyCostSeries(
        buyInputs, jeonseInputs, monthlyRentInputs, buyInputs.yearsToHold
      );
      const breakevenSeries = generateBreakevenSeries(buyInputs, jeonseInputs, monthlyRentInputs);

      // 매수는 effectiveCost(실질 주거비), 전세·월세는 netTotal로 대등 비교
      const nets = {
        buy: buy.effectiveCost,          // 실질 주거비 = netTotal - 시세상승분
        jeonse: jeonse.netTotal,
        monthlyRent: monthlyRent.netTotal,
      };
      const recommendation = Object.entries(nets).reduce((a, b) => (b[1] < a[1] ? b : a))[0] as
        'buy' | 'jeonse' | 'monthlyRent';

      set({ results: { buy, jeonse, monthlyRent, yearlyCostSeries, breakevenSeries, recommendation } });
    },

    resetAll: () => set({
      buyInputs: DEFAULT_BUY_INPUTS,
      jeonseInputs: DEFAULT_JEONSE_INPUTS,
      monthlyRentInputs: DEFAULT_MONTHLY_RENT_INPUTS,
      results: null,
    }),

    setActiveTab: (tab) => set({ activeTab: tab }),
  }), { name: 'CalculatorStore' })
);
```

---

## 11. 숫자 포맷 유틸 (`/src/lib/utils/format.ts`)

```typescript
/**
 * 금액을 읽기 쉬운 형식으로 변환
 * 1억 이상 → "X.X억원", 만 이상 → "X만원", 미만 → "X원"
 */
export function formatWon(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}억원`;
  if (abs >= 10_000)      return `${sign}${Math.round(abs / 10_000).toLocaleString('ko-KR')}만원`;
  return `${sign}${abs.toLocaleString('ko-KR')}원`;
}

/** 입력 필드용: 쉼표 포함 정수 문자열 → 숫자 */
export function parseWonInput(input: string): number {
  return parseInt(input.replace(/,/g, ''), 10) || 0;
}

/** 퍼센트 포맷 */
export function formatRate(rate: number, decimals = 1): string {
  return `${(rate * 100).toFixed(decimals)}%`;
}
```

---

## 12. 모바일 UX 설계 원칙 (토스 스타일)

### 12.1 핵심 원칙

| 원칙 | 구현 방법 |
|------|-----------|
| **최소 입력** | 필수 입력 3개 → 나머지는 스마트 기본값 자동 적용 |
| **즉각 피드백** | 입력값 변경 시 300ms debounce 후 결과 즉시 갱신 |
| **점진적 공개** | 기본 설정 → "상세 설정" 토글로 고급 옵션 숨김 |
| **터치 친화적** | 최소 터치 영역 48px, 슬라이더 위주 인터페이스 |
| **단색 강조** | 흰 배경 + 단일 브랜드 컬러 (#3182F6 토스 블루) |

### 12.2 입력 필드 최소화 전략

#### 필수 입력 (사용자가 반드시 입력)
```
매수: 매매가격
전세: 전세보증금
월세: 보증금 + 월세
```

#### 스마트 기본값 (사용자 개입 불필요)
```
대출금액     → 매매가 × 60% (LTV 기본값)
대출금리     → 3.8% (2025 시중은행 평균)
거주기간     → 5년 (슬라이더, 1~20년)
가격변동률   → 3% (서울 장기 평균)
기대수익률   → 4% (예적금 + α 기준)
보험가입     → HUG 기본
연 소득      → 5,000만원 (세제혜택 계산)
```

#### 고급 설정 (바텀시트에 숨김)
- 주택 수, 상환 방식, 생애최초 여부, 조정대상지역
- 면적 (세액공제 자격 계산용)

### 12.3 화면 구성 (모바일 단일 컬럼)

```
┌─────────────────────────┐
│  ← 주거비 비교 계산기   ↺ │  ← TopBar (뒤로가기 + 초기화)
├─────────────────────────┤
│                         │
│  Step 1. 주택 정보 입력  │
│  ┌──────────────────┐   │
│  │ 매수가격         │   │  ← 큰 텍스트 + 단위 (억원)
│  │ [   6억 원    ]  │   │  ← 탭하면 숫자 키패드 등장
│  └──────────────────┘   │
│  ┌───────┐ ┌────────┐   │
│  │전세가 │ │ 월 세  │   │  ← 나란히 2열
│  │4.5억  │ │150만/월│   │
│  └───────┘ └────────┘   │
│                         │
│  Step 2. 거주 예정 기간  │
│  ━━━━━━━━●━━━━━━━━━━━   │  ← 슬라이더
│       5년               │
│  [1년][3년][5년][10년]  │  ← 프리셋 버튼
│                         │
│  ⚙ 상세 설정 >          │  ← 펼치면 고급 옵션 바텀시트
│                         │
├─────────────────────────┤
│  ✅ 전세가 N년 후 자산   │  ← WinnerBanner (자산 기준 추천 — 메인)
│     이 가장 많아요       │
│  매수보다 X억 더 유리    │
├─────────────────────────┤
│                         │
│  💰 N년 후 내 자산은?    │  ← [메인] AssetProjectionChart
│  ─ 매수 순자산 (파랑)   │     시나리오별 순자산 변화 라인 차트
│  ─ 전세 순자산 (주황)   │     투자수익률 가정 명시
│  ─ 월세 순자산 (민트)   │
│                         │
├─────────────────────────┤
│                         │
│  ← 매수  전세  월세 →   │  ← [보조] ScenarioSwipeCards (비용 요약)
│  ┌─────────────────┐    │     스와이프 카드 — 비용 비교
│  │     월세        │    │
│  │  순비용 9,330만 │    │
│  │  월 환산 155만  │    │
│  │  [상세 보기]    │    │  ← 탭 → CostDetailSheet 바텀시트
│  └─────────────────┘    │
│      ● ○ ○              │  ← 페이지 인디케이터
│                         │
│  📈 연도별 비용 추이     │  ← [보조] 비용 상세 차트들
│  [YearlyCostChart]       │
│                         │
│  🎯 집값 몇 % 올라야     │
│     매수가 유리할까?     │
│  [BreakevenChart]        │
│                         │
└─────────────────────────┘
```

### 12.4 색상 시스템

```
브랜드 컬러:  #3182F6  (토스 블루)
배경:         #F9FAFB  (Gray-50)
카드 배경:    #FFFFFF
텍스트 주:    #191F28  (Gray-900)
텍스트 부:    #8B95A1  (Gray-500)
성공/절약:    #00B493  (Green)
경고/비용:    #FF6B6B  (Red)
```

| 시나리오 | 색상 | Hex |
|---------|------|-----|
| 매수    | 토스 블루 | `#3182F6` |
| 전세    | 주황     | `#F59E0B` |
| 월세    | 민트     | `#00B493` |

### 12.5 UI 일관성 원칙 (불변 규칙)

> 이 규칙은 모든 컴포넌트 작업 시 반드시 준수한다. 회귀 방지용 체크리스트.

#### 규칙 1 — 같은 행 아이템의 높이는 항상 동일해야 한다

- 2열 나란히 배치 시 반드시 `grid grid-cols-2 items-stretch` 사용
- 각 카드 내부 버튼/컨테이너에 `h-full` 적용
- 한쪽 카드에만 `description` 등 추가 줄이 있으면 반대쪽에도 동일 높이 요소 추가

#### 규칙 2 — 스와이프 카드의 모든 카드 높이는 동일해야 한다

- 가변 콘텐츠(추천 배지, 추가 섹션 등) 유무로 높이가 달라지는 요소는 **고정 높이 wrapper**로 감싼다
- 추천 배지: `<div className="h-7 mb-1">` 로 항상 동일 공간 확보
- 추가 데이터 섹션(매수 자산이익 3행): 없는 카드에 `invisible` placeholder 3행 추가

#### 규칙 3 — 스와이프는 항상 자연스러워야 한다

필수 패턴 (어기면 첫 번째 아이템이 노출되거나 이동이 튀는 버그 발생):

```
✅ useLayoutEffect — paint 전 동기 측정 (useEffect 금지)
✅ ResizeObserver  — 반응형 폭 자동 갱신
✅ dragMomentum={false} — framer-motion 내장 모멘텀 비활성화
✅ x.set() — 초기 위치 즉시 보정 (animate() 금지)
✅ onDragEnd에서 ref.current?.offsetWidth 직접 측정
```

금지 패턴:
```
❌ useEffect로 containerWidth 측정 → 첫 프레임 cardWidth=0 노출
❌ animate={{ x }} + drag 혼용 → state 충돌로 snap 시 튐
❌ dragMomentum 기본값(true) → 자체 snap 로직과 충돌
```

#### 규칙 4 — 서비스 우선순위: 자산 비교 > 비용 비교

- 페이지 최상단 결과 영역: 자산 변화 차트 (AssetProjectionChart) 배치
- WinnerBanner: 자산 관점 기준 문구 우선
- 비용 비교 카드·차트: 자산 차트 하단에 배치

---

### 12.6 핵심 모바일 컴포넌트 패턴

#### NumberPadInput — 토스 스타일 숫자 입력

```tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  value: number;
  onChange: (value: number) => void;
  unit?: string;       // "억원", "만원", "만원/월"
  label: string;
}

export function NumberPadInput({ value, onChange, unit = '만원', label }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = formatWonCompact(value); // "6억", "4.5억", "150만"

  return (
    <>
      {/* 탭 가능한 입력 카드 */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white rounded-2xl p-5 text-left shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
      >
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {displayValue}
          <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>
        </p>
      </button>

      {/* 바텀시트 + 숫자 키패드 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
            <motion.div
              className="relative bg-white rounded-t-3xl px-5 pt-5 pb-10"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            >
              <p className="text-center text-lg font-bold mb-2">{label}</p>
              <p className="text-center text-4xl font-bold text-blue-500 mb-6">
                {displayValue} <span className="text-xl text-gray-400">{unit}</span>
              </p>
              {/* 프리셋 버튼 */}
              <div className="flex gap-2 mb-4">
                {getPresets(unit).map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onChange(preset.value)}
                    className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 active:bg-blue-50 active:text-blue-600"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {/* 슬라이더 */}
              <input
                type="range"
                min={0}
                max={getMax(unit)}
                step={getStep(unit)}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="mt-5 w-full py-4 bg-blue-500 text-white rounded-2xl text-lg font-bold"
              >
                확인
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getPresets(unit: string) {
  if (unit === '억원') return [
    { label: '3억', value: 300_000_000 },
    { label: '5억', value: 500_000_000 },
    { label: '7억', value: 700_000_000 },
    { label: '10억', value: 1_000_000_000 },
  ];
  if (unit === '만원/월') return [
    { label: '50만', value: 500_000 },
    { label: '100만', value: 1_000_000 },
    { label: '150만', value: 1_500_000 },
    { label: '200만', value: 2_000_000 },
  ];
  return [];
}
```

#### ScenarioSwipeCards — 스와이프 카드

```tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const SCENARIOS = ['buy', 'jeonse', 'monthlyRent'] as const;
const LABELS = { buy: '매수', jeonse: '전세', monthlyRent: '월세' };
const COLORS = { buy: '#3182F6', jeonse: '#F59E0B', monthlyRent: '#00B493' };

export function ScenarioSwipeCards({ results, onDetailOpen }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative overflow-hidden">
      {/* 카드 컨테이너 */}
      <motion.div
        className="flex"
        animate={{ x: `-${activeIndex * 100}%` }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {SCENARIOS.map((scenario) => {
          const result = results[scenario];
          // 매수는 effectiveCost(실질 주거비), 전세·월세는 netTotal로 비교
          const compareValue = scenario === 'buy'
            ? results.buy.effectiveCost
            : result.netTotal;
          const isWinner = compareValue === Math.min(
            results.buy.effectiveCost,
            results.jeonse.netTotal,
            results.monthlyRent.netTotal
          );
          return (
            <div key={scenario} className="w-full flex-shrink-0 px-4">
              <div
                className="bg-white rounded-3xl p-6 shadow-sm border"
                style={{ borderColor: isWinner ? COLORS[scenario] : '#E5E7EB' }}
              >
                {isWinner && (
                  <span
                    className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white mb-3"
                    style={{ backgroundColor: COLORS[scenario] }}
                  >
                    추천
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900">{LABELS[scenario]}</h3>
                <p className="text-3xl font-bold mt-2" style={{ color: COLORS[scenario] }}>
                  {formatWon(result.netTotal)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  월 평균 {formatWon(Math.round(result.netTotal / (inputs.yearsToHold * 12)))}
                </p>
                <button
                  onClick={() => onDetailOpen(scenario)}
                  className="mt-4 w-full py-3 rounded-2xl text-sm font-medium"
                  style={{ backgroundColor: COLORS[scenario] + '15', color: COLORS[scenario] }}
                >
                  상세 내역 보기
                </button>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* 페이지 인디케이터 */}
      <div className="flex justify-center gap-2 mt-4">
        {SCENARIOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`rounded-full transition-all ${i === activeIndex ? 'w-6 h-2 bg-blue-500' : 'w-2 h-2 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
```

#### WinnerBanner — 결과 요약 배너

```tsx
export function WinnerBanner({ results, yearsToHold }: Props) {
  // 매수는 effectiveCost(자산이익 반영), 전세·월세는 netTotal로 대등 비교
  const nets = {
    buy: results.buy.effectiveCost,
    jeonse: results.jeonse.netTotal,
    monthlyRent: results.monthlyRent.netTotal,
  };
  const winner = Object.entries(nets).reduce((a, b) => b[1] < a[1] ? b : a);
  const secondBest = Object.entries(nets).sort((a, b) => a[1] - b[1])[1];
  const saving = secondBest[1] - winner[1];
  const label = { buy: '매수', jeonse: '전세', monthlyRent: '월세' }[winner[0]];
  const monthlySaving = Math.round(saving / (yearsToHold * 12));

  return (
    <motion.div
      className="mx-4 rounded-2xl p-4 text-white"
      style={{ background: 'linear-gradient(135deg, #3182F6, #00B493)' }}
      layout
    >
      <p className="text-sm opacity-80">현재 조건에서는</p>
      <p className="text-xl font-bold mt-1">
        <span className="text-yellow-300">{label}</span>가 가장 유리해요
      </p>
      <p className="text-sm opacity-90 mt-1">
        차선책 대비 월 {formatWon(monthlySaving)} 절약
      </p>
    </motion.div>
  );
}
```

---

## 13. 차트 구현 패턴 (`/src/components/charts/YearlyCostChart.tsx`)

```tsx
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { formatWon } from '@/lib/utils/format';
import type { YearlyCostDataPoint } from '@/types';

interface Props {
  data: YearlyCostDataPoint[];
  currentYear: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold mb-2">{label}년차</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatWon(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function YearlyCostChart({ data, currentYear }: Props) {
  return (
    <LineChart data={data} width={600} height={350} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis dataKey="year" tickFormatter={(v) => `${v}년`} />
      <YAxis tickFormatter={formatWon} width={80} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <ReferenceLine x={currentYear} stroke="#6B7280" strokeDasharray="4 4" label={{ value: '설정 기간', fill: '#6B7280' }} />
      <Line type="monotone" dataKey="buyCumulative"         stroke="#3B82F6" name="매수" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="jeonseCumulative"      stroke="#F59E0B" name="전세" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="monthlyRentCumulative" stroke="#10B981" name="월세" strokeWidth={2} dot={false} />
    </LineChart>
  );
}
```

---

## 13-2. 순자산 변화 차트 (`/src/components/charts/AssetProjectionChart.tsx`)

### 목적
"주거비 비교"를 넘어, **시간이 지날수록 각 시나리오에서 내 총 순자산이 얼마나 되는가**를 직관적으로 보여주는 핵심 차트.

### 계산 전제 (UI에서 명시)
- 초기 현금 기준: 매수 자기자본 (`매매가 - 대출`)
- 전세·월세의 여유자금 = 초기여유금 + 매달 매수 대비 절약액
- 여유자금 운용 수익률: `예상투자수익률` (기본 4%, 기회비용율과 동일 값 사용)
- 전세대출: 만기일시상환 가정 (이자만 납부, 만기 시 원금 반환)

### UI 구성
```
┌─────────────────────────────────┐
│ 순자산 변화 시뮬레이션              │
│ 투자수익률 4% 가정                │
│                                 │
│    억원                          │
│  5 ┤         ╱───── 매수          │
│  4 ┤    ────╱       전세          │
│  3 ┤───╱    월세                  │
│  2 ┤                             │
│  0 ┼────────────────── 년        │
│     1  2  3  4  5               │
│                                 │
│ * 투자수익률·집값상승률에 따라 달라짐  │
└─────────────────────────────────┘
```

### 코드 스니펫

```tsx
'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { formatWon } from '@/lib/utils/format';
import type { AssetProjectionPoint } from '@/types';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}년 후</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <span className="font-semibold">{formatWon(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function AssetProjectionChart() {
  const results = useCalculatorStore((s) => s.results);
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);
  const investmentRate = useCalculatorStore((s) => s.jeonseInputs.expectedInvestmentReturn);

  if (!results) return null;

  const data: AssetProjectionPoint[] = results.assetProjectionSeries;

  return (
    <div className="px-4">
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">순자산 변화 시뮬레이션</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          투자수익률 {(investmentRate * 100).toFixed(0)}% 가정 · 초기 보유현금 = 매수 자기자본 기준
        </p>

        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="year"
                tickFormatter={(v: number) => `${v}년`}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
              />
              <YAxis
                tickFormatter={(v: number) => {
                  const eok = v / 100_000_000;
                  return `${eok.toFixed(1)}억`;
                }}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                width={42}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={yearsToHold} stroke="#D1D5DB" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="buyNetAsset"         stroke="#3182F6" name="매수" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="jeonseNetAsset"      stroke="#F59E0B" name="전세" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="monthlyRentNetAsset" stroke="#00B493" name="월세" strokeWidth={2.5} dot={false} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          * 실제 자산은 투자수익률·집값 변동에 따라 크게 달라질 수 있습니다
        </p>
      </div>
    </div>
  );
}
```

---

## 14. 기본값 상수 (`/src/lib/constants/defaults.ts`)

```typescript
import type { BuyInputs, JeonseInputs, MonthlyRentInputs } from '../../types';

// research.md 10장 기본 시나리오 기반
export const DEFAULT_BUY_INPUTS: BuyInputs = {
  purchasePrice: 600_000_000,      // 6억원
  areaM2: 84,
  numHomes: 1,
  loanAmount: 360_000_000,         // LTV 60%
  loanRate: 0.04,                  // 4%
  loanType: 'equal_payment',
  yearsToHold: 5,
  annualPriceChangeRate: 0.03,     // 연 3%
  annualIncome: 50_000_000,        // 5천만원
  isFirstHomeBuyer: false,
  isRegulatedZone: false,
};

export const DEFAULT_JEONSE_INPUTS: JeonseInputs = {
  depositAmount: 450_000_000,      // 4.5억원
  loanAmount: 200_000_000,         // 2억 대출
  loanRate: 0.035,                 // 3.5%
  insuranceProvider: 'hug',
  yearsToHold: 5,
  expectedInvestmentReturn: 0.04,  // 4%
  annualIncome: 50_000_000,
};

export const DEFAULT_MONTHLY_RENT_INPUTS: MonthlyRentInputs = {
  depositAmount: 50_000_000,       // 5천만원
  monthlyRent: 1_500_000,          // 150만원
  yearsToHold: 5,
  expectedInvestmentReturn: 0.04,
  annualIncome: 50_000_000,
  areaM2: 84,
  marketPrice: 600_000_000,
};
```

---

## 15. 구현 단계 (로드맵)

### Phase 1 — 계산 엔진 ✅ 완료
- [x] `types/index.ts` 도메인 타입 정의
- [x] `constants/taxRates.ts` 세율 상수
- [x] `constants/defaults.ts` 스마트 기본값
- [x] `calculations/taxes.ts` 취득세·재산세·종부세·양도세
- [x] `calculations/agentFees.ts` 중개수수료
- [x] `calculations/loanRepayment.ts` 대출 상환 방식 3종
- [x] `calculations/buy.ts` / `jeonse.ts` / `monthlyRent.ts`
- [x] `calculations/breakeven.ts` 시계열 · 손익분기
- [ ] 단위 테스트 (Jest): research.md 10장 예시값 검증 *(선택적)*

### Phase 2 — 상태 · 폼 ✅ 완료
- [x] Zustand 스토어 (입력 변경 시 자동 계산)
- [x] Zod 스키마 3종 (+ 추론 타입 연동)
- [x] `utils/format.ts` 억원/만원 단위 자동 변환

### Phase 3 — 모바일 UI ✅ 완료
- [x] TopBar, 단일 컬럼 스크롤 레이아웃
- [x] `NumberPadInput` (바텀시트 + 프리셋 버튼 + 슬라이더)
- [x] `PriceStepCard` (매수가/전세가/월세 3종 한 화면)
- [x] `PeriodStepCard` (거주 기간 슬라이더)
- [x] `AdvancedSheet` (고급 설정 바텀시트)
- [x] `WinnerBanner`, `ScenarioSwipeCards`
- [x] `CostDetailSheet` (비용 상세 바텀시트)
- [x] YearlyCostChart, ScenarioBarChart, BreakevenChart (전체 폭 모바일 최적화)
- [ ] **AssetProjectionChart** — 순자산 변화 시뮬레이션 라인 차트 (신규)

### Phase 4 — 마무리 ✅ 완료
- [x] Framer Motion 전환 애니메이션 적용 (바텀시트, 카드, 배너)
- [x] 면책 고지 (근사값 사용 항목 명시)
- [x] PWA 설정 (manifest.json, viewport 설정)
- [x] TypeScript strict 모드 + 프로덕션 빌드 통과
- [ ] 결과 공유 URL 파라미터 *(향후 과제)*

---

## 16. 아키텍처 결정 사항

| 결정 | 내용 | 이유 |
|------|------|------|
| 순수 함수형 계산 엔진 | 모든 계산 함수는 입력 → 출력, 부수효과 없음 | Jest 테스트 용이, `useMemo` 메모이제이션 |
| 연도별 시계열 = 독립 재계산 | 누적 합산 아닌 매년 새로 계산 | 결과 일관성 보장, 반올림 오차 누적 방지 |
| 공시가격 근사값 사용 | 공시가 ≈ 시세 × 70% | 인증 없이 공공 API 접근 불가, UI에 명시 |
| 클라이언트 전용 | 서버 없음, 모든 계산 브라우저에서 | 오프라인 동작, 계산 지연 없음 |
| 300ms debounce 자동 계산 | 입력 변경 → 자동 재계산 (버튼 없음) | 토스 스타일 즉각 피드백, n년 반복 계산 부담 없음 |
| 매수 비교값 = effectiveCost | netTotal - priceGain (시세 상승분 차감) | 전세·월세 netTotal과 대등한 실질 주거비 비교 가능 |
| 양도세 이중 차감 방지 | priceGain = salePrice - purchasePrice (gross) | 양도세는 disposalCosts에 이미 포함, effectiveCost에서 재차감 불필요 |
| 순자산 비교 기준 현금 = 매수 자기자본 | purchasePrice - loanAmount | 동일 출발점에서 시나리오별 자산 축적을 공정하게 비교 |
| 전세·월세 여유자금 운용 = 기회비용율 재사용 | expectedInvestmentReturn (기본 4%) | 별도 입력 없이 기존 필드 재사용, UX 복잡도 최소화 |
| 전세대출 만기일시상환 가정 | 순자산 계산 시 잔여원금 = 원금 그대로 | 실제 가장 일반적인 전세대출 방식 |
| 모바일 퍼스트 단일 컬럼 | 데스크톱 2컬럼 없음, 세로 스크롤 전용 | 모바일 사용자 90%+ 타깃 |
| 스마트 기본값 | 필수 입력 3개, 나머지 자동 채움 | 입력 피로도 최소화, 이탈률 감소 |
| 바텀시트 패턴 | 상세 설정/결과 모두 바텀시트 | iOS/Android 네이티브 앱 UX 일관성 |

---

*마지막 업데이트: 2026-03-01*

-메모
 ui 관련해서 전달할게 있어 균형감있게 만들어지면 좋겠어 예를들어 같은 행에 서로 다른 아이템이 높이가 다르다거나 서로 다른 행에서 종길이가 다르지 않았으면 좋겠고 스와이프가 들어간 부분은 항상 이동이 자연스러워야해 스와이프 될때마다 첫번째 아이템이 보이는 문제가 있었어 

 그다음은 이 서비스의 메인은 자산 가치의 변화를 비교하는게 메인이고 비용 비교는 그 다음이야 