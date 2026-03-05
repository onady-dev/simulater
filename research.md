# App 폴더 상세 분석 보고서

## 1. 프로젝트 개요

### 1.1 기본 정보
- **프로젝트명**: 집 살까? 전세 살까?
- **프레임워크**: Next.js 14.2.35 (App Router)
- **빌드 타입**: Static Export (`output: 'export'`)
- **개발 서버**: 0.0.0.0:4000
- **언어**: TypeScript (strict mode)

### 1.2 핵심 의존성
```json
{
  "상태관리": "zustand@5.0.11 (persist, devtools)",
  "폼관리": "react-hook-form@7.71.2 + @hookform/resolvers@5.2.2",
  "검증": "zod@4.3.6",
  "차트": "recharts@3.7.0",
  "애니메이션": "framer-motion@12.34.3",
  "스타일": "tailwindcss@3.4.1"
}
```

### 1.3 프로젝트 목적
매수/전세/월세 3가지 주거 시나리오를 비교하여 사용자에게 최적의 선택을 추천하는 금융 계산기 웹 애플리케이션.

- 인플레이션 시나리오별 비교 (저/중/고)
- 순자산 변화 시뮬레이션
- 레버리지 효과 분석
- 세제 혜택 자동 계산
- 모바일 최적화 UI

---

## 2. 아키텍처 구조

### 2.1 디렉토리 구조
```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃 (폰트, 메타데이터)
│   │   ├── page.tsx            # 홈 → /calculator 리다이렉트
│   │   ├── calculator/
│   │   │   └── page.tsx        # 메인 계산기 페이지
│   │   ├── globals.css         # 전역 스타일 (Tailwind + 커스텀)
│   │   └── fonts/              # Geist 폰트
│   │
│   ├── components/             # React 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   │   └── TopBar.tsx      # 상단 바
│   │   ├── inputs/             # 입력 컴포넌트
│   │   │   ├── PriceStepCard.tsx           # 가격 입력 카드
│   │   │   ├── PeriodStepCard.tsx          # 기간 선택
│   │   │   ├── NumberPadInput.tsx          # 숫자 입력 바텀시트
│   │   │   ├── InflationScenarioSelector.tsx # 인플레이션 시나리오 선택
│   │   │   ├── AdvancedSheet.tsx           # 고급 설정 바텀시트
│   │   │   ├── SliderWithLabel.tsx         # 슬라이더 컴포넌트
│   │   │   └── PresetButtons.tsx           # 프리셋 버튼
│   │   ├── results/            # 결과 표시 컴포넌트
│   │   │   ├── AutoRecommendation.tsx      # AI 추천 결과
│   │   │   ├── WinnerBanner.tsx            # 최적 선택 배너
│   │   │   ├── LeverageSimulator.tsx       # 레버리지 시뮬레이터
│   │   │   ├── ScenarioSwipeCards.tsx      # 시나리오 스와이프 카드
│   │   │   └── CostDetailSheet.tsx         # 비용 상세 바텀시트
│   │   └── charts/             # 차트 컴포넌트
│   │       ├── AssetProjectionChart.tsx    # 순자산 변화 차트
│   │       ├── ScenarioComparisonChart.tsx # 시나리오 비교 차트
│   │       ├── YearlyCostChart.tsx         # 연도별 비용 차트
│   │       ├── BreakevenChart.tsx          # 손익분기점 차트
│   │       └── ScenarioBarChart.tsx        # 시나리오 바 차트
│   │
│   ├── lib/                    # 비즈니스 로직
│   │   ├── store/              # Zustand 상태 관리
│   │   │   └── calculatorStore.ts  # 메인 스토어
│   │   ├── calculations/       # 계산 로직
│   │   │   ├── index.ts            # 통합 계산 함수
│   │   │   ├── buy.ts              # 매수 시나리오
│   │   │   ├── jeonse.ts           # 전세 시나리오
│   │   │   ├── monthlyRent.ts      # 월세 시나리오
│   │   │   ├── taxes.ts            # 세금 계산
│   │   │   ├── loanRepayment.ts    # 대출 상환 계산
│   │   │   ├── agentFees.ts        # 중개수수료 계산
│   │   │   ├── breakeven.ts        # 손익분기점 분석
│   │   │   ├── inflation.ts        # 인플레이션 시나리오
│   │   │   └── recommendation.ts   # 추천 로직
│   │   ├── constants/          # 상수 정의
│   │   │   ├── defaults.ts         # 기본값
│   │   │   └── taxRates.ts         # 세율 브라켓
│   │   ├── schemas/            # Zod 스키마
│   │   │   ├── buySchema.ts
│   │   │   ├── jeonseSchema.ts
│   │   │   └── monthlyRentSchema.ts
│   │   └── utils/              # 유틸리티
│   │       └── format.ts           # 포맷팅 함수
│   │
│   └── types/                  # TypeScript 타입 정의
│       └── index.ts            # 모든 타입 정의
│
├── public/                     # 정적 파일
│   └── manifest.json           # PWA 매니페스트
├── .next/                      # Next.js 빌드 출력
├── next.config.mjs             # Next.js 설정
├── tsconfig.json               # TypeScript 설정
├── tailwind.config.ts          # Tailwind 설정
└── package.json                # 의존성 관리
```

### 2.2 데이터 흐름

```
사용자 입력 (UI)
    ↓
NumberPadInput / SliderWithLabel
    ↓
calculatorStore (Zustand)
    ↓ updateBuyInputs / updateJeonseInputs / updateMonthlyRentInputs
    ↓ calculate() 자동 호출
    ↓
runAllCalculations()
    ├─→ calculateBuyScenario()
    │   ├─→ calculateAcquisitionTax()
    │   ├─→ calculatePropertyTax()
    │   ├─→ calculateCapitalGainsTax()
    │   └─→ calculateLoanRepayment()
    ├─→ calculateJeonseScenario()
    └─→ calculateMonthlyRentScenario()
    ↓
generateYearlyCostSeries()
generateBreakevenSeries()
generateAssetProjectionSeries()
    ↓
compareInflationScenarios()
generateRecommendation()
    ↓
results / scenarioComparisons / recommendation
    ↓
UI 컴포넌트 렌더링
    ├─→ AutoRecommendation
    ├─→ ScenarioComparisonChart
    ├─→ AssetProjectionChart
    ├─→ LeverageSimulator
    └─→ WinnerBanner
```

---

## 3. 핵심 기능 상세 분석

### 3.1 상태 관리 (calculatorStore.ts)

**Zustand 스토어 구조**:
```typescript
interface CalculatorState {
  // 입력 상태
  buyInputs: BuyInputs;
  jeonseInputs: JeonseInputs;
  monthlyRentInputs: MonthlyRentInputs;
  
  // 계산 결과
  results: CalculationResults | null;
  scenarioComparisons: ScenarioComparison[] | null;
  recommendation: Recommendation | null;
  
  // UI 상태
  activeTab: ScenarioKey;
  inflationScenario: InflationScenario;
  
  // 액션
  updateBuyInputs: (partial: Partial<BuyInputs>) => void;
  updateJeonseInputs: (partial: Partial<JeonseInputs>) => void;
  updateMonthlyRentInputs: (partial: Partial<MonthlyRentInputs>) => void;
  setInflationScenario: (scenario: InflationScenario) => void;
  calculate: () => void;
  resetAll: () => void;
  setActiveTab: (tab: ScenarioKey) => void;
}
```

**핵심 특징**:
1. **자동 재계산**: 모든 입력 업데이트 시 `calculate()` 자동 호출
2. **LocalStorage 영속화**: `persist` 미들웨어로 입력값 저장
3. **DevTools 통합**: Redux DevTools로 디버깅 가능
4. **Hydration 후 계산**: `onRehydrateStorage`에서 초기 계산 실행

**계산 로직**:
```typescript
calculate: () => {
  const { buyInputs, jeonseInputs, monthlyRentInputs, inflationScenario } = get();
  
  // 1. 인플레이션 파라미터 적용
  const params = getInflationParameters(inflationScenario);
  const adjustedBuy = { ...buyInputs, annualPriceChangeRate: params.housingPriceGrowth, ... };
  
  // 2. 3가지 시나리오 계산
  const results = runAllCalculations(adjustedBuy, adjustedJeonse, adjustedRent);
  
  // 3. 인플레이션 시나리오별 비교
  const scenarioComparisons = compareInflationScenarios(...);
  
  // 4. 추천 생성
  const recommendation = generateRecommendation(inflationScenario, results, adjustedBuy);
  
  set({ results, scenarioComparisons, recommendation });
}
```


### 3.2 계산 엔진 (lib/calculations/)

#### 3.2.1 매수 시나리오 (buy.ts)

**계산 단계**:

1. **초기 비용 (Initial Costs)**
   - 취득세: `calculateAcquisitionTax()` - 6~9억 구간 점진 공식 적용
   - 중개수수료: `calculateBuyAgentFee()` - 브라켓 기반
   - 법무사 비용: 가격대별 추정 (30만~80만원)
   - 채권할인비용: 매매가 × 0.4%
   - 등록세 + 인지세: 매매가 × 0.2% + 인지세

2. **연간 보유비용 (Annual Holding Costs)**
   - 재산세: 공시가격(시세×70%) × 공정시장가액비율(60%) 기준
   - 종합부동산세: 1세대 1주택 12억 공제, 일반 9억 공제
   - 관리비: 면적(㎡) × 2,920원 × 12개월
   - 대출이자: `calculateLoanRepayment()` 결과

3. **처분 비용 (Disposal Costs)**
   - 양도소득세: 1세대 1주택 비과세 조건 체크
     - 2년 보유 + 2년 거주 + 12억 이하 → 비과세
     - 장기보유특별공제: 실거주 연 4% (최대 80%)
   - 중개수수료: 매도가 기준

4. **기회비용 (Opportunity Cost)**
   - 자기자본(매수가 - 대출) × 기대투자수익률 × 보유기간

5. **자산 이익 (Asset Gain)**
   - 시세 상승분: `매수가 × (1 + 연간변동률)^보유년수 - 매수가`
   - 실질 주거비: `총비용 - 시세상승분`

**핵심 코드**:
```typescript
export function calculateBuyScenario(inputs: BuyInputs): CostBreakdown {
  const { purchasePrice, loanAmount, yearsToHold, annualPriceChangeRate, ... } = inputs;
  
  // 초기 비용
  const acqTax = calculateAcquisitionTax(purchasePrice, numHomes, areaM2, isFirstHomeBuyer);
  const initialTotal = acqTax.total + buyAgentFee + legalFee + bondDiscount + ...;
  
  // 연간 보유비용
  const propertyTax = calculatePropertyTax(purchasePrice);
  const loanSchedule = calculateLoanRepayment(loanAmount, loanRate, loanType, 30, yearsToHold);
  const annualHoldingTotal = propertyTax + comprehensiveTax + maintenanceFee + annualLoanInterest;
  
  // 처분 비용
  const salePrice = Math.floor(purchasePrice * Math.pow(1 + annualPriceChangeRate, yearsToHold));
  const capitalGainsTax = calculateCapitalGainsTax({ purchasePrice, salePrice, ... });
  
  // 기회비용
  const buyEquity = purchasePrice - loanAmount;
  const opportunityCost = Math.floor(buyEquity * expectedInvestmentReturn * yearsToHold);
  
  // 자산 이익
  const priceGain = salePrice - purchasePrice;
  const effectiveCost = netTotal - priceGain;
  
  return { initialCosts, annualHoldingCosts, disposalCosts, opportunityCost, assetGain, ... };
}
```

#### 3.2.2 전세 시나리오 (jeonse.ts)

**계산 단계**:

1. **초기 비용**
   - 중개수수료: `calculateRentAgentFee()` - 임대차 브라켓
   - 전세보증보험료: 보증금 × 보험료율 × 보유년수
     - HF: 0.04~0.18%
     - HUG: 0.11~0.21%
     - SGI: 0.18~0.21%

2. **주기적 비용**
   - 전세대출 이자: 만기일시상환 가정 (이자만 납부)
   - 기회비용: 보증금 자부담 × 기대투자수익률 × 보유년수

3. **세제 혜택**
   - 전세대출 이자 소득공제: 최대 400만원, 공제율 40%
   - 한계세율 적용: 5,500만원 이하 15%, 초과 24%

**핵심 코드**:
```typescript
export function calculateJeonseScenario(inputs: JeonseInputs): JeonseCostBreakdown {
  const { depositAmount, loanAmount, loanRate, insuranceProvider, yearsToHold, ... } = inputs;
  
  // 초기 비용
  const agentFee = calculateRentAgentFee(depositAmount);
  const insurancePremium = calcInsurancePremium(depositAmount, insuranceProvider, yearsToHold);
  
  // 주기적 비용
  const annualInterest = Math.floor(loanAmount * loanRate);
  const totalLoanInterest = annualInterest * yearsToHold;
  const opportunityCost = Math.floor(depositAmount * expectedInvestmentReturn * yearsToHold);
  
  // 세제 혜택
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

#### 3.2.3 월세 시나리오 (monthlyRent.ts)

**계산 단계**:

1. **초기 비용**
   - 중개수수료: 거래금액 기준
     - 거래금액 = 보증금 + (월세 × 100)
     - 5천만원 미만 시: 보증금 + (월세 × 70)

2. **주기적 비용**
   - 총 월세 납부액: 월세 × 12 × 보유년수
   - 기회비용: 보증금 × 기대투자수익률 × 보유년수

3. **세제 혜택**
   - 월세 세액공제: 최대 1,000만원
   - 공제율: 5,500만원 이하 17%, 초과 15%
   - 조건: 면적 85㎡ 이하 또는 시가 4억 이하, 소득 8,000만원 이하

**핵심 코드**:
```typescript
export function calculateMonthlyRentScenario(inputs: MonthlyRentInputs): MonthlyRentCostBreakdown {
  const { depositAmount, monthlyRent, yearsToHold, ... } = inputs;
  
  // 초기 비용
  const txAmount = calculateMonthlyRentTransactionAmount(depositAmount, monthlyRent);
  const agentFee = calculateRentAgentFee(txAmount);
  
  // 주기적 비용
  const totalRentPaid = monthlyRent * 12 * yearsToHold;
  const opportunityCost = Math.floor(depositAmount * expectedInvestmentReturn * yearsToHold);
  
  // 세제 혜택
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

#### 3.2.4 대출 상환 계산 (loanRepayment.ts)

**3가지 상환 방식**:

1. **원리금균등상환 (Equal Payment)**
   ```typescript
   월 상환액 = P × [r(1+r)^n] / [(1+r)^n - 1]
   ```
   - 매월 동일한 금액 납부
   - 초기 이자 비중 높음 → 후기 원금 비중 높음

2. **원금균등상환 (Equal Principal)**
   ```typescript
   월 원금 = P / 총개월수
   월 이자 = 잔여원금 × 월이자율
   ```
   - 매월 원금 고정, 이자는 감소
   - 초기 납부액이 가장 큼

3. **만기일시상환 (Bullet)**
   ```typescript
   월 이자 = P × 연이자율 / 12
   ```
   - 이자만 납부, 만기에 원금 일시 상환
   - 전세대출에 주로 사용

**반환값**:
```typescript
interface LoanRepaymentResult {
  totalInterestPaid: number;           // 총 이자 납부액
  yearlyInterestSchedule: number[];    // 연도별 이자 스케줄
  remainingPrincipal: number;          // 잔여 원금
  monthlyPayment: number;              // 월 실납부액 (순자산 비교 기준)
}
```

#### 3.2.5 세금 계산 (taxes.ts)

**1. 취득세 (Acquisition Tax)**

```typescript
// 6억~9억 1주택 점진 공식
세율 = (취득가액(억원) × 2 - 3) / 100

// 예: 7억원 → (7 × 2 - 3) / 100 = 11 / 100 = 1.1%
```

- 기본세 + 지방교육세(10%) + 농어촌특별세(10%, 85㎡ 초과)
- 생애최초 구입 감면: 12억 이하, 최대 200만원

**2. 재산세 (Property Tax)**

```typescript
공시가격 = 매매가 × 70% (근사치)
과세표준 = 공시가격 × 공정시장가액비율(60%)
```

브라켓:
- 6천만원 이하: 0.1%
- 6천만~1.5억: 0.15%
- 1.5억~3억: 0.25%
- 3억 초과: 0.4%

**3. 종합부동산세 (Comprehensive Real Estate Tax)**

- 기본공제: 1세대 1주택 12억, 일반 9억
- 과세표준 = (공시가격 - 기본공제) × 60%
- 7단계 누진세율: 0.5%~2.7%

**4. 양도소득세 (Capital Gains Tax)**

비과세 조건:
- 1세대 1주택
- 2년 보유 + 2년 거주
- 양도가 12억 이하

장기보유특별공제:
- 실거주: 연 4% (최대 80%)
- 일반: 연 2% (최대 30%)

8단계 누진세율: 6%~45%

#### 3.2.6 손익분기점 분석 (breakeven.ts)

**1. 연도별 누적 비용 시계열**

```typescript
export function generateYearlyCostSeries(
  buyInputs, jeonseInputs, monthlyRentInputs, maxYears
): YearlyCostDataPoint[] {
  return Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    return {
      year,
      buyCumulative: calculateBuyScenario({ ...buyInputs, yearsToHold: year }).effectiveCost,
      jeonseCumulative: calculateJeonseScenario({ ...jeonseInputs, yearsToHold: year }).netTotal,
      monthlyRentCumulative: calculateMonthlyRentScenario({ ...monthlyRentInputs, yearsToHold: year }).netTotal,
    };
  });
}
```

- 각 연도마다 독립적으로 재계산 (정확성 보장)
- 실질 주거비 기준 (자산 이익 반영)

**2. 주택가격 변동률별 손익분기**

```typescript
export function generateBreakevenSeries(...): BreakevenDataPoint[] {
  const rates = [-0.1, -0.08, -0.05, -0.03, -0.01, 0, 0.01, 0.03, 0.05, 0.07, 0.1, 0.12, 0.15];
  
  return rates.map((rate) => ({
    annualPriceChangeRate: rate,
    buyNetCost: calculateBuyScenario({ ...buyInputs, annualPriceChangeRate: rate }).effectiveCost,
    jeonseNetCost: jeonseNet,
    monthlyRentNetCost: rentNet,
  }));
}
```

- -10%~+15% 범위 분석
- 어느 변동률에서 매수가 유리한지 시각화

**3. 순자산 변화 시뮬레이션**

```typescript
export function generateAssetProjectionSeries(...): AssetProjectionPoint[] {
  // 공통 기준: 매수 자기자본을 초기 보유 현금으로 설정
  const buyEquity = purchasePrice - loanAmount;
  
  // 전세 초기 투자가능금액
  const jeonseOwnDeposit = Math.max(0, jeonseInputs.depositAmount - jeonseInputs.loanAmount);
  const jeonseInitialInvestable = Math.max(0, buyEquity - jeonseOwnDeposit);
  
  // 월 절약액 (매수 대비)
  const jeonseMonthlySaving = buyMonthlyOutflow - jeonseMonthlyOutflow;
  
  return Array.from({ length: yearsToHold }, (_, i) => {
    const year = i + 1;
    
    // 매수 순자산: 시세 - 잔여대출
    const salePrice = Math.floor(purchasePrice * Math.pow(1 + annualPriceChangeRate, year));
    const remainingLoan = calculateLoanRepayment(..., year).remainingPrincipal;
    const buyNetAsset = salePrice - remainingLoan;
    
    // 전세 순자산: 초기여유금 투자 + 월절약액 적립 + 보증금 - 전세대출
    const fvInitialJeonse = jeonseInitialInvestable * Math.pow(1 + r, year);
    const fvSavingJeonse = jeonseMonthlySaving * fvFactor;  // 연금 미래가치
    const jeonseNetAsset = fvInitialJeonse + fvSavingJeonse + jeonseInputs.depositAmount - jeonseInputs.loanAmount;
    
    return { year, buyNetAsset, jeonseNetAsset, monthlyRentNetAsset };
  });
}
```

**핵심 가정**:
- 매수 자기자본을 기준선으로 설정
- 전세/월세는 여유금을 `expectedInvestmentReturn`으로 운용
- 월 절약액도 동일 수익률로 적립


#### 3.2.7 인플레이션 시나리오 (inflation.ts)

**3가지 시나리오 파라미터**:

```typescript
export function getInflationParameters(scenario: InflationScenario): InflationParameters {
  const params: Record<InflationScenario, InflationParameters> = {
    low: {
      inflationRate: 0.015,              // 1.5% 물가상승률
      housingPriceGrowth: 0.02,          // 2% 주택가격 상승
      rentGrowthRate: 0.02,              // 2% 임대료 상승
      loanInterestRate: 0.03,            // 3% 대출금리
      expectedInvestmentReturn: 0.05,    // 5% 투자수익률
    },
    medium: {
      inflationRate: 0.03,               // 3% 물가상승률
      housingPriceGrowth: 0.04,          // 4% 주택가격 상승
      rentGrowthRate: 0.045,             // 4.5% 임대료 상승
      loanInterestRate: 0.04,            // 4% 대출금리
      expectedInvestmentReturn: 0.07,    // 7% 투자수익률
    },
    high: {
      inflationRate: 0.05,               // 5% 물가상승률
      housingPriceGrowth: 0.065,         // 6.5% 주택가격 상승
      rentGrowthRate: 0.07,              // 7% 임대료 상승
      loanInterestRate: 0.055,           // 5.5% 대출금리
      expectedInvestmentReturn: 0.10,    // 10% 투자수익률
    },
  };
  return params[scenario];
}
```

**실질 자산가치 계산**:

```typescript
export function calculateRealValue(
  nominalValue: number,
  inflationRate: number,
  years: number
): number {
  return nominalValue / Math.pow(1 + inflationRate, years);
}
```

**시나리오 비교**:

```typescript
export function compareInflationScenarios(...): ScenarioComparison[] {
  const scenarios: InflationScenario[] = ['low', 'medium', 'high'];
  
  return scenarios.map((scenario) => {
    const params = getInflationParameters(scenario);
    
    // 파라미터 적용하여 재계산
    const adjustedBuy = { ...buyInputs, annualPriceChangeRate: params.housingPriceGrowth, ... };
    const results = runAllCalculations(adjustedBuy, adjustedJeonse, adjustedRent);
    
    // 실질 자산가치 계산 (인플레이션 조정)
    const lastIdx = buyInputs.yearsToHold - 1;
    const nominal = results.assetProjectionSeries[lastIdx];
    
    return {
      scenario,
      parameters: params,
      results,
      realAssetValue: {
        buy: calculateRealValue(nominal.buyNetAsset, params.inflationRate, yearsToHold),
        jeonse: calculateRealValue(nominal.jeonseNetAsset, params.inflationRate, yearsToHold),
        monthlyRent: calculateRealValue(nominal.monthlyRentNetAsset, params.inflationRate, yearsToHold),
      },
    };
  });
}
```

#### 3.2.8 추천 로직 (recommendation.ts)

**추천 생성 알고리즘**:

```typescript
export function generateRecommendation(
  inflationScenario: InflationScenario,
  results: CalculationResults,
  buyInputs: BuyInputs
): Recommendation {
  const lastIdx = buyInputs.yearsToHold - 1;
  const finalAssets = results.assetProjectionSeries[lastIdx];
  
  // 1. 순자산 기준 정렬
  const assets: Record<ScenarioKey, number> = {
    buy: finalAssets.buyNetAsset,
    jeonse: finalAssets.jeonseNetAsset,
    monthlyRent: finalAssets.monthlyRentNetAsset,
  };
  const sorted = Object.entries(assets).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];
  
  // 2. 시나리오별 추천 이유 생성
  const reasoning: string[] = [];
  const warnings: string[] = [];
  let leverageAdvice: string | undefined;
  
  if (inflationScenario === 'low') {
    if (primary === 'monthlyRent') {
      reasoning.push('저인플레이션 시기에는 투자 수익으로 월세를 상쇄할 수 있습니다');
      warnings.push('투자 수익률 5% 이상 달성이 필요합니다');
    } else if (primary === 'buy') {
      reasoning.push('낮은 금리로 대출 부담이 적습니다');
      leverageAdvice = 'LTV 60% 활용 권장';
    }
  } else if (inflationScenario === 'medium') {
    if (primary === 'buy') {
      reasoning.push('중인플레이션 시기는 레버리지 효과가 큽니다');
      leverageAdvice = 'LTV 60~70% 활용 + 여유자금 투자 병행';
      warnings.push('금리 변동 리스크를 고려하세요');
    }
  } else {  // high
    if (primary === 'buy') {
      reasoning.push('고인플레이션 시기 부동산은 강력한 헤지 수단입니다');
      leverageAdvice = '최대 LTV 활용 권장 (70%)';
      warnings.push('금리가 높아 초기 이자 부담이 클 수 있습니다');
    }
  }
  
  return { primary, secondary, reasoning, warnings, leverageAdvice };
}
```

**추천 기준**:
1. 순자산 최대화 (명목가치 기준)
2. 인플레이션 시나리오별 맞춤 조언
3. 레버리지 전략 제시
4. 리스크 경고

---

## 4. UI/UX 구조

### 4.1 페이지 구성 (calculator/page.tsx)

```typescript
export default function CalculatorPage() {
  const calculate = useCalculatorStore((s) => s.calculate);
  
  useEffect(() => {
    calculate();  // 초기 계산
  }, [calculate]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <main className="pb-10 pt-4">
        {/* 1. 경제 전망 선택 */}
        <InflationScenarioSelector />
        
        {/* 2. 입력 섹션 */}
        <section className="px-4 space-y-3 mb-4">
          <PriceStepCard />
          <PeriodStepCard />
        </section>
        
        {/* 3. 추천 결과 */}
        <AutoRecommendation />
        
        {/* 4. 인플레이션 시나리오별 비교 */}
        <ScenarioComparisonChart />
        
        {/* 5. 순자산 변화 차트 */}
        <AssetProjectionChart />
        
        {/* 6. 레버리지 시뮬레이션 */}
        <LeverageSimulator />
        
        {/* 7. 시나리오 비용 카드 */}
        <ScenarioSwipeCards />
        
        {/* 8. 결과 배너 */}
        <WinnerBanner />
      </main>
    </div>
  );
}
```

### 4.2 입력 컴포넌트

#### 4.2.1 NumberPadInput (숫자 입력 바텀시트)

**특징**:
- 카드 형태 버튼 클릭 → 바텀시트 오픈
- Framer Motion 애니메이션
- 프리셋 버튼 + 슬라이더 조합
- 설정 버튼 (톱니바퀴) → AdvancedSheet 오픈

**구조**:
```typescript
<NumberPadInput
  label="매수가격"
  value={buyInputs.purchasePrice}
  onChange={(v) => updateBuyInputs({ purchasePrice: v, loanAmount: Math.floor(v * 0.6) })}
  unit="억원"
  presets={[{ label: '3억', value: 300_000_000 }, ...]}
  min={100_000_000}
  max={3_000_000_000}
  step={10_000_000}
  onSettingsClick={() => setOpenSheet('buy')}
/>
```

**바텀시트 내부**:
1. 드래그 핸들 (회색 바)
2. 현재 값 표시 (큰 폰트)
3. 프리셋 버튼 그리드
4. 슬라이더 (min~max)
5. 확인 버튼

#### 4.2.2 AdvancedSheet (고급 설정 바텀시트)

**매수 설정**:
- 대출 금액 슬라이더
- 대출 금리 슬라이더
- 연간 주택가격 변동률 슬라이더
- 주택 수 선택 (1/2/3주택+)
- 상환 방식 선택 (원리금균등/원금균등/만기일시)
- 생애최초 구입 토글

**전세 설정**:
- 전세대출 금액 슬라이더
- 전세대출 금리 슬라이더
- 전세보증보험 선택 (없음/HF/HUG/SGI)

**월세 설정**:
- 전용 설정 없음 (공통 설정만 사용)

#### 4.2.3 InflationScenarioSelector

**3가지 시나리오 버튼**:
```typescript
const SCENARIOS = [
  { key: 'low', label: '저인플레이션', rate: '1.5%', color: '#10B981', desc: '안정적 경제' },
  { key: 'medium', label: '중인플레이션', rate: '3%', color: '#F59E0B', desc: '일반적 상황' },
  { key: 'high', label: '고인플레이션', rate: '5%', color: '#EF4444', desc: '고물가 시대' },
];
```

- 선택된 시나리오는 테두리 강조 + 배경색 변경
- 클릭 시 `setInflationScenario()` → 자동 재계산

### 4.3 결과 컴포넌트

#### 4.3.1 AutoRecommendation (AI 추천 결과)

**구조**:
```typescript
<div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-5 text-white">
  {/* 최적 선택 */}
  <div className="bg-white/20 rounded-2xl p-3">
    <p className="text-2xl font-bold">{LABELS[recommendation.primary]}</p>
    <p className="text-xs">차선: {LABELS[recommendation.secondary]}</p>
  </div>
  
  {/* 추천 이유 */}
  {recommendation.reasoning.map((reason) => (
    <div className="flex gap-2">
      <span className="text-yellow-300">•</span>
      <p className="text-sm">{reason}</p>
    </div>
  ))}
  
  {/* 레버리지 전략 */}
  {recommendation.leverageAdvice && (
    <div className="bg-white/10 rounded-xl p-3">
      <p className="text-xs">💰 레버리지 전략</p>
      <p className="text-sm">{recommendation.leverageAdvice}</p>
    </div>
  )}
  
  {/* 주의사항 */}
  {recommendation.warnings.map((warning) => (
    <p className="text-xs">• {warning}</p>
  ))}
</div>
```

#### 4.3.2 LeverageSimulator (레버리지 시뮬레이터)

**기능**:
- LTV 비율 슬라이더 (0~70%)
- 대출금 / 자기자본 표시
- 자기자본 수익률(ROE) 계산
- 레버리지 효과 표시 (무대출 대비)

**계산 로직**:
```typescript
const loanAmount = Math.floor(purchasePrice * (ltv / 100));
const equity = purchasePrice - loanAmount;

const futureValue = purchasePrice * Math.pow(1 + annualPriceChangeRate, yearsToHold);
const priceGain = futureValue - purchasePrice;
const roe = equity > 0 ? (priceGain / equity) * 100 : 0;

const baseRoe = (priceGain / purchasePrice) * 100;
const leverageEffect = roe - baseRoe;
```

**주의사항**:
- 이자 비용 미반영 단순 수익률
- 실제 수익은 대출이자 차감 필요

#### 4.3.3 ScenarioSwipeCards (시나리오 스와이프 카드)

**특징**:
- Framer Motion 드래그 제스처
- 3개 카드 좌우 스와이프
- 각 카드 클릭 → CostDetailSheet 오픈

**드래그 로직**:
```typescript
const SWIPE_THRESHOLD = 40;
const SWIPE_VELOCITY_THRESHOLD = 400;

function handleDragEnd(_, info) {
  const dx = info.offset.x;
  const vx = info.velocity.x;
  
  if ((dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY_THRESHOLD) && activeIndex < 2) {
    goTo(activeIndex + 1);
  } else if ((dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY_THRESHOLD) && activeIndex > 0) {
    goTo(activeIndex - 1);
  } else {
    // 원위치
    animate(x, -activeIndex * width, { type: 'spring', damping: 30, stiffness: 300 });
  }
}
```

**카드 내용**:
- 시나리오 이름 + 색상
- 총 비용 (큰 폰트)
- 월 평균 비용
- 순위 표시 (🥇🥈🥉)

#### 4.3.4 CostDetailSheet (비용 상세 바텀시트)

**매수 상세**:
- 초기 비용: 취득세, 중개수수료, 법무사비, 채권할인, 등록세, 인지세
- 연간 보유비용: 재산세, 종부세, 관리비, 대출이자
- 처분 비용: 양도세, 중개수수료
- 기회비용
- 세제 혜택
- 자산 이익: 최종 시세, 시세 상승분, 실질 주거비

**전세 상세**:
- 초기 비용: 중개수수료, 보증보험료
- 주기적 비용: 대출이자, 기회비용
- 세제 혜택: 대출이자 소득공제

**월세 상세**:
- 초기 비용: 중개수수료
- 주기적 비용: 총 월세, 기회비용
- 세제 혜택: 월세 세액공제

### 4.4 차트 컴포넌트 (Recharts)

#### 4.4.1 AssetProjectionChart (순자산 변화 차트)

**타입**: LineChart
**데이터**: `assetProjectionSeries`
**라인**:
- 매수 순자산 (파란색)
- 전세 순자산 (주황색)
- 월세 순자산 (초록색)

**특징**:
- X축: 연도 (1~20년)
- Y축: 억원 단위
- 현재 보유기간에 세로선 표시
- 커스텀 툴팁 (연도별 3가지 값 표시)

#### 4.4.2 ScenarioComparisonChart (시나리오 비교 차트)

**타입**: BarChart
**데이터**: `scenarioComparisons` → 실질 자산가치
**바**:
- 매수 (파란색)
- 전세 (주황색)
- 월세 (초록색)

**특징**:
- X축: 저/중/고 인플레이션
- Y축: 억원 단위
- 인플레이션 조정 후 실질 가치 표시

---

## 5. 타입 시스템 (types/index.ts)

### 5.1 기본 타입

```typescript
type Won = number;              // 원화 금액 (정수)
type Rate = number;             // 비율 (소수): 5% = 0.05
type Years = number;            // 연수 (양의 정수)
type HomeOwnerCount = 1 | 2 | 3;
type LoanRepaymentType = 'equal_payment' | 'equal_principal' | 'bullet';
type JeonseInsuranceProvider = 'none' | 'hf' | 'hug' | 'sgi';
type ScenarioKey = 'buy' | 'jeonse' | 'monthlyRent';
type InflationScenario = 'low' | 'medium' | 'high';
```

### 5.2 입력 타입

```typescript
interface BuyInputs {
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
  expectedInvestmentReturn: Rate;
}

interface JeonseInputs {
  depositAmount: Won;
  loanAmount: Won;
  loanRate: Rate;
  insuranceProvider: JeonseInsuranceProvider;
  yearsToHold: Years;
  expectedInvestmentReturn: Rate;
  annualIncome: Won;
}

interface MonthlyRentInputs {
  depositAmount: Won;
  monthlyRent: Won;
  yearsToHold: Years;
  expectedInvestmentReturn: Rate;
  annualIncome: Won;
  areaM2: number;
  marketPrice: Won;
}
```

### 5.3 결과 타입

```typescript
interface CostBreakdown {
  initialCosts: BuyInitialCosts;
  annualHoldingCosts: BuyAnnualHoldingCosts;
  disposalCosts: BuyDisposalCosts;
  opportunityCost: Won;
  taxBenefits: { firstHomeReduction: Won; total: Won };
  assetGain: BuyAssetGain;
  grandTotal: Won;
  netTotal: Won;
  effectiveCost: Won;  // 실질 주거비 (자산이익 반영)
}

interface CalculationResults {
  buy: CostBreakdown;
  jeonse: JeonseCostBreakdown;
  monthlyRent: MonthlyRentCostBreakdown;
  yearlyCostSeries: YearlyCostDataPoint[];
  breakevenSeries: BreakevenDataPoint[];
  assetProjectionSeries: AssetProjectionPoint[];
  recommendation: ScenarioKey;
}
```

---

## 6. 스타일링 (Tailwind CSS)

### 6.1 전역 스타일 (globals.css)

```css
:root {
  --background: #F9FAFB;
  --foreground: #191F28;
}

/* 슬라이더 커스텀 */
input[type='range']::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3182F6;
  box-shadow: 0 1px 4px rgba(49, 130, 246, 0.4);
}

/* 스크롤바 숨김 (모바일 스타일) */
::-webkit-scrollbar {
  display: none;
}

/* Safe Area 대응 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
```

### 6.2 디자인 시스템

**색상**:
- Primary: `#3182F6` (파란색)
- Secondary: `#F59E0B` (주황색)
- Success: `#00B493` (초록색)
- Danger: `#EF4444` (빨간색)
- Gray Scale: `#F9FAFB` ~ `#191F28`

**타이포그래피**:
- Font: Geist Sans (Variable Font)
- 제목: `text-base font-bold` (16px)
- 본문: `text-sm` (14px)
- 캡션: `text-xs` (12px)
- 강조: `text-2xl font-bold` (24px)

**간격**:
- 카드 간격: `space-y-3` (12px)
- 섹션 간격: `mb-4` (16px)
- 내부 패딩: `p-5` (20px)

**라운드**:
- 카드: `rounded-2xl` (16px)
- 버튼: `rounded-xl` (12px)
- 바텀시트: `rounded-t-3xl` (24px)

**그림자**:
- 카드: `shadow-sm`
- 바텀시트: `shadow-lg`

---

## 7. 성능 최적화

### 7.1 계산 최적화

1. **메모이제이션**: Zustand selector로 필요한 상태만 구독
2. **배치 계산**: `runAllCalculations()`에서 한 번에 처리
3. **조건부 렌더링**: `results`가 null일 때 스켈레톤 표시

### 7.2 렌더링 최적화

1. **Client Component 분리**: 'use client' 지시어로 명시
2. **Framer Motion**: `layout` prop으로 레이아웃 애니메이션 최적화
3. **Recharts**: `ResponsiveContainer`로 반응형 차트

### 7.3 번들 최적화

1. **Static Export**: `output: 'export'`로 정적 HTML 생성
2. **Tree Shaking**: ES Module 기반 import
3. **Code Splitting**: Next.js 자동 코드 분할

---

## 8. 핵심 알고리즘 요약

### 8.1 비용 비교 기준

**매수**: `effectiveCost` (실질 주거비)
- 총비용 - 시세상승분
- 자산 이익을 반영한 실질 주거비용

**전세/월세**: `netTotal` (순비용)
- 총비용 - 세제혜택
- 자산 증식 효과 없음

### 8.2 순자산 비교 기준

**공통 기준선**: 매수 자기자본
- 매수: 시세 - 잔여대출
- 전세: 초기여유금 투자 + 월절약액 적립 + 보증금 - 전세대출
- 월세: 초기여유금 투자 + 월절약액 적립 + 보증금

### 8.3 추천 알고리즘

1. 순자산 최대화 기준 (명목가치)
2. 인플레이션 시나리오별 맞춤 조언
3. 레버리지 전략 제시
4. 리스크 경고

---

## 9. 주요 특징 및 강점

### 9.1 정확한 세금 계산
- 취득세 점진 공식 (6~9억 구간)
- 재산세/종부세 브라켓 적용
- 양도세 비과세 조건 체크
- 장기보유특별공제 자동 계산

### 9.2 다양한 시나리오 분석
- 인플레이션 시나리오별 비교 (저/중/고)
- 주택가격 변동률별 손익분기 분석
- 연도별 누적 비용 시계열
- 순자산 변화 시뮬레이션

### 9.3 레버리지 효과 분석
- LTV 비율별 ROE 계산
- 무대출 대비 레버리지 효과 표시
- 인플레이션 시나리오별 레버리지 전략 제시

### 9.4 모바일 최적화 UI
- 바텀시트 기반 입력
- 스와이프 제스처 지원
- Framer Motion 애니메이션
- Safe Area 대응

### 9.5 실시간 계산
- 입력 변경 시 즉시 재계산
- LocalStorage 영속화
- DevTools 디버깅 지원

---

## 10. 개선 가능 영역

### 10.1 기능 확장
- [ ] 다주택자 중과세율 적용
- [ ] 조정대상지역 규제 반영
- [ ] 월세 상승률 시뮬레이션
- [ ] 전세 → 월세 전환 시나리오
- [ ] 대출 중도상환 시뮬레이션

### 10.2 UI/UX 개선
- [ ] 차트 확대/축소 기능
- [ ] 비교 결과 PDF 내보내기
- [ ] 시나리오 저장/불러오기
- [ ] 다크 모드 지원

### 10.3 성능 개선
- [ ] Web Worker로 계산 오프로드
- [ ] Virtual Scrolling (긴 리스트)
- [ ] 이미지 최적화 (Next.js Image)

### 10.4 테스트
- [ ] 단위 테스트 (Jest)
- [ ] E2E 테스트 (Playwright)
- [ ] 계산 정확도 검증

---

## 11. 결론

이 애플리케이션은 **매수/전세/월세 비교 계산기**로서 다음과 같은 핵심 가치를 제공합니다:

1. **정확한 금융 계산**: 한국 세법을 정확히 반영한 세금 계산
2. **다차원 분석**: 인플레이션, 레버리지, 순자산 등 다각도 분석
3. **직관적 UI**: 모바일 최적화된 바텀시트 기반 입력
4. **실시간 피드백**: 입력 즉시 결과 업데이트
5. **맞춤 추천**: 시나리오별 최적 선택 및 전략 제시

**기술 스택**:
- Next.js 14 (App Router, Static Export)
- TypeScript (Strict Mode)
- Zustand (상태 관리)
- Recharts (차트)
- Framer Motion (애니메이션)
- Tailwind CSS (스타일링)

**아키텍처 특징**:
- 계층적 컴포넌트 구조
- 순수 함수 기반 계산 로직
- 타입 안전성 보장
- 반응형 상태 관리

이 보고서는 app 폴더의 모든 주요 파일과 로직을 분석하여 작성되었으며, 프로젝트의 전체 구조와 동작 방식을 상세히 설명합니다.
