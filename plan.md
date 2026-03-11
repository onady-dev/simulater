# 프로젝트 개선 계획 (Improvement Plan)

## 개선 작업 목록

---

## 개선 #1: 매수 시나리오에서 관리비 계산 제거

### 📋 개선 사유
- 관리비는 매수/전세/월세 모든 주거 형태에서 동일하게 발생하는 비용
- 비교 분석 시 상쇄되는 항목이므로 계산에서 제외하는 것이 합리적
- 사용자에게 더 명확한 순수 주거비용 비교 제공

### 🎯 작업 범위

#### 1. 계산 로직 수정
**파일**: `app/src/lib/calculations/buy.ts`

- [x] `estimateAnnualMaintenanceFee()` 함수 제거
- [x] `calculateBuyScenario()` 함수에서 관리비 계산 제거
  - `maintenanceFee` 변수 제거
  - `annualHoldingTotal` 계산에서 `maintenanceFee` 제외

**수정 전**:
```typescript
const maintenanceFee = estimateAnnualMaintenanceFee(areaM2);
const annualHoldingTotal = avgPropertyTax + avgComprehensiveTax + maintenanceFee + annualLoanInterest;
```

**수정 후**:
```typescript
const annualHoldingTotal = avgPropertyTax + avgComprehensiveTax + annualLoanInterest;
```

#### 2. 타입 정의 수정
**파일**: `app/src/types/index.ts`

- [x] `BuyAnnualHoldingCosts` 인터페이스에서 `maintenanceFee` 필드 제거

**수정 전**:
```typescript
export interface BuyAnnualHoldingCosts {
  propertyTax: Won;
  comprehensiveTax: Won;
  maintenanceFee: Won;
  loanInterest: Won;
  total: Won;
}
```

**수정 후**:
```typescript
export interface BuyAnnualHoldingCosts {
  propertyTax: Won;
  comprehensiveTax: Won;
  loanInterest: Won;
  total: Won;
}
```

#### 3. 반환값 수정
**파일**: `app/src/lib/calculations/buy.ts`

- [ ] `calculateBuyScenario()` 반환 객체에서 `maintenanceFee` 제거

**수정 전**:
```typescript
annualHoldingCosts: {
  propertyTax: avgPropertyTax,
  comprehensiveTax: avgComprehensiveTax,
  maintenanceFee,
  loanInterest: annualLoanInterest,
  total: annualHoldingTotal,
}
```

**수정 후**:
```typescript
annualHoldingCosts: {
  propertyTax: avgPropertyTax,
  comprehensiveTax: avgComprehensiveTax,
  loanInterest: annualLoanInterest,
  total: annualHoldingTotal,
}
```

#### 4. 순자산 계산 로직 검토
**파일**: `app/src/lib/calculations/breakeven.ts`

- [ ] `generateAssetProjectionSeries()` 함수 검토
  - 매수 월 현금지출 계산에서 관리비 제거
  - `buyMonthlyOutflow` 계산 수정

**수정 전**:
```typescript
const propertyTax = calculatePropertyTax(purchasePrice);
const maintenanceFee = estimateAnnualMaintenanceFee(buyInputs.areaM2);
const buyMonthlyOutflow = buyMonthlyMortgage + (propertyTax + maintenanceFee) / 12;
```

**수정 후**:
```typescript
const propertyTax = calculatePropertyTax(purchasePrice);
const buyMonthlyOutflow = buyMonthlyMortgage + propertyTax / 12;
```

#### 5. UI 컴포넌트 수정 (필요 시)
**파일**: `app/src/components/results/CostDetailSheet.tsx` 등

- [ ] 비용 상세 내역 표시에서 관리비 항목 제거
- [ ] 관리비 관련 텍스트/레이블 제거

#### 6. 문서 업데이트
**파일**: `research.md`

- [ ] "4.1 매수 시나리오" 섹션에서 관리비 관련 내용 제거
- [ ] "7.1 기본 시나리오" 섹션 업데이트
- [ ] "11.2 재산세" 섹션에서 관리비 언급 제거

### ⚠️ 주의사항
- TypeScript 컴파일 에러 확인 (maintenanceFee 참조하는 모든 곳 수정 필요)
- 기존 저장된 계산 결과와의 호환성 (Zustand persist)
- UI에서 관리비를 표시하는 모든 컴포넌트 확인

### ✅ 테스트 체크리스트
- [ ] 매수 시나리오 계산 결과 정상 출력
- [ ] 순자산 변화 차트 정상 표시
- [ ] 월 지출 비용 비교 정상 표시
- [ ] TypeScript 컴파일 에러 없음
- [ ] 기존 저장된 데이터 로드 시 에러 없음

### 📊 예상 영향
- **계산 결과**: 매수 시나리오의 연간 보유 비용 감소 (관리비만큼)
- **비교 정확도**: 향상 (공통 비용 제외로 순수 비교)
- **사용자 경험**: 개선 (더 명확한 비용 비교)

---

## 개선 #2: 월 저축 가능 금액 입력 필드 추가

### 📋 개선 사유
- 순자산 계산 시 금융자산 적립을 위한 기초 데이터 필요
- 연소득은 사람마다 지출 패턴이 달라 저축액 추정 어려움
- 사용자가 실제로 매달 저축 가능한 금액을 직접 입력하는 것이 더 정확
- 월세 세액공제 등 세제 혜택 계산에도 활용 가능

### 🎯 작업 범위

#### 1. 타입 정의 추가
**파일**: `app/src/types/index.ts`

- [ ] 공통 입력 타입에 `monthlySavings` 필드 추가
- [ ] 모든 시나리오 입력 타입에 월 저축액 필드 추가

**추가할 타입**:
```typescript
// BuyInputs에 추가
export interface BuyInputs {
  // ... 기존 필드들
  monthlySavings: Won;  // 월 저축 가능 금액
  // ...
}

// JeonseInputs에 추가
export interface JeonseInputs {
  // ... 기존 필드들
  monthlySavings: Won;  // 월 저축 가능 금액
  // ...
}

// MonthlyRentInputs에 추가
export interface MonthlyRentInputs {
  // ... 기존 필드들
  monthlySavings: Won;  // 월 저축 가능 금액
  // ...
}
```

#### 2. 기본값 설정
**파일**: `app/src/lib/constants/defaults.ts`

- [ ] 각 시나리오 기본값에 `monthlySavings` 추가

**추가할 기본값**:
```typescript
export const DEFAULT_BUY_INPUTS: BuyInputs = {
  // ... 기존 필드들
  monthlySavings: 2_000_000,  // 기본값: 200만원
  // ...
};

export const DEFAULT_JEONSE_INPUTS: JeonseInputs = {
  // ... 기존 필드들
  monthlySavings: 2_000_000,
  // ...
};

export const DEFAULT_MONTHLY_RENT_INPUTS: MonthlyRentInputs = {
  // ... 기존 필드들
  monthlySavings: 2_000_000,
  // ...
};
```

#### 3. UI 컴포넌트 추가
**파일**: `app/src/components/inputs/PriceStepCard.tsx`

- [ ] "현재 보유 자산" 섹션 **위에** "월 저축 가능 금액" 입력 섹션 추가
- [ ] 슬라이더 + 프리셋 버튼 UI 구현
- [ ] 월 저축액 변경 시 모든 시나리오에 동기화

**UI 구조**:
```typescript
// 추가할 섹션 (현재 보유 자산 위에 배치)
<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
  <div className="flex justify-between items-center">
    <h3 className="text-base font-bold text-gray-900">월 저축 가능 금액</h3>
    <span className="text-2xl font-bold text-green-500">
      {formatWonCompact(monthlySavings)}
    </span>
  </div>
  
  <input type="range" ... />
  
  <div className="grid grid-cols-4 gap-2">
    {/* 프리셋 버튼들 */}
  </div>
  
  <p className="text-xs text-gray-500">
    💡 매달 저축 가능한 금액을 입력하세요 (소득 - 생활비 - 주거비)
  </p>
</div>
```

**프리셋 옵션**:
```typescript
const MONTHLY_SAVINGS_PRESETS = [
  { label: '100만', value: 1_000_000 },
  { label: '200만', value: 2_000_000 },
  { label: '300만', value: 3_000_000 },
  { label: '500만', value: 5_000_000 },
];
```

**슬라이더 범위**:
- 최소: 0원
- 최대: 1,000만원
- 스텝: 50만원 (500_000)

#### 4. 상태 관리 수정
**파일**: `app/src/lib/store/calculatorStore.ts`

- [ ] 월 저축액 동기화 함수 추가
- [ ] 각 update 함수에서 월 저축액 동기화 처리

**추가할 함수**:
```typescript
syncMonthlySavings: (savings: number) => {
  set((s) => ({
    buyInputs: { ...s.buyInputs, monthlySavings: savings },
    jeonseInputs: { ...s.jeonseInputs, monthlySavings: savings },
    monthlyRentInputs: { ...s.monthlyRentInputs, monthlySavings: savings },
  }));
  get().calculate();
}
```

#### 5. 문서 업데이트
**파일**: `research.md`

- [ ] "3.2 입력 타입" 섹션에 `monthlySavings` 필드 추가
- [ ] "7.1 기본 시나리오" 섹션에 기본값 추가
- [ ] "6.1 입력 컴포넌트" 섹션에 월 저축액 입력 UI 설명 추가

### 🎨 UI 배치 순서
```
PriceStepCard 내부 구조:
1. 제목: "주택 정보 입력"
2. [NEW] 월 저축 가능 금액 입력 섹션
3. 현재 보유 자산 입력 섹션
4. 매수 정보 섹션
5. 전세 정보 섹션
6. 월세 정보 섹션
7. 고급 설정 버튼
```

### ⚠️ 주의사항
- 월 저축액은 세 시나리오 모두에 동일하게 적용 (동기화 필수)
- 실제 저축 가능 금액 = 소득 - 생활비 - 주거비
- 기존 저장된 데이터에는 `monthlySavings`가 없으므로 기본값 처리 필요
- UI 배치 시 "현재 보유 자산" 위에 위치

### ✅ 테스트 체크리스트
- [ ] 월 저축액 입력 UI 정상 표시 (보유 자산 위에 배치)
- [ ] 슬라이더 동작 정상
- [ ] 프리셋 버튼 동작 정상
- [ ] 세 시나리오 모두 동일한 월 저축액 값 동기화
- [ ] 로컬 스토리지 저장/로드 정상
- [ ] 기존 저장 데이터 로드 시 기본값 적용

### 📊 예상 영향
- **현재**: 입력 필드만 추가, 순자산 계산에 활용
- **사용자 경험**: 더 정확한 금융자산 적립 시뮬레이션 가능
- **정확도**: 연소득 기반보다 실제 저축 능력을 더 정확히 반영

---

## 개선 #3: 월세 입력 방식을 인라인 입력으로 변경

### 📋 개선 사유
- 현재 매수/전세는 메인 페이지에서 직접 입력 가능하지만, 월세만 클릭 후 바텀시트로 입력
- 일관성 없는 UX로 인한 사용자 혼란
- 월세 입력도 매수/전세와 동일하게 메인 페이지에서 바로 입력 가능하도록 개선

### 🎯 작업 범위

#### 1. 현재 구조 분석
**파일**: `app/src/components/inputs/PriceStepCard.tsx`

**현재 구조**:
```typescript
// 매수 정보 - 인라인 입력 (슬라이더 + 직접 입력)
<div className="bg-white ...">
  <h3>매수 정보</h3>
  {/* 매매가, 전용면적, 대출금 등 직접 입력 */}
</div>

// 전세 정보 - 인라인 입력 (슬라이더 + 직접 입력)
<div className="bg-white ...">
  <h3>전세 정보</h3>
  {/* 보증금, 대출금 등 직접 입력 */}
</div>

// 월세 정보 - 클릭 후 바텀시트 (NumberPadInput)
<div className="bg-white ...">
  <h3>월세 정보</h3>
  <button onClick={() => setShowMonthlyRentSheet(true)}>
    {/* 클릭하면 바텀시트 열림 */}
  </button>
</div>
```

#### 2. UI 컴포넌트 수정
**파일**: `app/src/components/inputs/PriceStepCard.tsx`

- [ ] 월세 섹션을 매수/전세와 동일한 인라인 입력 방식으로 변경
- [ ] `NumberPadInput` 바텀시트 제거
- [ ] 슬라이더 + 직접 입력 필드로 변경

**변경 후 구조**:
```typescript
// 월세 정보 - 인라인 입력 (매수/전세와 동일)
<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
  <h3 className="text-base font-bold text-gray-900">월세 정보</h3>
  
  {/* 보증금 입력 */}
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm text-gray-600">보증금</label>
      <span className="text-lg font-bold text-purple-500">
        {formatWonCompact(monthlyRentInputs.depositAmount)}
      </span>
    </div>
    <input
      type="range"
      min={0}
      max={200_000_000}
      step={5_000_000}
      value={monthlyRentInputs.depositAmount}
      onChange={(e) => updateMonthlyRentInputs({ depositAmount: Number(e.target.value) })}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
    />
    <div className="flex justify-between text-xs text-gray-400 mt-1">
      <span>0원</span>
      <span>2억</span>
    </div>
    
    {/* 프리셋 버튼 */}
    <div className="grid grid-cols-4 gap-2 mt-2">
      {DEPOSIT_PRESETS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => updateMonthlyRentInputs({ depositAmount: value })}
          className="py-2 rounded-xl text-xs font-medium ..."
        >
          {label}
        </button>
      ))}
    </div>
  </div>
  
  {/* 월세 입력 */}
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm text-gray-600">월세</label>
      <span className="text-lg font-bold text-purple-500">
        {formatWonCompact(monthlyRentInputs.monthlyRent)}
      </span>
    </div>
    <input
      type="range"
      min={0}
      max={3_000_000}
      step={100_000}
      value={monthlyRentInputs.monthlyRent}
      onChange={(e) => updateMonthlyRentInputs({ monthlyRent: Number(e.target.value) })}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
    />
    <div className="flex justify-between text-xs text-gray-400 mt-1">
      <span>0원</span>
      <span>300만</span>
    </div>
    
    {/* 프리셋 버튼 */}
    <div className="grid grid-cols-4 gap-2 mt-2">
      {MONTHLY_RENT_PRESETS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => updateMonthlyRentInputs({ monthlyRent: value })}
          className="py-2 rounded-xl text-xs font-medium ..."
        >
          {label}
        </button>
      ))}
    </div>
  </div>
</div>
```

#### 3. 프리셋 옵션 정의
**파일**: `app/src/components/inputs/PriceStepCard.tsx`

**보증금 프리셋** (기존 유지):
```typescript
const DEPOSIT_PRESETS = [
  { label: '1천만', value: 10_000_000 },
  { label: '3천만', value: 30_000_000 },
  { label: '5천만', value: 50_000_000 },
  { label: '1억', value: 100_000_000 },
];
```

**월세 프리셋** (기존 유지):
```typescript
const MONTHLY_RENT_PRESETS = [
  { label: '50만', value: 500_000 },
  { label: '100만', value: 1_000_000 },
  { label: '150만', value: 1_500_000 },
  { label: '200만', value: 2_000_000 },
];
```

#### 4. 슬라이더 범위 설정
**보증금 슬라이더**:
- 최소: 0원
- 최대: 2억원
- 스텝: 500만원 (5_000_000)

**월세 슬라이더**:
- 최소: 0원
- 최대: 300만원
- 스텝: 10만원 (100_000)

#### 5. 제거할 컴포넌트
**파일**: `app/src/components/inputs/PriceStepCard.tsx`

- [ ] `showMonthlyRentSheet` state 제거
- [ ] `NumberPadInput` 컴포넌트 호출 제거
- [ ] 월세 관련 바텀시트 열기 버튼 제거

**제거할 코드**:
```typescript
// 제거
const [showMonthlyRentSheet, setShowMonthlyRentSheet] = useState(false);

// 제거
{showMonthlyRentSheet && (
  <NumberPadInput
    title="월세 보증금"
    value={monthlyRentInputs.depositAmount}
    onConfirm={(v) => {
      updateMonthlyRentInputs({ depositAmount: v });
      setShowMonthlyRentSheet(false);
    }}
    onClose={() => setShowMonthlyRentSheet(false)}
    presets={DEPOSIT_PRESETS}
  />
)}
```

#### 6. 색상 테마 일관성
**매수**: 파란색 (blue-500)
**전세**: 주황색 (orange-500)
**월세**: 보라색 (purple-500) - 기존 유지

#### 7. 레이아웃 순서 (PriceStepCard 내부)
```
1. 제목: "주택 정보 입력"
2. 연소득 입력 섹션
3. 현재 보유 자산 입력 섹션
4. 매수 정보 섹션 (인라인 입력)
5. 전세 정보 섹션 (인라인 입력)
6. 월세 정보 섹션 (인라인 입력) ← 변경
7. 고급 설정 버튼
```

#### 8. 문서 업데이트
**파일**: `research.md`

- [ ] "6.1 입력 컴포넌트" 섹션 업데이트
  - PriceStepCard 설명에서 월세도 인라인 입력으로 변경됨을 명시
  - NumberPadInput 사용처에서 월세 제거 (매수/전세 고급 설정에서만 사용)

### 🎨 UI 개선 효과

**변경 전**:
- 매수/전세: 메인 페이지에서 직접 입력 ✅
- 월세: 클릭 → 바텀시트 → 입력 ❌ (2단계)

**변경 후**:
- 매수/전세/월세: 모두 메인 페이지에서 직접 입력 ✅ (일관성)

### ⚠️ 주의사항
- `NumberPadInput`은 완전히 제거하지 않음 (고급 설정에서 여전히 사용)
- 월세 섹션의 색상 테마는 보라색(purple) 유지
- 슬라이더 범위는 일반적인 월세 시장 가격대 고려
- 기존 저장된 데이터와의 호환성 유지 (입력 방식만 변경)

### ✅ 테스트 체크리스트
- [ ] 월세 보증금 슬라이더 정상 동작
- [ ] 월세 월세 슬라이더 정상 동작
- [ ] 보증금 프리셋 버튼 정상 동작
- [ ] 월세 프리셋 버튼 정상 동작
- [ ] 값 변경 시 즉시 계산 반영
- [ ] 매수/전세/월세 UI 일관성 확인
- [ ] 바텀시트 관련 코드 제거 확인
- [ ] 모바일 반응형 정상 표시

### 📊 예상 영향
- **사용자 경험**: 크게 개선 (클릭 단계 감소, 일관된 입력 방식)
- **코드 복잡도**: 감소 (바텀시트 상태 관리 제거)
- **입력 속도**: 향상 (슬라이더로 빠른 조정 가능)
- **UI 일관성**: 향상 (세 시나리오 모두 동일한 입력 방식)

---

## 개선 #4: 순자산 계산 방식 통일 (총 보유 자산 - 부채)

### 📋 개선 사유
**현재 문제점**:
- 매수: 부동산 가치 - 대출 (초기 여유금 운용 반영 안 됨)
- 전세: 투자운용 + 절약액 + 보증금 - 대출
- 월세: 투자운용 + 절약액 + 보증금
- **비교 기준이 불일치하여 공정한 비교 불가능**

**개선 방향**:
- 세 시나리오 모두 "총 보유 자산 - 부채" 방식으로 통일
- 초기 여유금 운용을 모든 시나리오에 반영
- 공정하고 일관된 순자산 비교 제공

### 🎯 작업 범위

#### 1. 새로운 순자산 계산 공식

**공통 원칙**:
```
순자산 = 금융자산 + 실물자산 - 부채

금융자산 = 초기 여유금 복리운용 + 월 저축액 적립
실물자산 = 부동산 or 보증금
부채 = 대출 잔액
```

---

#### 2. 매수 순자산 (신규 방식)

**현재 방식**:
```typescript
매수 순자산 = 부동산 시세 - 잔여대출
```

**개선 방식**:
```typescript
매수 순자산 = 금융자산 + 부동산 시세 - 잔여대출

핵심 원칙:
- availableCash(현재 보유 자산)를 기준으로 모든 계산
- 대출금은 자동 계산: 대출금 = max(0, 매매가 - availableCash)
- 초기 여유금 = max(0, availableCash - 매매가)
- 월 저축액은 사용자가 직접 입력 (개선 #2)
- 실제 저축액 = 월 저축액 - 월 지출 (매수 주거비)

구성 요소:
1. 대출금 자동 계산
   - 대출금 = max(0, 매매가 - availableCash)
   - 예: 매매가 5억, availableCash 2억 → 대출금 3억
   - 예: 매매가 5억, availableCash 6억 → 대출금 0원
   
2. 초기 여유금
   - 초기 여유금 = max(0, availableCash - 매매가)
   - 예: availableCash 2억, 매매가 5억 → 초기 여유금 0원
   - 예: availableCash 6억, 매매가 5억 → 초기 여유금 1억
   
3. 월 지출 (매수 주거비)
   - 월 대출 원리금 = 대출 상환 스케줄의 monthlyPayment
   - 월 세금 = (재산세 + 종부세) / 12
   - 월 지출 = 월 대출 원리금 + 월 세금
   
4. 실제 월 저축액
   - 실제 월 저축액 = max(0, monthlySavings - 월 지출)
   - 예: monthlySavings 200만원, 월 지출 150만원 → 실제 저축 50만원
   - 예: monthlySavings 200만원, 월 지출 250만원 → 실제 저축 0원 (적자)
   
5. 금융자산 (복리 운용)
   - 초기 여유금 복리: 초기 여유금 × (1 + 투자수익률)^연도
   - 월 저축액 적립: 실제 월 저축액 × 연금 미래가치 계수
   - 금융자산 = 초기 여유금 복리 + 월 저축액 적립
   
6. 부동산 시세 = 매매가 × (1 + 연간변동률)^연도

7. 잔여대출 = 대출 상환 스케줄에 따라 계산

최종: 순자산 = 금융자산 + 부동산 시세 - 잔여대출
```

**예시 1** (매매가 5억, availableCash 2억, monthlySavings 200만원):
- 대출금: 5억 - 2억 = 3억 (자동 계산)
- 초기 여유금: max(0, 2억 - 5억) = 0원
- 월 대출 원리금: 약 150만원 (3.8% 원리금균등)
- 월 세금: 약 10만원
- 월 지출: 150만 + 10만 = 160만원
- 실제 월 저축액: max(0, 200만 - 160만) = 40만원
- 5년 후 금융자산: 0 + (40만 × 연금 미래가치 계수)
- 5년 후 부동산 시세: 5억 × 1.03^5 = 5.8억
- 5년 후 잔여대출: 약 2.7억
- **순자산: 금융자산 + 5.8억 - 2.7억**

**예시 2** (매매가 3억, availableCash 4억, monthlySavings 300만원):
- 대출금: max(0, 3억 - 4억) = 0원 (대출 불필요)
- 초기 여유금: max(0, 4억 - 3억) = 1억
- 월 대출 원리금: 0원
- 월 세금: 약 5만원
- 월 지출: 5만원
- 실제 월 저축액: max(0, 300만 - 5만) = 295만원
- 5년 후 금융자산: (1억 × 1.03^5) + (295만 × 연금 미래가치 계수)
- 5년 후 부동산 시세: 3억 × 1.03^5 = 3.48억
- **순자산: 금융자산 + 3.48억**

---

#### 3. 전세 순자산 (개선 방식)

**현재 방식**:
```typescript
전세 순자산 = 초기투자금 복리운용 + 월절약액 적립 + 보증금 - 전세대출
```

**개선 방식**:
```typescript
전세 순자산 = 금융자산 + 보증금 - 전세대출

핵심 원칙:
- availableCash(현재 보유 자산)를 기준으로 모든 계산
- 대출금은 자동 계산: 대출금 = max(0, 보증금 - availableCash)
- 초기 여유금 = max(0, availableCash - 보증금)
- 월 저축액은 사용자가 직접 입력 (개선 #2)
- 실제 저축액 = 월 저축액 - 월 지출 (전세 주거비)

구성 요소:
1. 대출금 자동 계산
   - 대출금 = max(0, 보증금 - availableCash)
   - 예: 보증금 4.5억, availableCash 2억 → 대출금 2.5억
   - 예: 보증금 3억, availableCash 4억 → 대출금 0원
   
2. 초기 여유금
   - 초기 여유금 = max(0, availableCash - 보증금)
   - 예: availableCash 2억, 보증금 4.5억 → 초기 여유금 0원
   - 예: availableCash 4억, 보증금 3억 → 초기 여유금 1억
   
3. 월 지출 (전세 주거비)
   - 월 대출 이자 = (대출금 × 대출금리) / 12
   - 월 지출 = 월 대출 이자 (전세는 이자만 납부)
   
4. 실제 월 저축액
   - 실제 월 저축액 = max(0, monthlySavings - 월 지출)
   - 예: monthlySavings 200만원, 월 지출 73만원 → 실제 저축 127만원
   - 예: monthlySavings 200만원, 월 지출 250만원 → 실제 저축 0원 (적자)
   
5. 금융자산 (복리 운용)
   - 초기 여유금 복리: 초기 여유금 × (1 + 투자수익률)^연도
   - 월 저축액 적립: 실제 월 저축액 × 연금 미래가치 계수
   - 금융자산 = 초기 여유금 복리 + 월 저축액 적립
   
6. 보증금 = 2년마다 재계약 시 법정 상한 5% 적용

7. 전세대출 = 고정 (만기일시상환)

최종: 순자산 = 금융자산 + 보증금 - 전세대출
```

**예시 1** (보증금 4.5억, availableCash 2억, monthlySavings 200만원):
- 대출금: 4.5억 - 2억 = 2.5억 (자동 계산)
- 초기 여유금: max(0, 2억 - 4.5억) = 0원
- 월 대출 이자: (2.5억 × 3.5%) / 12 = 약 73만원
- 월 지출: 73만원
- 실제 월 저축액: max(0, 200만 - 73만) = 127만원
- 5년 후 금융자산: 0 + (127만 × 연금 미래가치 계수)
- 5년 후 보증금: 약 4.5억 (상승 반영)
- **순자산: 금융자산 + 4.5억 - 2.5억**

**예시 2** (보증금 3억, availableCash 4억, monthlySavings 300만원):
- 대출금: max(0, 3억 - 4억) = 0원
- 초기 여유금: max(0, 4억 - 3억) = 1억
- 월 대출 이자: 0원
- 월 지출: 0원
- 실제 월 저축액: max(0, 300만 - 0) = 300만원
- 5년 후 금융자산: (1억 × 1.03^5) + (300만 × 연금 미래가치 계수)
- 5년 후 보증금: 약 3억
- **순자산: 금융자산 + 3억**

---

#### 4. 월세 순자산 (개선 방식)

**현재 방식**:
```typescript
월세 순자산 = 초기투자금 복리운용 + 월절약액 적립 + 보증금
```

**개선 방식**:
```typescript
월세 순자산 = 금융자산 + 보증금

핵심 원칙:
- availableCash(현재 보유 자산)를 기준으로 모든 계산
- 월세는 대출 없음 (보증금만 필요)
- 초기 여유금 = max(0, availableCash - 보증금)
- 월 저축액은 사용자가 직접 입력 (개선 #2)
- 실제 저축액 = 월 저축액 - 월 지출 (월세 주거비)

구성 요소:
1. 초기 여유금
   - 초기 여유금 = max(0, availableCash - 보증금)
   - 예: availableCash 2억, 보증금 5천만 → 초기 여유금 1.5억
   - 예: availableCash 3천만, 보증금 5천만 → 초기 여유금 0원
   
2. 월 지출 (월세 주거비)
   - 월 지출 = 월세
   - 2년마다 재계약 시 법정 상한 5% 적용
   
3. 실제 월 저축액
   - 실제 월 저축액 = max(0, monthlySavings - 월세)
   - 예: monthlySavings 200만원, 월세 150만원 → 실제 저축 50만원
   - 예: monthlySavings 200만원, 월세 250만원 → 실제 저축 0원 (적자)
   
4. 금융자산 (복리 운용)
   - 초기 여유금 복리: 초기 여유금 × (1 + 투자수익률)^연도
   - 월 저축액 적립: 실제 월 저축액 × 연금 미래가치 계수
   - 금융자산 = 초기 여유금 복리 + 월 저축액 적립
   
5. 보증금 = 고정 (돌려받는 자산)

6. 월세 = 2년마다 재계약 시 법정 상한 5% 적용

최종: 순자산 = 금융자산 + 보증금
```

**예시 1** (보증금 5천만, 월세 150만, availableCash 2억, monthlySavings 200만원):
- 초기 여유금: max(0, 2억 - 5천만) = 1.5억
- 월 지출: 150만원 (월세)
- 실제 월 저축액: max(0, 200만 - 150만) = 50만원
- 5년 후 금융자산: (1.5억 × 1.03^5) + (50만 × 연금 미래가치 계수)
- 5년 후 보증금: 5천만
- **순자산: 금융자산 + 5천만**

**예시 2** (보증금 1억, 월세 100만, availableCash 8천만, monthlySavings 300만원):
- 초기 여유금: max(0, 8천만 - 1억) = 0원
- 월 지출: 100만원 (월세)
- 실제 월 저축액: max(0, 300만 - 100만) = 200만원
- 5년 후 금융자산: 0 + (200만 × 연금 미래가치 계수)
- 5년 후 보증금: 1억
- **순자산: 금융자산 + 1억**

---

#### 5. 월 저축액 계산 로직 (신규)

**목적**: 사용자 입력 월 저축액에서 각 시나리오별 월 지출을 차감

```typescript
// 사용자가 입력한 월 저축액
const monthlySavings = buyInputs.monthlySavings;  // 개선 #2에서 추가된 필드

// 매수 시나리오
const buyLoanAmount = Math.max(0, purchasePrice - availableCash);
const buyInitialInvestable = Math.max(0, availableCash - purchasePrice);
const buyLoanSchedule = calculateLoanRepayment(buyLoanAmount, loanRate, loanType, 30, year);
const buyMonthlyLoanPayment = buyLoanSchedule.monthlyPayment;
const buyMonthlyTax = (calculatePropertyTax(purchasePrice) + calculateComprehensiveTax(purchasePrice, numHomes)) / 12;
const buyMonthlyExpense = buyMonthlyLoanPayment + buyMonthlyTax;
const buyActualSavings = Math.max(0, monthlySavings - buyMonthlyExpense);

// 전세 시나리오
const jeonseLoanAmount = Math.max(0, jeonseDeposit - availableCash);
const jeonseInitialInvestable = Math.max(0, availableCash - jeonseDeposit);
const jeonseMonthlyInterest = (jeonseLoanAmount * jeonseLoanRate) / 12;
const jeonseMonthlyExpense = jeonseMonthlyInterest;
const jeonseActualSavings = Math.max(0, monthlySavings - jeonseMonthlyExpense);

// 월세 시나리오
const rentInitialInvestable = Math.max(0, availableCash - rentDeposit);
const rentMonthlyExpense = currentMonthlyRent;  // 2년마다 재계약 시 상승 반영
const rentActualSavings = Math.max(0, monthlySavings - rentMonthlyExpense);

// 연금 미래가치 계수 (월복리)
const r = expectedInvestmentReturn;
const months = year * 12;
const fvFactor = r > 0 ? (Math.pow(1 + r / 12, months) - 1) / (r / 12) : months;

// 금융자산 = 초기 여유금 복리 + 실제 월 저축액 적립
const buyFinancialAsset = 
  buyInitialInvestable * Math.pow(1 + r, year) + 
  buyActualSavings * fvFactor;

const jeonseFinancialAsset = 
  jeonseInitialInvestable * Math.pow(1 + r, year) + 
  jeonseActualSavings * fvFactor;

const rentFinancialAsset = 
  rentInitialInvestable * Math.pow(1 + r, year) + 
  rentActualSavings * fvFactor;
```

**핵심 변경사항**:
1. **대출금 자동 계산**: 사용자가 입력한 대출금 무시, availableCash 기준으로 자동 계산
2. **월 지출 계산**: 각 시나리오별 실제 주거비 계산
   - 매수: 대출 원리금 + 세금
   - 전세: 대출 이자
   - 월세: 월세
3. **실제 저축액 = 입력 저축액 - 월 지출**: 각 시나리오별로 다른 실제 저축액
4. **음수 방지**: 실제 저축액이 음수면 0으로 처리 (적자 상황)

---

#### 6. 계산 로직 수정
**파일**: `app/src/lib/calculations/breakeven.ts`

- [ ] `generateAssetProjectionSeries()` 함수 전면 수정
- [ ] 대출금 자동 계산 로직 추가
- [ ] 연소득 기반 월 저축액 계산 추가
- [ ] 매수 순자산 계산에 금융자산 추가
- [ ] 전세/월세 순자산 계산 방식 변경

**수정 전**:
```typescript
// 매수 순자산: 시세 - 잔여대출
const buyNetAsset = salePrice - remainingLoan;

// 전세 순자산
const jeonseOwnDeposit = Math.max(0, jeonseInputs.depositAmount - jeonseInputs.loanAmount);
const jeonseInitialInvestable = Math.max(0, availableCash - jeonseOwnDeposit);
const jeonseMonthlySaving = buyMonthlyOutflow - jeonseMonthlyOutflow;
const fvInitialJeonse = jeonseInitialInvestable * Math.pow(1 + r, year);
const fvSavingJeonse = jeonseMonthlySaving * fvFactor;
const jeonseNetAsset = fvInitialJeonse + fvSavingJeonse + currentJeonseDeposit - jeonseInputs.loanAmount;
```

**수정 후**:
```typescript
// 사용자 입력 월 저축액
const monthlySavings = buyInputs.monthlySavings;  // 개선 #2에서 추가

// 매수: 대출금 자동 계산 + 월 지출 계산
const buyLoanAmount = Math.max(0, purchasePrice - availableCash);
const buyInitialInvestable = Math.max(0, availableCash - purchasePrice);
const buyLoanSchedule = calculateLoanRepayment(buyLoanAmount, loanRate, loanType, 30, year);
const buyMonthlyLoanPayment = buyLoanSchedule.monthlyPayment;
const buyMonthlyTax = (calculatePropertyTax(purchasePrice) + calculateComprehensiveTax(purchasePrice, numHomes)) / 12;
const buyMonthlyExpense = buyMonthlyLoanPayment + buyMonthlyTax;
const buyActualSavings = Math.max(0, monthlySavings - buyMonthlyExpense);
const buyFinancialAsset = 
  buyInitialInvestable * Math.pow(1 + r, year) + 
  buyActualSavings * fvFactor;
const buyNetAsset = buyFinancialAsset + salePrice - buyLoanSchedule.remainingPrincipal;

// 전세: 대출금 자동 계산 + 월 지출 계산
const jeonseLoanAmount = Math.max(0, jeonseInputs.depositAmount - availableCash);
const jeonseInitialInvestable = Math.max(0, availableCash - jeonseInputs.depositAmount);
const jeonseMonthlyInterest = (jeonseLoanAmount * jeonseInputs.loanRate) / 12;
const jeonseActualSavings = Math.max(0, monthlySavings - jeonseMonthlyInterest);
const jeonseFinancialAsset = 
  jeonseInitialInvestable * Math.pow(1 + r, year) + 
  jeonseActualSavings * fvFactor;
const jeonseNetAsset = jeonseFinancialAsset + currentJeonseDeposit - jeonseLoanAmount;

// 월세: 대출 없음 + 월 지출 계산
const rentInitialInvestable = Math.max(0, availableCash - monthlyRentInputs.depositAmount);
const rentActualSavings = Math.max(0, monthlySavings - currentMonthlyRent);
const rentFinancialAsset = 
  rentInitialInvestable * Math.pow(1 + r, year) + 
  rentActualSavings * fvFactor;
const monthlyRentNetAsset = rentFinancialAsset + monthlyRentInputs.depositAmount;
```

**주요 변경사항**:
1. 사용자 입력 대출금 무시, availableCash 기준 자동 계산
2. 사용자 입력 monthlySavings 사용 (개선 #2)
3. **각 시나리오별 월 지출 계산 추가**
4. **실제 저축액 = monthlySavings - 월 지출**
5. 금융자산 = 초기 여유금 복리 + 실제 저축액 적립
6. 순자산 = 금융자산 + 실물자산 - 부채

---

#### 7. 타입 정의 수정 (필요 시)
**파일**: `app/src/types/index.ts`

- [ ] `AssetProjectionPoint` 인터페이스 검토
- [ ] 필요 시 금융자산 필드 추가 (디버깅/상세 표시용)

```typescript
export interface AssetProjectionPoint {
  year: number;
  buyNetAsset: Won;
  jeonseNetAsset: Won;
  monthlyRentNetAsset: Won;
  // 선택적: 상세 정보
  buyFinancialAsset?: Won;
  buyRealEstateAsset?: Won;
  buyDebt?: Won;
}
```

---

#### 8. 문서 업데이트
**파일**: `research.md`

- [ ] "4.4 손익분기 분석" 섹션의 순자산 계산 설명 전면 수정
- [ ] "11.6 순자산 변화" 공식 업데이트
- [ ] "12.3 순자산 기준 추천" 섹션 업데이트

**업데이트할 내용**:
```markdown
### 순자산 변화 계산 (통일된 방식)

**공통 원칙**: 순자산 = 금융자산 + 실물자산 - 부채

**매수**:
- 금융자산 = 초기 여유금 복리운용 + 월 저축액 적립
- 실물자산 = 부동산 시세
- 부채 = 잔여대출
- 순자산 = 금융자산 + 부동산 시세 - 잔여대출

**전세**:
- 금융자산 = 초기 여유금 복리운용 + 월 저축액 적립
- 실물자산 = 보증금 (돌려받을 금액)
- 부채 = 전세대출
- 순자산 = 금융자산 + 보증금 - 전세대출

**월세**:
- 금융자산 = 초기 여유금 복리운용 + 월 저축액 적립
- 실물자산 = 보증금 (돌려받을 금액)
- 부채 = 없음
- 순자산 = 금융자산 + 보증금
```

---

### ⚠️ 주의사항

1. **대출금 자동 계산**:
   - 사용자가 입력한 대출금은 무시됨
   - availableCash 기준으로 자동 계산
   - UI에서 대출금 입력 필드를 읽기 전용 또는 제거 고려

2. **월 저축액 필수 입력**:
   - 금융자산 계산에 월 저축액 필수
   - 개선 #2 (월 저축액 입력 추가)가 선행되어야 함

3. **시나리오별 다른 실제 저축액**:
   - 사용자 입력 monthlySavings는 동일
   - 각 시나리오별 월 지출이 다름
   - 실제 저축액 = monthlySavings - 월 지출 (시나리오별로 다름)
   - 예: monthlySavings 200만원
     - 매수: 200만 - 160만(지출) = 40만원 저축
     - 전세: 200만 - 73만(지출) = 127만원 저축
     - 월세: 200만 - 150만(지출) = 50만원 저축

4. **적자 상황 처리**:
   - monthlySavings < 월 지출인 경우 실제 저축액 = 0
   - 실제로는 적자 상황이지만, 시뮬레이션에서는 저축 불가로 처리

5. **기존 계산 결과와 차이**:
   - 순자산 계산 방식이 완전히 변경됨
   - 추천 결과가 크게 달라질 수 있음
   - 사용자에게 변경 사항 안내 필요

6. **투자 수익률 일관성**:
   - 세 시나리오 모두 동일한 투자 수익률 적용
   - 공정한 비교를 위해 필수

---

### ✅ 테스트 체크리스트

- [ ] **대출금 자동 계산 테스트**
  - availableCash > 매매가/보증금: 대출금 0원
  - availableCash < 매매가/보증금: 대출금 = 차액
  - 대출금 자동 계산 정상 동작

- [ ] **초기 여유금 계산 테스트**
  - availableCash > 매매가/보증금: 초기 여유금 = 차액
  - availableCash < 매매가/보증금: 초기 여유금 = 0원
  - 초기 여유금 복리 운용 정상

- [ ] **월 저축액 계산 테스트**
  - 월소득 > 월 지출: 월 저축액 = 차액
  - 월소득 < 월 지출: 월 저축액 = 0원
  - 월 저축액 적립 정상 (연금 미래가치)

- [ ] **순자산 계산 테스트**
  - 매수: 금융자산 + 부동산 시세 - 잔여대출
  - 전세: 금융자산 + 보증금 - 전세대출
  - 월세: 금융자산 + 보증금
  - 세 시나리오 모두 정상 계산

- [ ] **차트 표시 테스트**
  - 순자산 변화 차트 정상 표시
  - 연도별 추이 정상
  - 세 시나리오 비교 정상

- [ ] **추천 로직 테스트**
  - 순자산 기준 최적 시나리오 선택
  - 인플레이션 시나리오별 조언 정상
  - 추천 결과 합리적

---

### 📊 예상 영향

**계산 방식 변화**:
- 대출금: 사용자 입력 → availableCash 기준 자동 계산
- 월 저축액: 연소득 기반 계산 → 사용자 직접 입력
- 금융자산: 초기 여유금만 → 초기 여유금 + 월 저축액 적립
- 순자산: 불일치한 기준 → 통일된 기준 (금융자산 + 실물자산 - 부채)

**계산 결과 변화**:
- 매수 순자산: 증가 (금융자산 추가)
- 전세 순자산: 변경 (사용자 입력 월 저축액 기반)
- 월세 순자산: 변경 (사용자 입력 월 저축액 기반)
- 더 현실적이고 공정한 비교

**추천 결과 변화**:
- 월 저축액이 높을수록 모든 시나리오 유리
- 월 저축액이 낮으면 금융자산 적립 효과 감소
- 공정한 비교로 인한 신뢰도 향상

**사용자 경험**:
- 더 정확하고 현실적인 시뮬레이션
- 사용자가 실제 저축 능력을 직접 입력하여 정확도 향상
- 순자산 개념 이해 향상

**UI 변경 필요**:
- 대출금 입력 필드 제거 또는 읽기 전용 처리
- "자동 계산됨" 안내 메시지 추가
- 월 저축액 입력 필드 추가 (개선 #2)

---

## 향후 개선 사항 (추가 예정)

### 개선 #5: [제목]
- 내용 추가 예정

---

## 작업 우선순위
1. ✅ 개선 #1: 매수 관리비 제거 (문서 작성 완료)
2. ✅ 개선 #2: 연소득 입력 추가 (문서 작성 완료)
3. ✅ 개선 #3: 월세 인라인 입력 변경 (문서 작성 완료)
4. ✅ 개선 #4: 순자산 계산 통일 (문서 작성 완료)
5. ⏳ 개선 #5: 대기 중

---

## 변경 이력
| 날짜 | 개선 항목 | 상태 | 비고 |
|------|----------|------|------|
| 2026-03-11 | 개선 #1: 매수 관리비 제거 | 📝 계획 수립 | 문서 작성 완료 |
| 2026-03-11 | 개선 #2: 연소득 입력 추가 | 📝 계획 수립 | 문서 작성 완료, 보유 자산 위에 배치 |
| 2026-03-11 | 개선 #3: 월세 인라인 입력 변경 | 📝 계획 수립 | 문서 작성 완료, UX 일관성 개선 |
| 2026-03-11 | 개선 #4: 순자산 계산 통일 | 📝 계획 수립 | 문서 작성 완료, 공정한 비교 기준 확립 |
