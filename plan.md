# 프로젝트 개선 계획 (Improvement Plan)

## 개선 작업 목록

---

## 개선 #5: 매수 순자산 계산에 초기 비용 반영

### 📋 문제 분석

**현재 문제점**:
- 순자산 변화 그래프에서 매수가 1년차부터 전세/월세보다 유리하게 표시됨
- 실제로는 매수 시 초기에 큰 비용이 지출되어야 함:
  - 취득세 (1~12%)
  - 중개수수료 (0.4~0.7%)
  - 법무비용 (30~80만원)
  - 채권할인 (0.4%)
  - 등록세 (0.2%)
  - 인지세 (15~35만원)
- 예: 6억 주택 매수 시 초기 비용 약 1,500~2,000만원 발생
- 이 비용들이 순자산 계산에 반영되지 않아 매수가 과대평가됨

**현재 순자산 계산 로직** (`breakeven.ts`):
```typescript
// 매수 순자산 = 금융자산 + 부동산 시세 - 잔여대출
const buyNetAsset = buyFinancialAsset + salePrice - buyLoanSchedule.remainingPrincipal;
```

**문제**:
- `buyFinancialAsset`은 초기 여유금(`availableCash - purchasePrice`)만 반영
- 실제로는 매수 시 초기 비용이 추가로 지출되어 금융자산이 감소해야 함
- 전세/월세는 초기 비용이 적어서 상대적으로 불리하게 계산됨

### 🎯 개선 방향

**올바른 순자산 계산**:
```typescript
// 매수 순자산 = (금융자산 - 초기 비용) + 부동산 시세 - 잔여대출
const buyNetAsset = (buyFinancialAsset - initialCosts) + salePrice - buyLoanSchedule.remainingPrincipal;
```

**초기 비용 구성**:
1. 취득세 (acquisitionTax)
2. 중개수수료 (agentFee)
3. 법무비용 (legalFee)
4. 채권할인 (bondDiscount)
5. 등록세 (registrationTax)
6. 인지세 (stampDuty)

### 🎯 작업 범위

#### 1. 초기 비용 계산 함수 추출
**파일**: `app/src/lib/calculations/buy.ts`

- [ ] 초기 비용 계산 로직을 별도 함수로 추출
- [ ] `calculateBuyInitialCosts()` 함수 생성

**추가할 함수**:
```typescript
/**
 * 매수 시 초기 비용 계산
 * @returns 초기 비용 총액 (취득세 + 중개수수료 + 법무비용 + 채권할인 + 등록세 + 인지세)
 */
export function calculateBuyInitialCosts(
  purchasePrice: number,
  numHomes: number,
  areaM2: number,
  isFirstHomeBuyer: boolean,
): number {
  const acqTax = calculateAcquisitionTax(purchasePrice, numHomes, areaM2, isFirstHomeBuyer);
  const buyAgentFee = calculateBuyAgentFee(purchasePrice);
  const legalFee = estimateLegalFee(purchasePrice);
  const bondDiscount = estimateBondDiscountCost(purchasePrice);
  const { registrationTax, stampDuty } = calcRegistrationCosts(purchasePrice);
  
  // 생애최초 감면은 제외 (실제 지출액만 계산)
  return acqTax.total + buyAgentFee + legalFee + bondDiscount + registrationTax + stampDuty;
}
```

**주의사항**:
- `acqTax.firstHomeReduction`은 제외 (세금 감면은 실제 지출이 아님)
- 순수하게 지출되는 현금만 계산

#### 2. 순자산 계산 로직 수정
**파일**: `app/src/lib/calculations/breakeven.ts`

- [ ] `generateAssetProjectionSeries()` 함수 수정
- [ ] 매수 순자산 계산 시 초기 비용 차감

**수정 전**:
```typescript
const buyNetAsset = Math.round(buyFinancialAsset + salePrice - buyLoanSchedule.remainingPrincipal);
```

**수정 후**:
```typescript
// 초기 비용 계산
const buyInitialCosts = calculateBuyInitialCosts(
  purchasePrice,
  numHomes,
  buyInputs.areaM2,
  buyInputs.isFirstHomeBuyer
);

// 순자산 = 금융자산 - 초기 비용 + 부동산 시세 - 잔여대출
const buyNetAsset = Math.round(
  buyFinancialAsset - buyInitialCosts + salePrice - buyLoanSchedule.remainingPrincipal
);
```

#### 3. 전세/월세 초기 비용도 반영 (공정한 비교)
**파일**: `app/src/lib/calculations/breakeven.ts`

- [ ] 전세 초기 비용 계산 (중개수수료 + 보증보험료)
- [ ] 월세 초기 비용 계산 (중개수수료)
- [ ] 각 시나리오 순자산에서 초기 비용 차감

**전세 초기 비용**:
```typescript
import { calculateRentAgentFee } from './agentFees';
import { calcInsurancePremium } from './jeonse';

// 전세 초기 비용
const jeonseAgentFee = calculateRentAgentFee(jeonseInputs.depositAmount);
const jeonseInsurancePremium = calcInsurancePremium(
  jeonseInputs.depositAmount,
  jeonseInputs.insuranceProvider,
  yearsToHold
);
const jeonseInitialCosts = jeonseAgentFee + jeonseInsurancePremium;

// 전세 순자산 = 금융자산 - 초기 비용 + 보증금 - 전세대출
const jeonseNetAsset = Math.round(
  jeonseFinancialAsset - jeonseInitialCosts + currentJeonseDeposit - jeonseLoanAmount
);
```

**월세 초기 비용**:
```typescript
// 월세 초기 비용 (거래금액 = 보증금 + 월세×100)
const rentTransactionAmount = monthlyRentInputs.depositAmount + monthlyRentInputs.monthlyRent * 100;
const rentAgentFee = calculateRentAgentFee(rentTransactionAmount);
const rentInitialCosts = rentAgentFee;

// 월세 순자산 = 금융자산 - 초기 비용 + 보증금
const monthlyRentNetAsset = Math.round(
  rentFinancialAsset - rentInitialCosts + monthlyRentInputs.depositAmount
);
```

#### 4. 함수 export 추가
**파일**: `app/src/lib/calculations/buy.ts`

- [ ] `estimateLegalFee` 함수 export
- [ ] `estimateBondDiscountCost` 함수 export
- [ ] `calcRegistrationCosts` 함수 export
- [ ] `calculateBuyInitialCosts` 함수 export (신규)

**수정 전**:
```typescript
function estimateLegalFee(price: number): number { ... }
function estimateBondDiscountCost(price: number): number { ... }
function calcRegistrationCosts(price: number): { ... } { ... }
```

**수정 후**:
```typescript
export function estimateLegalFee(price: number): number { ... }
export function estimateBondDiscountCost(price: number): number { ... }
export function calcRegistrationCosts(price: number): { ... } { ... }
export function calculateBuyInitialCosts(...): number { ... }
```

#### 5. 전세 보증보험료 계산 함수 export
**파일**: `app/src/lib/calculations/jeonse.ts`

- [ ] `calcInsurancePremium` 함수 export 확인
- [ ] 이미 export되어 있으면 패스

### 📊 예상 효과

**6억 주택, 5년 보유 기준**:

**현재 (잘못된 계산)**:
- 1년차 매수 순자산: 약 2.5억 (초기 비용 미반영)
- 1년차 전세 순자산: 약 1.2억
- → 매수가 1.3억 유리 (과대평가)

**개선 후 (올바른 계산)**:
- 매수 초기 비용: 약 1,800만원
- 1년차 매수 순자산: 약 2.32억 (초기 비용 반영)
- 전세 초기 비용: 약 150만원
- 1년차 전세 순자산: 약 1.05억 (초기 비용 반영)
- → 매수가 1.27억 유리 (정확한 비교)

**단기 보유 시 영향**:
- 1~2년 보유 시 초기 비용의 영향이 크게 나타남
- 매수가 단기적으로 불리할 수 있음을 정확히 반영
- 장기 보유 시 시세차익으로 초기 비용 상쇄

### ⚠️ 주의사항

1. **초기 비용은 1년차에만 차감**:
   - 초기 비용은 매수/전세/월세 시작 시점에 1회만 발생
   - 연도별 순자산 계산 시 매년 차감하면 안 됨
   - 1년차부터 모든 연도에 동일하게 차감

2. **생애최초 감면은 제외**:
   - `acqTax.firstHomeReduction`은 세금 감면이지 실제 지출이 아님
   - 순자산 계산에서는 실제 지출액만 반영

3. **처분 비용은 제외**:
   - 양도소득세, 매도 중개수수료는 매도 시점 비용
   - 순자산 계산에서는 현재 시점 기준이므로 제외
   - (매도 시점에는 시세에서 차감되어야 하지만, 현재는 미래 시세를 그대로 사용)

4. **공정한 비교**:
   - 매수/전세/월세 모두 초기 비용 반영
   - 전세: 중개수수료 + 보증보험료
   - 월세: 중개수수료
   - 매수: 취득세 + 중개수수료 + 법무비용 + 채권할인 + 등록세 + 인지세

### ✅ 테스트 체크리스트

- [ ] 매수 초기 비용 계산 정상 (6억 기준 약 1,800만원)
- [ ] 전세 초기 비용 계산 정상 (4.5억 기준 약 150만원)
- [ ] 월세 초기 비용 계산 정상 (5천만+150만 기준 약 60만원)
- [ ] 1년차 순자산에 초기 비용 반영
- [ ] 2년차 이후에도 초기 비용 차감 유지
- [ ] 단기 보유 시 매수 불리, 장기 보유 시 매수 유리 패턴 확인
- [ ] TypeScript 컴파일 에러 없음
- [ ] 차트 표시 정상

### 📈 기대 결과

**순자산 변화 그래프**:
- 1년차: 매수가 초기 비용으로 인해 상대적으로 낮게 시작
- 2~3년차: 시세 상승으로 초기 비용 회복
- 5년차 이상: 시세차익으로 매수가 유리 (기존과 동일)

**더 정확한 추천**:
- 단기 보유(1~2년): 전세/월세가 유리할 수 있음
- 중기 보유(3~5년): 시세 상승률에 따라 달라짐
- 장기 보유(5년 이상): 매수가 유리 (시세차익 > 초기 비용)

---

## 개선 #6: 월세 상승률 버그 수정

### 📋 문제 분석

**현재 버그**:
- `monthlyRentInputs.rentGrowthRate` 필드가 기본값에 정의되지 않음
- `breakeven.ts`에서 `rentGrowthRate ?? 0` → **0%로 고정**
- 월세가 16년간 150만원으로 고정되어 비현실적
- 2년마다 재계약 시 법정 상한 5% 적용이 작동하지 않음

**코드 위치** (`breakeven.ts`):
```typescript
const rentGrowthRate = monthlyRentInputs.rentGrowthRate ?? 0;  // ← 항상 0
const rentIncreaseRate = rentGrowthRate > 0 ? Math.min(rentGrowthRate, LEGAL_CAP) : 0;  // ← 항상 0

for (let y = 1; y <= year; y++) {
  const renewalCount = Math.floor((y - 1) / CONTRACT_PERIOD);
  const currentRent = monthlyRentInputs.monthlyRent * Math.pow(1 + rentIncreaseRate, renewalCount);  // ← 상승 없음
  // ...
}
```

**영향**:
- 장기 보유 시 월세가 과소평가됨
- 월세 순자산이 과대평가됨 (저축액이 줄어들지 않음)
- 16~17년 시점에 월세가 매수를 역전하는 비현실적 결과

### 🎯 작업 범위

#### 1. 타입 정의 확인
**파일**: `app/src/types/index.ts`

- [ ] `MonthlyRentInputs`에 `rentGrowthRate` 필드 존재 확인
- [ ] 이미 있으면 패스

#### 2. 기본값 추가
**파일**: `app/src/lib/constants/defaults.ts`

- [ ] `DEFAULT_MONTHLY_RENT_INPUTS`에 `rentGrowthRate` 추가

**수정 전**:
```typescript
export const DEFAULT_MONTHLY_RENT_INPUTS: MonthlyRentInputs = {
  depositAmount: 50_000_000,
  monthlyRent: 1_500_000,
  yearsToHold: 5,
  monthlySavings: 2_000_000,
  expectedInvestmentReturn: 0.03,
  availableCash: 100_000_000,
  areaM2: 84,
  marketPrice: 600_000_000,
  userSetInvestmentReturn: false,
  // rentGrowthRate 없음 ← 버그
};
```

**수정 후**:
```typescript
export const DEFAULT_MONTHLY_RENT_INPUTS: MonthlyRentInputs = {
  depositAmount: 50_000_000,
  monthlyRent: 1_500_000,
  yearsToHold: 5,
  monthlySavings: 2_000_000,
  expectedInvestmentReturn: 0.03,
  availableCash: 100_000_000,
  areaM2: 84,
  marketPrice: 600_000_000,
  userSetInvestmentReturn: false,
  rentGrowthRate: 0.05,  // 5% 고정 (법정 상한)
};
```

#### 3. 전세 상승률도 동일하게 수정
**파일**: `app/src/lib/constants/defaults.ts`

- [ ] `DEFAULT_JEONSE_INPUTS`에 `rentGrowthRate` 추가 (일관성)

**수정 후**:
```typescript
export const DEFAULT_JEONSE_INPUTS: JeonseInputs = {
  depositAmount: 450_000_000,
  loanAmount: 200_000_000,
  loanRate: 0.035,
  insuranceProvider: 'hug',
  yearsToHold: 5,
  monthlySavings: 2_000_000,
  expectedInvestmentReturn: 0.03,
  availableCash: 100_000_000,
  userSetLoanRate: false,
  userSetInvestmentReturn: false,
  rentGrowthRate: 0.05,  // 5% 고정 (법정 상한)
};
```

### ⚠️ 주의사항

- 법정 상한 5%를 그대로 적용 (`Math.min(rentGrowthRate, LEGAL_CAP)`)
- 5% 상승률이므로 법정 상한과 동일
- 2년마다 재계약 시 5% 적용 (최대 상승률)

### ✅ 테스트 체크리스트

- [ ] 월세가 2년마다 5% 상승 확인
- [ ] 16년차 월세: `150만 × 1.05^8` ≈ 222만원
- [ ] 전세가 2년마다 5% 상승 확인
- [ ] 16년차 전세: `4.5억 × 1.05^8` ≈ 6.65억
- [ ] 월세 순자산이 현실적으로 계산됨
- [ ] 장기 보유 시 매수가 여전히 유리 (역전 현상 해소)
- [ ] TypeScript 컴파일 에러 없음

---

## 개선 #7: 투자수익률 및 주택가격 상승률 3% 고정

### 📋 개선 사유

**현재 문제점**:
- 인플레이션 시나리오(low/medium/high)에 따라 파라미터가 변경됨
- 사용자가 고급 설정에서 직접 변경 가능
- 시나리오마다 다른 가정으로 비교가 복잡하고 혼란스러움
- 일반적인 평균값으로 고정하여 단순하고 명확한 비교 제공

**고정할 값**:
- **투자수익률**: 3% (장기 평균 인플레이션율)
- **주택가격 상승률**: 3% (장기 평균 인플레이션율)
- **전월세 상승률**: 5% (법정 상한)

### 🎯 작업 범위

#### 1. 인플레이션 시나리오 제거
**파일**: `app/src/lib/store/calculatorStore.ts`

- [ ] `inflationScenario` 상태 제거
- [ ] 인플레이션 시나리오 관련 로직 제거

**제거할 코드**:
```typescript
inflationScenario: InflationScenario;  // ← 제거
```

#### 2. 기본값 고정
**파일**: `app/src/lib/constants/defaults.ts`

- [ ] 모든 시나리오의 수익률/상승률을 3%로 고정

**수정 후**:
```typescript
export const DEFAULT_BUY_INPUTS: BuyInputs = {
  // ...
  annualPriceChangeRate: 0.03,  // 3% 고정
  expectedInvestmentReturn: 0.03,  // 3% 고정
  userSetPriceChangeRate: false,  // 사용자 변경 불가
  userSetInvestmentReturn: false,  // 사용자 변경 불가
};

export const DEFAULT_JEONSE_INPUTS: JeonseInputs = {
  // ...
  expectedInvestmentReturn: 0.03,  // 3% 고정
  rentGrowthRate: 0.05,  // 5% 고정 (법정 상한)
  userSetInvestmentReturn: false,  // 사용자 변경 불가
};

export const DEFAULT_MONTHLY_RENT_INPUTS: MonthlyRentInputs = {
  // ...
  expectedInvestmentReturn: 0.03,  // 3% 고정
  rentGrowthRate: 0.05,  // 5% 고정 (법정 상한)
  userSetInvestmentReturn: false,  // 사용자 변경 불가
};
```

#### 3. 고급 설정 UI 제거
**파일**: `app/src/components/inputs/AdvancedSheet.tsx`

- [ ] 투자수익률 입력 필드 제거
- [ ] 주택가격 상승률 입력 필드 제거
- [ ] 또는 읽기 전용으로 변경하고 "3% 고정" 안내 표시

**옵션 1: 완전 제거**
```typescript
// AdvancedSheet.tsx에서 해당 입력 필드 제거
```

**옵션 2: 읽기 전용 표시**
```typescript
<div className="opacity-50 pointer-events-none">
  <label>투자수익률 (고정)</label>
  <input type="text" value="3%" readOnly />
  <p className="text-xs text-gray-500">
    💡 일반적인 평균 인플레이션율로 고정되었습니다
  </p>
</div>
```

#### 4. 인플레이션 시나리오 선택 UI 제거
**파일**: `app/src/components/inputs/PeriodStepCard.tsx`

- [ ] 인플레이션 시나리오 선택 버튼 제거
- [ ] 또는 "평균 인플레이션 3% 적용" 안내 텍스트로 대체

**수정 전**:
```typescript
<div className="grid grid-cols-3 gap-2">
  <button onClick={() => setInflationScenario('low')}>저인플레이션</button>
  <button onClick={() => setInflationScenario('medium')}>중인플레이션</button>
  <button onClick={() => setInflationScenario('high')}>고인플레이션</button>
</div>
```

**수정 후**:
```typescript
<div className="bg-blue-50 rounded-xl p-4">
  <p className="text-sm text-gray-700">
    📊 모든 계산은 <strong>평균 인플레이션 3%</strong>를 기준으로 합니다
  </p>
  <ul className="text-xs text-gray-600 mt-2 space-y-1">
    <li>• 주택가격 상승률: 3%</li>
    <li>• 전월세 상승률: 5% (법정 상한)</li>
    <li>• 투자수익률: 3%</li>
  </ul>
</div>
```

#### 5. 추천 로직 단순화
**파일**: `app/src/lib/calculations/recommendation.ts`

- [ ] 인플레이션 시나리오별 조언 제거
- [ ] 단순히 순자산 기준 최적 시나리오만 추천

**수정 전**:
```typescript
export function generateRecommendation(
  results: CalculationResults,
  inflationScenario: InflationScenario,  // ← 제거
): Recommendation {
  // 인플레이션 시나리오별 조언 로직 ← 제거
}
```

**수정 후**:
```typescript
export function generateRecommendation(
  results: CalculationResults,
): Recommendation {
  // 순자산 기준 최적 시나리오만 추천
  // 일반적인 조언만 제공
}
```

#### 6. 타입 정의 정리
**파일**: `app/src/types/index.ts`

- [ ] `InflationScenario` 타입 제거 (또는 유지하되 사용 안 함)
- [ ] `Recommendation` 인터페이스에서 `inflationScenario` 제거

### 📊 예상 효과

**단순화**:
- 사용자가 이해하기 쉬운 단일 기준
- 복잡한 시나리오 선택 불필요
- 일관된 비교 기준

**현실성**:
- 3%는 한국의 장기 평균 인플레이션율
- 주택가격, 전월세, 투자수익률 모두 동일한 기준
- 공정하고 현실적인 비교

**UI 개선**:
- 입력 단계 단순화
- 고급 설정 제거 또는 축소
- 추천 로직 명확화

### ⚠️ 주의사항

1. **기존 저장 데이터 호환성**:
   - 로컬 스토리지에 저장된 데이터에 `inflationScenario` 있을 수 있음
   - 마이그레이션 또는 무시 처리 필요

2. **userSet 플래그 제거**:
   - `userSetPriceChangeRate`, `userSetInvestmentReturn` 불필요
   - 또는 항상 `false`로 고정

3. **대출금리는 유지**:
   - 대출금리는 사용자가 실제로 받는 조건이므로 입력 가능하게 유지
   - 기본값: 매수 3.8%, 전세 3.5%

### ✅ 테스트 체크리스트

- [ ] 모든 시나리오에서 3% 고정 확인
- [ ] 인플레이션 시나리오 선택 UI 제거 확인
- [ ] 고급 설정에서 수익률/상승률 변경 불가 확인
- [ ] 추천 로직 정상 작동 (단순화된 버전)
- [ ] 기존 저장 데이터 로드 시 에러 없음
- [ ] TypeScript 컴파일 에러 없음

### 📈 기대 결과

**명확한 비교**:
- 모든 조건이 동일한 3% 기준
- 순수하게 주거 형태의 차이만 비교
- 레버리지 효과가 명확히 드러남

**사용자 경험**:
- 복잡한 설정 불필요
- 이해하기 쉬운 결과
- 빠른 의사결정 가능

---

## 작업 우선순위
1. ✅ 개선 #1: 매수 관리비 제거 (완료)
2. ✅ 개선 #2: 월 저축 가능 금액 입력 추가 (완료)
3. ✅ 개선 #3: 월세 인라인 입력 변경 (완료)
4. ✅ 개선 #4: 순자산 계산 통일 (완료)
5. ✅ 개선 #5: 매수 순자산에 초기 비용 반영 (완료)
6. ✅ 개선 #6: 월세 상승률 버그 수정 (완료)
7. ✅ 개선 #7: 투자수익률 및 주택가격 상승률 3% 고정 (완료)

---

## 변경 이력
| 날짜 | 개선 항목 | 상태 | 비고 |
|------|----------|------|------|
| 2026-03-11 | 개선 #1: 매수 관리비 제거 | ✅ 완료 | |
| 2026-03-11 | 개선 #2: 월 저축액 입력 추가 | ✅ 완료 | |
| 2026-03-11 | 개선 #3: 월세 인라인 입력 변경 | ✅ 완료 | |
| 2026-03-11 | 개선 #4: 순자산 계산 통일 | ✅ 완료 | |
| 2026-03-12 | 개선 #5: 매수 순자산 초기 비용 반영 | ✅ 완료 | 순자산 계산 정확도 개선 |
| 2026-03-12 | 개선 #6: 월세 상승률 버그 수정 | ✅ 완료 | rentGrowthRate 기본값 5% 추가 |
| 2026-03-12 | 개선 #7: 수익률/상승률 고정 | ✅ 완료 | 주택 3%, 전월세 5%, 투자 3% |
