# 프로젝트 연구 문서 (Research Document)

## 1. 프로젝트 개요

### 1.1 프로젝트 명
**집 살까? 전세 살까?** - 주거 선택 비교 시뮬레이터

### 1.2 목적
매수(주택 구입), 전세, 월세 세 가지 주거 형태의 장기 비용과 순자산 변화를 정밀하게 계산하여 사용자에게 최적의 주거 선택을 추천하는 웹 애플리케이션

### 1.3 핵심 가치
- 실제 한국 부동산 세법 및 금융 규정 반영
- 인플레이션 시나리오별 시뮬레이션
- 순자산 변화 기반 장기 재무 분석
- 모바일 최적화 UX

### 1.4 기술 스택
- **프레임워크**: Next.js 14.2.35 (App Router)
- **언어**: TypeScript 5
- **상태관리**: Zustand 5.0.11 (persist, devtools)
- **폼 관리**: React Hook Form 7.71.2 + Zod 4.3.6
- **차트**: Recharts 3.7.0
- **애니메이션**: Framer Motion 12.34.3
- **스타일링**: Tailwind CSS 3.4.1
- **개발 서버**: 0.0.0.0:9999 (외부 접근 가능)

---

## 2. 아키텍처 구조

### 2.1 디렉토리 구조
```
app/
├── src/
│   ├── app/
│   │   ├── calculator/page.tsx    # 메인 계산기 페이지
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   ├── page.tsx               # 홈 (→ /calculator 리다이렉트)
│   │   └── globals.css
│   ├── components/
│   │   ├── charts/                # 차트 컴포넌트
│   │   ├── inputs/                # 입력 컴포넌트
│   │   ├── layout/                # 레이아웃 컴포넌트
│   │   └── results/               # 결과 표시 컴포넌트
│   ├── lib/
│   │   ├── calculations/          # 핵심 계산 로직
│   │   ├── constants/             # 상수 및 기본값
│   │   ├── schemas/               # Zod 스키마
│   │   ├── store/                 # Zustand 스토어
│   │   └── utils/                 # 유틸리티 함수
│   └── types/
│       └── index.ts               # 전역 타입 정의
├── public/
│   └── manifest.json              # PWA 매니페스트
└── [설정 파일들]
```

### 2.2 데이터 흐름
```
사용자 입력 (PriceStepCard, PeriodStepCard)
    ↓
Zustand Store (calculatorStore.ts)
    ↓
계산 엔진 (lib/calculations/)
    ↓
결과 컴포넌트 (AutoRecommendation, Charts, Summary)
```

---

## 3. 핵심 타입 시스템

### 3.1 기본 타입
```typescript
type Won = number;                    // 원화 금액 (정수)
type Rate = number;                   // 비율 (소수): 5% = 0.05
type Years = number;                  // 연수 (양의 정수)
type HomeOwnerCount = 1 | 2 | 3;      // 보유 주택 수
type LoanRepaymentType = 'equal_payment' | 'equal_principal' | 'bullet';
type JeonseInsuranceProvider = 'none' | 'hf' | 'hug' | 'sgi';
type ScenarioKey = 'buy' | 'jeonse' | 'monthlyRent';
type InflationScenario = 'low' | 'medium' | 'high';
```

### 3.2 입력 타입
#### BuyInputs (매수)
- purchasePrice: 매매가
- areaM2: 전용면적
- numHomes: 보유 주택 수
- loanAmount: 대출금
- loanRate: 대출금리
- loanType: 상환방식
- yearsToHold: 보유기간
- annualPriceChangeRate: 연간 시세 변동률
- availableCash: 현재 보유 자산
- isFirstHomeBuyer: 생애최초 여부
- expectedInvestmentReturn: 기대 투자수익률
- userSetPriceChangeRate/userSetLoanRate/userSetInvestmentReturn: 사용자 직접 입력 플래그

#### JeonseInputs (전세)
- depositAmount: 보증금
- loanAmount: 전세대출금
- loanRate: 대출금리
- insuranceProvider: 보증보험사
- yearsToHold: 거주기간
- expectedInvestmentReturn: 기대 투자수익률
- availableCash: 현재 보유 자산
- rentGrowthRate: 전세가 상승률

#### MonthlyRentInputs (월세)
- depositAmount: 보증금
- monthlyRent: 월세
- yearsToHold: 거주기간
- expectedInvestmentReturn: 기대 투자수익률
- availableCash: 현재 보유 자산
- areaM2: 전용면적
- marketPrice: 시세
- rentGrowthRate: 월세 상승률

### 3.3 결과 타입
#### CostBreakdown (매수 결과)
- initialCosts: 취득세, 중개수수료, 법무비용, 채권할인, 등록세, 인지세
- annualHoldingCosts: 재산세, 종부세, 관리비, 대출이자
- disposalCosts: 양도소득세, 중개수수료
- opportunityCost: 자기자본 기회비용
- taxBenefits: 생애최초 감면
- assetGain: 최종 시세, 시세차익, 실질 주거비
- grandTotal, netTotal, effectiveCost

#### JeonseCostBreakdown
- initialCosts: 중개수수료, 보증보험료
- periodicCosts: 대출이자, 기회비용
- taxBenefits: 대출이자 소득공제
- grandTotal, netTotal

#### MonthlyRentCostBreakdown
- initialCosts: 중개수수료
- periodicCosts: 총 월세, 기회비용
- taxBenefits: 월세 세액공제
- grandTotal, netTotal

---

## 4. 계산 엔진 상세

### 4.1 매수 시나리오 (buy.ts)

#### 초기 비용
1. **취득세** (calculateAcquisitionTax)
   - 1주택: 6억 이하 1%, 6~9억 점진 공식 `(가액(억)×2-3)/100`, 9억 초과 3%
   - 2주택: 동일 (조정대상지역 제외)
   - 3주택 이상: 12%
   - 지방교육세: 취득세의 10%
   - 농어촌특별세: 전용면적 85㎡ 초과 시 취득세의 10%
   - 생애최초 감면: 12억 이하, 최대 200만원

2. **중개수수료** (calculateBuyAgentFee)
   - 5천만 이하: 0.6% (상한 25만)
   - 2억 이하: 0.5% (상한 80만)
   - 9억 이하: 0.4%
   - 12억 이하: 0.5%
   - 15억 이하: 0.6%
   - 15억 초과: 0.7%

3. **기타 비용**
   - 법무비용: 1억 이하 30만, 3억 이하 45만, 6억 이하 60만, 초과 80만
   - 채권할인: 매매가의 0.4%
   - 등록세: 매매가의 0.2%
   - 인지세: 10억 이상 35만, 1억 이상 15만

#### 보유 비용 (연간)
1. **재산세** (calculatePropertyTax)
   - 과세표준 = 공시가격(시세×70%) × 공정시장가액비율(60%)
   - 브라켓: 6천만 이하 0.1%, 1.5억 이하 0.15%, 3억 이하 0.25%, 초과 0.4%

2. **종합부동산세** (calculateComprehensiveRealEstateTax)
   - 기본공제: 1세대 1주택 12억, 일반 9억
   - 과세표준 = (공시가격 - 공제) × 60%
   - 브라켓: 3억 이하 0.5%, 6억 이하 0.7%, 12억 이하 1.0%, 25억 이하 1.3%, 50억 이하 1.5%, 94억 이하 2.0%, 초과 2.7%

3. **관리비** (estimateAnnualMaintenanceFee)
   - 월 관리비 = 전용면적(㎡) × 2,920원
   - 연간 = 월 관리비 × 12

4. **대출이자** (calculateLoanRepayment)
   - 원리금균등: 월 상환액 = P × [r(1+r)^n] / [(1+r)^n - 1]
   - 원금균등: 매월 원금 고정, 이자 = 잔여원금 × 월이자율
   - 만기일시: 이자만 납부

#### 처분 비용
1. **양도소득세** (calculateCapitalGainsTax)
   - 1세대 1주택 비과세: 2년 보유 + 2년 거주 + 양도가 12억 이하
   - 12억 초과분만 과세
   - 장기보유특별공제: 보유 3년 이상, 실거주 시 연 4% (최대 80%), 비실거주 연 2% (최대 30%)
   - 기본공제: 250만원
   - 브라켓: 1,400만 이하 6%, 5,000만 이하 15%, 8,800만 이하 24%, 1.5억 이하 35%, 3억 이하 38%, 5억 이하 40%, 10억 이하 42%, 초과 45%

2. **중개수수료**: 매도가 기준 동일 브라켓 적용

#### 자기자본 기회비용
- 자기자본 = 매매가 - 대출금
- 기회비용 = 자기자본 × 기대투자수익률 × 보유기간

#### 실질 주거비 (effectiveCost)
- 실질 주거비 = 총비용 - 시세차익
- 시세차익 = 최종시세 - 매매가
- 최종시세 = 매매가 × (1 + 연간변동률)^보유기간

### 4.2 전세 시나리오 (jeonse.ts)

#### 초기 비용
1. **중개수수료** (calculateRentAgentFee)
   - 5천만 이하: 0.5% (상한 20만)
   - 1억 이하: 0.4% (상한 30만)
   - 6억 이하: 0.3%
   - 12억 이하: 0.4%
   - 15억 이하: 0.5%
   - 15억 초과: 0.6%

2. **보증보험료** (calcInsurancePremium)
   - HF(주택금융공사): 0.04~0.18% (연)
   - HUG(주택도시보증공사): 0.111~0.211% (연)
   - SGI(서울보증보험): 0.183~0.208% (연)
   - 총 보험료 = 보증금 × 평균요율 × 거주기간

#### 주기적 비용
1. **대출이자**: 전세대출은 만기일시상환 (이자만 납부)
   - 연간 이자 = 대출금 × 대출금리

2. **기회비용**: 자기자본(보증금 - 대출금) × 기대투자수익률 × 거주기간

3. **보증금 상승 반영** (2년마다 재계약)
   - 법정 상한: 5%
   - 실제 상승률 = min(시장 상승률, 5%)
   - 연도별 보증금 = 초기보증금 × (1 + 상승률)^재계약횟수

### 4.3 월세 시나리오 (monthlyRent.ts)

#### 초기 비용
- **중개수수료**: 거래금액 기준 (보증금 + 월세×100)

#### 주기적 비용
1. **월세**: 2년마다 재계약 시 법정 상한 5% 적용
   - 재계약 시 월세 = 이전 월세 × (1 + min(시장상승률, 5%))

2. **기회비용**: 보증금 × 기대투자수익률 × 거주기간

### 4.4 손익분기 분석 (breakeven.ts)

#### 연도별 누적 비용 (generateYearlyCostSeries)
- 각 연도(1~보유기간)에 대해 독립적으로 재계산
- 매수: effectiveCost (실질 주거비)
- 전세/월세: netTotal

#### 시세 변동률별 분석 (generateBreakevenSeries)
- 변동률 범위: -10% ~ +15%
- 각 변동률에 대해 매수 비용 재계산
- 전세/월세는 고정

#### 순자산 변화 시뮬레이션 (generateAssetProjectionSeries)
**공통 기준**: 사용자의 availableCash를 초기 보유 현금으로 설정

**매수 순자산**:
- 순자산 = 시세(연도별) - 잔여대출
- 시세 = 매매가 × (1 + 연간변동률)^연도

**전세 순자산**:
- 초기 투자금 = availableCash - 자기부담 보증금
- 월 절약액 = 매수 월지출 - 전세 월지출(이자만)
- 순자산 = 초기투자금 복리운용 + 월절약액 적립 + 보증금 - 전세대출
- 보증금은 2년마다 재계약 시 법정 상한 5% 적용

**월세 순자산**:
- 초기 투자금 = availableCash - 보증금
- 월 절약액 = 매수 월지출 - 월세
- 순자산 = 초기투자금 복리운용 + 월절약액 적립 + 보증금
- 월세는 2년마다 재계약 시 법정 상한 5% 적용

### 4.5 추천 로직 (recommendation.ts)

#### 추천 기준
1. **1순위**: 보유기간 종료 시점 순자산이 가장 높은 시나리오
2. **2순위**: 두 번째로 높은 시나리오

#### 인플레이션 시나리오별 조언
**저인플레이션 (low)**:
- 월세 선택 시: 투자 수익으로 월세 상쇄 가능, 유동성 확보
- 매수 선택 시: 낮은 금리로 대출 부담 적음, LTV 60% 권장

**중인플레이션 (medium)**:
- 매수 선택 시: 레버리지 효과 큼, LTV 60~70% + 여유자금 투자 병행
- 월세 선택 시: 투자수익률 7% 이상 필요

**고인플레이션 (high)**:
- 매수 선택 시: 부동산 헤지 수단, 실질 부채 감소, 최대 LTV 70% 권장
- 월세 선택 시: 투자수익률 10% 이상 필요, 장기 계약 고려

#### 경고 메시지
- 전세: 기회비용 크고 자산 증식 효과 없음
- 고금리 시 매수: 초기 이자 부담 클 수 있음
- 월세: 투자수익률 미달성 시 불리

---

## 5. 상태 관리 (Zustand Store)

### 5.1 calculatorStore.ts 구조
```typescript
interface CalculatorState {
  buyInputs: BuyInputs;
  jeonseInputs: JeonseInputs;
  monthlyRentInputs: MonthlyRentInputs;
  results: CalculationResults | null;
  activeTab: ScenarioKey;
  inflationScenario: InflationScenario;
  recommendation: Recommendation | null;
  
  updateBuyInputs: (partial: Partial<BuyInputs>) => void;
  updateJeonseInputs: (partial: Partial<JeonseInputs>) => void;
  updateMonthlyRentInputs: (partial: Partial<MonthlyRentInputs>) => void;
  calculate: () => void;
  resetAll: () => void;
  setActiveTab: (tab: ScenarioKey) => void;
}
```

### 5.2 주요 기능
1. **자동 계산**: 입력 변경 시 즉시 재계산
2. **인플레이션 시나리오 적용**: 사용자 직접 입력 플래그가 없는 경우에만 시나리오 파라미터 적용
3. **로컬 스토리지 영속화**: 입력값과 시나리오 설정 저장
4. **Devtools 통합**: Redux DevTools로 상태 디버깅 가능

### 5.3 인플레이션 파라미터 (inflation.ts)
| 시나리오 | 인플레이션 | 주택가격 상승 | 전월세 상승 | 대출금리 | 투자수익률 |
|---------|----------|------------|----------|---------|----------|
| low     | 1.5%     | 2%         | 2%       | 3%      | 5%       |
| medium  | 3%       | 4%         | 4.5%     | 4%      | 7%       |
| high    | 5%       | 6.5%       | 7%       | 5.5%    | 10%      |

---

## 6. UI 컴포넌트 구조

### 6.1 입력 컴포넌트 (components/inputs/)

#### PriceStepCard.tsx
- **현재 보유 자산**: 슬라이더 + 프리셋 버튼 (1억~5억)
- **매수 정보**: 매매가, 전용면적, 보유주택수, 대출금, 대출금리, 상환방식, 생애최초 여부
- **전세 정보**: 보증금, 대출금, 대출금리, 보증보험사
- **월세 정보**: 보증금, 월세
- **고급 설정**: 시세 변동률, 투자수익률 (AdvancedSheet)

#### PeriodStepCard.tsx
- 보유/거주 기간 선택 (1~30년)
- 인플레이션 시나리오 선택 (low/medium/high)

#### NumberPadInput.tsx
- 모바일 최적화 숫자 입력 바텀시트
- 프리셋 버튼 + 직접 입력
- 천만/억 단위 빠른 입력

#### AdvancedSheet.tsx
- 시세 변동률, 투자수익률 직접 입력
- 사용자 입력 시 인플레이션 시나리오 무시

### 6.2 결과 컴포넌트 (components/results/)

#### AutoRecommendation.tsx
- 최적 시나리오 표시
- 차선 대비 순자산 차이
- 인플레이션 시나리오별 조언

#### MonthlyCostSummary.tsx
- 예상 월 지출 비용 비교 (매수/전세/월세)
- 최저 비용 강조

#### ScenarioSwipeCards.tsx
- 스와이프 가능한 시나리오 카드
- 각 시나리오별 상세 비용 표시

#### CostDetailSheet.tsx
- 비용 항목별 상세 내역 바텀시트
- 초기/보유/처분 비용 분류

#### LeverageSimulator.tsx
- LTV 조정 시뮬레이터
- 레버리지 효과 실시간 계산

#### WinnerBanner.tsx
- 최적 시나리오 배너

### 6.3 차트 컴포넌트 (components/charts/)

#### AssetProjectionChart.tsx
- 연도별 순자산 변화 라인 차트
- 매수/전세/월세 비교

#### YearlyCostChart.tsx
- 연도별 누적 비용 라인 차트

#### BreakevenChart.tsx
- 시세 변동률별 손익분기 라인 차트

#### ScenarioBarChart.tsx
- 시나리오별 총비용 바 차트

#### ScenarioComparisonChart.tsx
- 시나리오 비교 차트 (미구현)

---

## 7. 기본값 및 상수

### 7.1 기본 시나리오 (defaults.ts)
```typescript
DEFAULT_BUY_INPUTS:
  - 매매가: 6억
  - 전용면적: 84㎡
  - 보유주택: 1
  - 대출금: 3.6억 (LTV 60%)
  - 대출금리: 3.8%
  - 상환방식: 원리금균등
  - 보유기간: 5년
  - 시세변동률: 3%
  - 보유자산: 1억
  - 투자수익률: 3%

DEFAULT_JEONSE_INPUTS:
  - 보증금: 4.5억
  - 대출금: 2억
  - 대출금리: 3.5%
  - 보증보험: HUG
  - 거주기간: 5년
  - 보유자산: 1억
  - 투자수익률: 3%

DEFAULT_MONTHLY_RENT_INPUTS:
  - 보증금: 5천만
  - 월세: 150만
  - 거주기간: 5년
  - 보유자산: 1억
  - 전용면적: 84㎡
  - 시세: 6억
  - 투자수익률: 3%
```

### 7.2 세율 및 브라켓 (taxRates.ts)
- PROPERTY_TAX_BRACKETS: 재산세 4단계
- COMPREHENSIVE_TAX_BRACKETS: 종부세 7단계
- CAPITAL_GAINS_TAX_BRACKETS: 양도세 8단계
- BUY_AGENT_FEE_BRACKETS: 매매 중개수수료 6단계
- RENT_AGENT_FEE_BRACKETS: 임대차 중개수수료 6단계
- JEONSE_INSURANCE_RATES: 전세보증보험 3사 요율
- LEGAL_CONVERSION_RATE_CAP: 법정 전월세전환율 상한 5%

---

## 8. 유틸리티 함수

### 8.1 포맷팅 (format.ts)
- **formatWon**: 1억 이상 "X.X억원", 만 이상 "X만원", 미만 "X원"
- **formatWonShort**: 차트용 단위 없는 포맷
- **formatRate**: 퍼센트 포맷 (소수점 1자리)
- **parseWonInput**: 쉼표 포함 문자열 → 숫자
- **formatWonCompact**: 바텀시트 제목용 컴팩트 표기

---

## 9. PWA 설정

### 9.1 manifest.json
```json
{
  "name": "집 살까? 전세 살까?",
  "short_name": "주거비교",
  "description": "매수 vs 전세 vs 월세 비교",
  "start_url": "/calculator",
  "display": "standalone",
  "theme_color": "#3182F6",
  "orientation": "portrait"
}
```

### 9.2 메타데이터 (layout.tsx)
- title: "집 살까? 전세 살까?"
- description: "매수 vs 전세 vs 월세 — 어떤 선택이 유리한지 계산해보세요"
- viewport: 모바일 최적화 (user-scalable=false)
- themeColor: #3182F6

---

## 10. 개발 환경

### 10.1 스크립트
```json
{
  "dev": "next dev --hostname 0.0.0.0 --port 9999",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

### 10.2 TypeScript 설정
- strict 모드 활성화
- path alias: `@/*` → `./src/*`
- JSX: preserve (Next.js 처리)

### 10.3 Tailwind 설정
- 커스텀 컬러: background, foreground (CSS 변수)
- 플러그인: 없음 (기본 유틸리티만 사용)

---

## 11. 주요 계산 공식 요약

### 11.1 취득세 (6~9억 점진 공식)
```
세율 = (취득가액(억원) × 2 - 3) / 100
예: 7억 = (7×2-3)/100 = 11/100 = 11%
```

### 11.2 재산세
```
과세표준 = 공시가격(시세×70%) × 공정시장가액비율(60%)
재산세 = 과세표준 × 브라켓 세율 - 누진공제
```

### 11.3 종합부동산세
```
과세표준 = (공시가격 - 기본공제) × 60%
종부세 = 과세표준 × 브라켓 세율 - 공제액
```

### 11.4 양도소득세
```
양도차익 = 양도가 - 취득가 - 취득비용
장기보유특별공제 = 양도차익 × (보유연수 × 4% or 2%, 최대 80% or 30%)
과세표준 = (양도차익 - 공제) - 기본공제(250만)
양도세 = 과세표준 × 브라켓 세율 - 공제액
```

### 11.5 원리금균등상환
```
월 상환액 = P × [r(1+r)^n] / [(1+r)^n - 1]
P: 원금, r: 월이자율, n: 총 개월수
```

### 11.6 순자산 변화 (전세/월세)
```
초기투자금 미래가치 = 초기투자금 × (1 + 연수익률)^연도
월절약액 적립 미래가치 = 월절약액 × [(1+월이율)^개월수 - 1] / 월이율
순자산 = 초기투자금 미래가치 + 월절약액 적립 미래가치 + 보증금 - 대출금
```

---

## 12. 핵심 비즈니스 로직

### 12.1 2년 재계약 시 법정 상한 적용
- 전세 보증금: 2년마다 min(시장상승률, 5%) 적용
- 월세: 2년마다 min(시장상승률, 5%) 적용
- 재계약 횟수 = floor((연도 - 1) / 2)

### 12.2 사용자 직접 입력 우선순위
- 인플레이션 시나리오 파라미터는 기본값
- 사용자가 직접 입력한 값은 userSet 플래그로 보호
- 시나리오 변경 시에도 사용자 입력값 유지

### 12.3 순자산 기준 추천
- 기존 "비용 최소화" 대신 "순자산 최대화" 기준
- 매수는 시세차익 반영 (effectiveCost)
- 전세/월세는 투자 복리 효과 + 월절약액 적립 반영

### 12.4 연도별 시세 상승 반영
- 재산세/종부세: 매년 상승한 시세 기준 재계산
- 양도세: 최종 연도 시세 기준
- 순자산: 매년 시세 - 잔여대출

---

## 13. 개선 가능 영역

### 13.1 미구현 기능
- ScenarioComparisonChart (빈 컴포넌트)
- 월세 세액공제 실제 계산 (현재 0)
- 전세대출 이자 소득공제 실제 계산 (현재 0)
- 다주택자 중과세율 (현재 기본세율만)

### 13.2 정확도 개선 가능
- 공시가격 70% 근사치 → 실제 공시가격 API 연동
- 관리비 평균 2,920원/㎡ → 지역별/단지별 실제 데이터
- 법무비용 고정값 → 실제 견적 범위

### 13.3 UX 개선 가능
- 시나리오별 상세 비용 비교 테이블
- 레버리지 시뮬레이터 고도화
- 민감도 분석 (금리, 시세 변동률 동시 변화)
- 저장/공유 기능

---

## 14. 테스트 시나리오

### 14.1 기본 시나리오 (6억 주택, 5년 보유)
- 매수: LTV 60%, 3.8% 금리, 원리금균등
- 전세: 4.5억 보증금, 2억 대출, 3.5% 금리
- 월세: 5천만 보증금, 150만 월세
- 예상 결과: 중인플레이션 시 매수 유리

### 14.2 고가 주택 (12억, 10년 보유)
- 종부세 발생 구간
- 양도세 12억 초과분 과세
- 장기보유특별공제 최대 적용

### 14.3 저가 주택 (3억, 3년 보유)
- 취득세 1%
- 종부세 미발생
- 단기 보유 시 월세 유리 가능성

### 14.4 생애최초 구입 (6억, 5년 보유)
- 취득세 200만원 감면
- 양도세 비과세 (2년 보유 + 거주)

---

## 15. 참고 법령 및 기준

### 15.1 세법
- 지방세법: 취득세, 재산세, 등록세
- 종합부동산세법: 종부세
- 소득세법: 양도소득세, 월세 세액공제

### 15.2 부동산 규정
- 주택임대차보호법: 전월세 상한 5%
- 공인중개사법: 중개수수료 상한
- 주택법: 전용면적 기준

### 15.3 금융 규정
- LTV(주택담보대출비율): 일반 60%, 규제지역 40%
- 전세보증보험: HF, HUG, SGI 요율

---

## 16. 결론

이 프로젝트는 한국 부동산 시장의 복잡한 세법과 금융 규정을 정확히 반영하여, 사용자가 매수/전세/월세 중 최적의 선택을 할 수 있도록 돕는 실용적인 도구입니다. 

**핵심 차별점**:
1. 순자산 변화 기반 장기 재무 분석
2. 인플레이션 시나리오별 시뮬레이션
3. 2년 재계약 시 법정 상한 반영
4. 투자 기회비용 및 복리 효과 정밀 계산
5. 모바일 최적화 UX

**기술적 강점**:
- TypeScript 타입 안정성
- Zustand 경량 상태관리
- Next.js App Router 최신 아키텍처
- 계산 로직과 UI 완전 분리

이 문서는 프로젝트의 모든 계산 로직, 타입 시스템, 컴포넌트 구조, 비즈니스 규칙을 상세히 기록하여, 향후 유지보수 및 기능 확장의 기준이 됩니다.
