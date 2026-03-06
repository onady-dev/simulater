# 인플레이션 시나리오와 사용자 입력값 충돌 해결 계획서

## 목표
인플레이션 시나리오를 **기본값(프리셋)**으로만 사용하고, 사용자가 직접 입력한 값이 있으면 우선 적용되도록 변경

---

## 📋 작업 목록

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

**파일**: `src/components/inputs/AdvancedSheet.tsx`

#### 3.2 InflationScenarioSelector 수정
- [ ] 시나리오 버튼에 툴팁 추가
  - "이 시나리오의 기본값을 사용합니다. 고급설정에서 직접 수정한 값은 유지됩니다."

**파일**: `src/components/inputs/InflationScenarioSelector.tsx`

#### 3.3 초기화 버튼 추가 (선택사항)
- [ ] AdvancedSheet에 "시나리오 기본값으로 초기화" 버튼 추가
  - 클릭 시 모든 플래그를 `false`로 설정하고 재계산

**파일**: `src/components/inputs/AdvancedSheet.tsx`

---

### 4. 기본값 설정 로직 수정

- [ ] `DEFAULT_BUY_INPUTS` 수정
  - 모든 플래그를 `false`로 초기화

**파일**: `src/lib/constants/defaults.ts`

---

### 5. compareInflationScenarios 로직 수정

- [ ] 3가지 시나리오 비교 시에도 동일한 조건부 로직 적용
  - 사용자 입력값이 있으면 그대로 사용
  - 없으면 각 시나리오의 파라미터 사용

**파일**: `src/lib/calculations/inflation.ts`

---

### 6. 테스트 시나리오 작성

#### 6.1 수동 테스트 케이스
- [ ] **케이스 1**: 인플레이션 시나리오만 변경
  - 저 → 중 → 고 변경 시 모든 값이 시나리오에 맞게 변경되는지 확인

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

## 🎯 예상 효과

1. **사용자 의도 존중**: 직접 입력한 값이 무시되지 않음
2. **유연성 증가**: 시나리오 프리셋 + 커스터마이징 동시 지원
3. **혼란 감소**: "내가 입력한 값이 왜 바뀌지?" 문제 해결
4. **기본 동작 유지**: 플래그가 없으면 기존처럼 시나리오 값 사용

---

## ⚠️ 주의사항

1. **LocalStorage 마이그레이션**: 기존 저장된 데이터에는 플래그가 없음
   - 첫 로드 시 모든 플래그를 `false`로 초기화 필요

2. **UI 복잡도 증가**: 사용자가 "어떤 값이 적용되고 있는지" 혼란스러울 수 있음
   - 명확한 시각적 피드백 필수

3. **compareInflationScenarios 동작**: 3가지 시나리오 비교 차트에서 사용자 입력값이 모든 시나리오에 동일하게 적용됨
   - 이게 의도된 동작인지 확인 필요

---

## 📊 작업 우선순위

**Phase 1 (핵심 기능)**
1. 타입 정의 수정
2. Store 로직 수정 (updateInputs, calculate)
3. 기본값 설정

**Phase 2 (UI 개선)**
4. AdvancedSheet 시각적 피드백
5. 툴팁 추가

**Phase 3 (선택사항)**
6. 초기화 버튼
7. 문서화

---

## 📝 작업 진행 상황

- 작성일: 2026-03-06
- 상태: 계획 수립 완료
- 다음 단계: Phase 1 구현 시작
