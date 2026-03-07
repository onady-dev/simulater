# 인플레이션 시나리오와 사용자 입력값 충돌 해결 계획서

## 목표
인플레이션 시나리오를 **기본값(프리셋)**으로만 사용하고, 사용자가 직접 입력한 값이 있으면 우선 적용되도록 변경

---

## ✅ ToDoList

### Phase 1 — 핵심 기능 (데이터/로직)
- [x] 타입: 사용자 입력 플래그 추가 (`userSetPriceChangeRate` 등)
- [x] 타입: `annualIncome` → `availableCash` 교체
- [x] Store: `updateBuyInputs` / `updateJeonseInputs` / `updateMonthlyRentInputs` 플래그 설정 로직 추가
- [x] Store: `calculate()` 조건부 덮어쓰기 로직 수정 (사용자 입력값 우선)
- [x] Store: `compareInflationScenarios` 호출·`scenarioComparisons` 상태·`setInflationScenario` 액션 제거
- [x] 기본값: `DEFAULT_BUY_INPUTS` 플래그 `false` 초기화 + `availableCash` 기본값 추가
- [x] 세금 공제 의존성 처리 (`calcJeonseLoanDeduction`, `calcRentTaxCredit`의 `annualIncome` 제거/대체)

### Phase 2 — UI 삭제 / 교체
- [x] `ScenarioComparisonChart` 페이지에서 제거
- [x] `LeverageSimulator` 페이지에서 제거
- [x] `ScenarioSwipeCards` + `WinnerBanner` → 예상 월 지출 3열 카드로 교체
- [x] `InflationScenarioSelector` → 적용값 간단 텍스트/뱃지 표시로 교체
- [x] `AutoRecommendation` 간소화 (추천 시나리오 + 핵심 이유 1개만 유지)

### Phase 3 — 입력 구조 개편
- [x] "현재 보유 자산" 입력 UI 추가 (`PriceStepCard`)
- [x] `generateAssetProjectionSeries`에 `availableCash` 반영
- [x] 연간 주택가격 변동률 슬라이더: `AdvancedSheet` → 메인 입력 영역으로 이동
- [x] 기대 투자수익률 ⓘ 설명 아이콘 추가 (탭 시 팝업)
- [x] `AdvancedSheet` 슬라이더: 사용자 설정값 시각적 구분 표시 (파란색 뱃지 등)

### Phase 4 — 차트 개선 + 선택사항
- [x] `AssetProjectionChart` Y축 도메인 자동 조정 (3개 선 차이 명확히)
- [x] 월세 인상률(`rentGrowthRate`) 순자산 시뮬레이션 반영 여부 확인 및 적용
- [x] 초기화 버튼 추가 (`AdvancedSheet` — "시나리오 기본값으로 초기화")
- [x] `research.md` 업데이트 (플래그 시스템, `availableCash` 반영 내용)

---

## 📋 작업 상세

### 1. 타입 정의 수정
- [ ] `BuyInputs` 타입에 사용자 입력 여부를 추적할 플래그 추가
  - `userSetPriceChangeRate?: boolean`
- [ ] `JeonseInputs`, `MonthlyRentInputs`에도 동일한 플래그 추가
  - `userSetLoanRate?: boolean`
  - `userSetInvestmentReturn?: boolean`
  - `userSetRentGrowthRate?: boolean`

**파일**: `src/types/index.ts`

---

### 2. Store 로직 수정

#### 2.1 입력 업데이트 시 플래그 설정
- [ ] `updateBuyInputs()` 수정
  - `annualPriceChangeRate` 변경 시 `userSetPriceChangeRate: true` 설정
  - `loanRate` 변경 시 `userSetLoanRate: true` 설정
  - `expectedInvestmentReturn` 변경 시 `userSetInvestmentReturn: true` 설정

- [ ] `updateJeonseInputs()` 수정
  - 동일한 로직 적용

- [ ] `updateMonthlyRentInputs()` 수정
  - 동일한 로직 적용

**파일**: `src/lib/store/calculatorStore.ts`

#### 2.2 calculate() 로직 수정
- [ ] 인플레이션 파라미터 적용 시 조건부 덮어쓰기
  ```typescript
  const adjustedBuy = {
    ...buyInputs,
    annualPriceChangeRate: buyInputs.userSetPriceChangeRate 
      ? buyInputs.annualPriceChangeRate 
      : params.housingPriceGrowth,
    loanRate: buyInputs.userSetLoanRate 
      ? buyInputs.loanRate 
      : params.loanInterestRate,
    expectedInvestmentReturn: buyInputs.userSetInvestmentReturn 
      ? buyInputs.expectedInvestmentReturn 
      : params.expectedInvestmentReturn,
  };
  ```

- [ ] 전세/월세도 동일한 로직 적용

**파일**: `src/lib/store/calculatorStore.ts`

#### 2.3 인플레이션 시나리오 변경 시 플래그 초기화 옵션
- [ ] `setInflationScenario()` 수정
  - 시나리오 변경 시 모든 플래그를 `false`로 초기화 (선택사항)
  - 또는 플래그 유지 (사용자 입력값 보존)

**파일**: `src/lib/store/calculatorStore.ts`

---

### 3. UI 개선

#### 3.1 AdvancedSheet 수정
- [ ] 슬라이더 변경 시 시각적 피드백 추가
  - 사용자가 수정한 값은 파란색 표시 또는 "사용자 설정" 뱃지 표시
  - 인플레이션 시나리오 기본값은 회색 표시
- [ ] 매수 탭에서 `annualPriceChangeRate` 슬라이더 제거 (→ 8.2에서 메인 영역으로 이동)

**파일**: `src/components/inputs/AdvancedSheet.tsx`

#### 3.2 InflationScenarioSelector 교체
- [ ] 저/중/고 시나리오 선택 버튼 3개 UI 제거
- [ ] 현재 적용 중인 인플레이션 파라미터를 간단하게 텍스트/뱃지로 표시
  - 예: `주택가격 +4% · 대출금리 4% · 투자수익률 7%` (기본값 기준)
  - 사용자가 직접 시나리오를 선택하는 인터랙션은 숨김

**파일**: `src/components/inputs/InflationScenarioSelector.tsx`

#### 3.3 초기화 버튼 추가 (선택사항)
- [ ] AdvancedSheet에 "시나리오 기본값으로 초기화" 버튼 추가
  - 클릭 시 모든 플래그를 `false`로 설정하고 재계산

**파일**: `src/components/inputs/AdvancedSheet.tsx`

#### 3.4 ScenarioComparisonChart UI 삭제
- [ ] `ScenarioComparisonChart` 컴포넌트를 페이지에서 제거
- [ ] `compareInflationScenarios` 계산 로직 및 store의 `scenarioComparisons` 상태도 함께 제거 (차트가 없으면 불필요)

**파일**: `src/app/calculator/page.tsx`, `src/lib/store/calculatorStore.ts`

#### 3.5 LeverageSimulator UI 삭제
- [ ] `LeverageSimulator` 컴포넌트를 페이지에서 제거

**파일**: `src/app/calculator/page.tsx`

#### 3.6 AutoRecommendation 간소화
- [ ] 필수 내용만 남기고 나머지 제거
  - **유지**: 추천 시나리오(primary), 핵심 이유 1개, 순자산 차이 금액
  - **제거**: 차선(secondary) 표시, 레버리지 조언 블록, 경고 목록
- [ ] 카드 높이를 줄여 스크롤 최소화

**파일**: `src/components/results/AutoRecommendation.tsx`

#### 3.7 AssetProjectionChart 개선
- [ ] Y축 도메인을 데이터 최솟값~최댓값 기준으로 자동 조정해 3개 선의 차이가 명확히 보이도록 수정
  - Recharts `domain={['auto', 'auto']}` 또는 데이터 기반 여백 계산 적용
- [ ] `monthlyRentInputs.rentGrowthRate`가 `generateAssetProjectionSeries`에 실제로 반영되는지 코드 확인
  - 미적용 시: 월세 인상률 로직 추가

**파일**: `src/components/charts/AssetProjectionChart.tsx`, `src/lib/calculations/breakeven.ts`

#### 3.8 하단 비용 카드 개편
- [ ] `ScenarioSwipeCards`, `WinnerBanner` 제거
- [ ] 현재 입력값 기준 **예상 월 지출 비용**을 매수/전세/월세 3가지를 스크롤 없이 한 화면에 표시
  - 3열 가로 나열 레이아웃
  - 추천 문구 없이 숫자 중심으로만 표시

**파일**: `src/app/calculator/page.tsx`, 신규 컴포넌트 또는 `ScenarioSwipeCards.tsx` 수정

---

### 4. 기본값 설정 로직 수정

- [ ] `DEFAULT_BUY_INPUTS` 수정
  - 모든 플래그를 `false`로 초기화

**파일**: `src/lib/constants/defaults.ts`

---

### 5. compareInflationScenarios 로직 수정

> **방향**: inflation 시나리오 선택은 사용자에게 노출하지 않고 기본값(`medium`)으로 고정.
> `ScenarioComparisonChart`(UI)와 `compareInflationScenarios`(로직) 모두 제거.
> `inflationScenario` 상태는 `'medium'` 고정으로 유지하고 `calculate()`에서만 내부적으로 사용.

- [ ] store의 `inflationScenario` 초기값을 `'medium'`으로 유지, `setInflationScenario` 액션 제거
- [ ] `compareInflationScenarios` 함수 호출 및 `scenarioComparisons` 상태 제거
- [ ] `calculate()` 내 조건부 덮어쓰기 로직은 유지 (사용자 입력값 우선)

**파일**: `src/lib/calculations/inflation.ts`, `src/lib/store/calculatorStore.ts`

---

### 6. 테스트 시나리오 작성

#### 6.1 수동 테스트 케이스

> **참고**: 인플레이션 시나리오 선택 UI는 삭제 예정이므로 시나리오 변경 테스트는 불필요.
> 결과값에 기본값(`medium`) 인플레이션 파라미터가 올바르게 반영되는지 위주로 테스트.

- [ ] **케이스 1**: 기본 인플레이션 파라미터 반영 확인
  - 페이지 로드 시 `medium` 시나리오 파라미터(주택가격 +4%, 대출금리 4%, 투자수익률 7%)가 계산에 적용되는지 확인

- [ ] **케이스 2**: 사용자가 주택가격 변동률 직접 입력
  - 고급설정에서 5% 입력 → 인플레이션 시나리오 변경 → 5% 유지되는지 확인

- [ ] **케이스 3**: 일부만 사용자 입력
  - 주택가격 변동률만 직접 입력, 대출금리는 시나리오 따름 → 혼합 적용 확인

- [ ] **케이스 4**: 초기화 버튼 (구현 시)
  - 초기화 후 시나리오 기본값으로 돌아가는지 확인

- [ ] **케이스 5**: LocalStorage 영속화
  - 페이지 새로고침 후에도 플래그가 유지되는지 확인

---

### 7. 문서화

- [ ] research.md 업데이트
  - 새로운 플래그 시스템 설명 추가
  - 인플레이션 시나리오와 사용자 입력의 우선순위 명시

- [ ] 코드 주석 추가
  - calculate() 함수에 조건부 로직 설명 주석

---

### 8. 입력 구조 개편

#### 8.1 연 소득 → 현재 보유 자산(가용 가능 현금) 입력 교체

> 현재 `annualIncome`은 세금 공제 계산에 사용되나, 사용자에게는 "현재 보유 자산"이 더 직관적이고 계산 결과에도 직접적으로 영향을 준다.

- [ ] 타입 수정: `annualIncome: Won` → `availableCash: Won` (`BuyInputs`, `JeonseInputs`, `MonthlyRentInputs`)
- [ ] 세금 계산 의존성 처리
  - 전세 대출이자 소득공제 (`calcJeonseLoanDeduction`): `annualIncome` 제거 또는 기본 세율로 대체
  - 월세 세액공제 (`calcRentTaxCredit`): 동일 처리
- [ ] 순자산 시뮬레이션(`generateAssetProjectionSeries`)에 `availableCash` 반영
  - 현재: 초기 여유금 = `purchasePrice - loanAmount - 보증금 자부담`
  - 변경: 초기 여유금 = 사용자 입력 `availableCash` 기준으로 재산출
- [ ] UI: `PriceStepCard` 또는 별도 카드에 "현재 보유 자산" 입력 추가

**파일**: `src/types/index.ts`, `src/lib/calculations/`, `src/lib/constants/defaults.ts`, `src/components/inputs/PriceStepCard.tsx`

#### 8.2 연간 주택가격 변동률 메인 영역으로 이동

- [ ] `AdvancedSheet` 매수 탭에서 `annualPriceChangeRate` 슬라이더 제거
- [ ] 메인 입력 영역에 `annualPriceChangeRate` 슬라이더 추가
  - 기대 투자수익률 슬라이더 **상단**에 배치

**파일**: `src/components/inputs/AdvancedSheet.tsx`, `src/components/inputs/PriceStepCard.tsx` 또는 신규 카드

#### 8.3 기대 투자수익률 설명 아이콘 추가

- [ ] `expectedInvestmentReturn` 슬라이더 레이블 옆에 ⓘ 아이콘 추가
- [ ] 아이콘 탭 시 설명 팝업/툴팁 표시
  - 설명 예: "전세·월세로 절약한 여유 자금을 운용할 때 기대하는 연간 수익률. 예금(3~4%), 주식(7~10%) 등 투자 방식에 따라 다릅니다."

**파일**: `src/components/inputs/AdvancedSheet.tsx` 또는 `src/components/inputs/SliderWithLabel.tsx`

---

## 🎯 예상 효과

1. **사용자 의도 존중**: 직접 입력한 값이 무시되지 않음
2. **UI 간소화**: 불필요한 그래프/시뮬레이션 제거로 핵심 정보 집중
3. **직관적 입력**: 연 소득 대신 현재 보유 자산 기준으로 더 현실적인 계산
4. **혼란 감소**: "내가 입력한 값이 왜 바뀌지?" 문제 해결

---

## ⚠️ 주의사항

1. **LocalStorage 마이그레이션**: 기존 저장된 데이터에는 플래그 및 `availableCash` 필드가 없음
   - 첫 로드 시 플래그 `false`, `availableCash` 기본값으로 초기화 필요

2. **세금 공제 계산**: `annualIncome` 제거 시 전세 이자 소득공제·월세 세액공제 계산 불가
   - 공제 항목 제거 또는 평균 세율로 고정 처리 여부 결정 필요

3. **`availableCash` 기준 순자산 비교**: 사용자 입력 현금이 매수 자기자본보다 적거나 많을 경우의 엣지 케이스 처리 필요

---

## 📝 작업 진행 상황

- 작성일: 2026-03-06
- 상태: 계획 수립 완료
- 다음 단계: Phase 1 구현 시작