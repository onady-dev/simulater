# 순자산 변화량 계산 기준 리서치

## 개요
이 문서는 매수/전세/월세 시나리오별 순자산 계산 로직과 기준을 정리합니다.

## 공통 기준

### 초기 자산
- **`availableCash`**: 사용자가 현재 보유한 가용 현금 (순자산 비교의 출발점)
- 각 시나리오별로 초기 투입 자본을 차감한 후 남은 금액을 투자 운용

### 시뮬레이션 기간
- `yearsToHold`: 사용자가 설정한 보유 기간 (년)
- 매년 순자산을 계산하여 시계열 데이터 생성

---

## 1. 매수 시나리오 순자산

### 계산식
```
매수 순자산 = 시세(년도별) - 잔여대출
```

### 구성 요소

#### 시세 (Sale Price)
```typescript
salePrice = purchasePrice × (1 + annualPriceChangeRate)^year
```
- `purchasePrice`: 매수가
- `annualPriceChangeRate`: 연간 집값 변동률
- 매년 복리로 증가/감소

#### 잔여대출 (Remaining Loan)
```typescript
remainingLoan = calculateLoanRepayment(loanAmount, loanRate, loanType, 30, year).remainingPrincipal
```
- 원리금균등상환 또는 원금균등상환 방식에 따라 계산
- 30년 만기 기준으로 `year`년 후 잔여 원금

### 월 현금지출 (비교 기준)
```typescript
buyMonthlyOutflow = buyMonthlyMortgage + (propertyTax + maintenanceFee) / 12
```
- `buyMonthlyMortgage`: 월 원리금 상환액
- `propertyTax`: 연간 재산세
- `maintenanceFee`: 연간 관리비 추정치

---

## 2. 전세 시나리오 순자산

### 계산식
```
전세 순자산 = 초기여유금 투자 미래가치 + 월절약액 적립 미래가치 + 보증금 - 전세대출
```

### 구성 요소

#### 초기여유금 투자
```typescript
jeonseInitialInvestable = max(0, availableCash - jeonseOwnDeposit)
jeonseOwnDeposit = max(0, depositAmount - loanAmount)
```
- 전세 보증금 중 자기자본을 제외한 나머지를 투자 운용
- `expectedInvestmentReturn` 수익률로 복리 운용

```typescript
fvInitialJeonse = jeonseInitialInvestable × (1 + r)^year
```

#### 월절약액 적립
```typescript
jeonseMonthlySaving = buyMonthlyOutflow - jeonseMonthlyOutflow
jeonseMonthlyOutflow = (loanAmount × loanRate) / 12  // 이자만 납부 (만기일시상환)
```
- 매수 대비 절약되는 월 현금을 투자 운용
- 연금 미래가치 계수 적용 (월복리)

```typescript
fvFactor = r > 0 ? (Math.pow(1 + r / 12, months) - 1) / (r / 12) : months
fvSavingJeonse = jeonseMonthlySaving × fvFactor
```

#### 보증금 변동
```typescript
currentJeonseDeposit = depositAmount × (1 + min(jeonseGrowthRate, LEGAL_CAP))^renewalCount
renewalCount = floor((year - 1) / 2)  // 2년마다 재계약
LEGAL_CAP = 0.05  // 법정 상한 5%
```
- 2년마다 재계약 시 보증금 인상
- 사용자 입력 `rentGrowthRate`와 법정 상한 중 낮은 값 적용

#### 최종 순자산
```typescript
jeonseNetAsset = fvInitialJeonse + fvSavingJeonse + currentJeonseDeposit - loanAmount
```

---

## 3. 월세 시나리오 순자산

### 계산식
```
월세 순자산 = 초기여유금 투자 미래가치 + 월절약액 적립 미래가치 + 보증금
```

### 구성 요소

#### 초기여유금 투자
```typescript
rentInitialInvestable = max(0, availableCash - depositAmount)
fvInitialRent = rentInitialInvestable × (1 + r)^year
```
- 월세 보증금을 제외한 나머지를 투자 운용

#### 월세 변동
```typescript
currentMonthlyRent = monthlyRent × (1 + min(rentGrowthRate, LEGAL_CAP))^renewalCount
renewalCount = floor((year - 1) / 2)  // 2년마다 재계약
```
- 2년마다 재계약 시 월세 인상
- 법정 상한 5% 적용

#### 월절약액 적립
```typescript
rentMonthlySaving = buyMonthlyOutflow - currentMonthlyRent
fvSavingRent = rentMonthlySaving × fvFactor
```
- **중요**: 연도별로 변동된 `currentMonthlyRent`를 반영하여 절약액 계산
- 매수 대비 절약액을 투자 운용

#### 최종 순자산
```typescript
monthlyRentNetAsset = fvInitialRent + fvSavingRent + depositAmount
```
- 월세는 대출이 없으므로 보증금 전액이 순자산에 포함

---

## 핵심 차이점 요약

| 항목 | 매수 | 전세 | 월세 |
|------|------|------|------|
| **순자산 구성** | 시세 - 대출 | 투자수익 + 보증금 - 대출 | 투자수익 + 보증금 |
| **초기 투자금** | 자기자본 (매수가 - 대출) | 자기자본 보증금 | 보증금 |
| **월 지출** | 원리금 + 세금/관리비 | 전세대출 이자 | 월세 |
| **자산 증식** | 집값 상승 | 투자 수익 + 절약액 | 투자 수익 + 절약액 |
| **변동 요소** | 집값 변동률 | 보증금 인상률 (2년) | 월세 인상률 (2년) |
| **법정 상한** | - | 5% (재계약 시) | 5% (재계약 시) |

---

## 주요 가정

1. **전세대출**: 만기일시상환 (이자만 납부)
2. **주택담보대출**: 30년 만기 기준
3. **재계약 주기**: 2년
4. **법정 상한**: 전세/월세 인상률 5%
5. **투자 수익률**: 사용자 입력 `expectedInvestmentReturn` (연복리)
6. **월 절약액**: 매수 시나리오 대비 차액을 매월 투자 운용

---

## 코드 위치

- **순자산 계산 로직**: `app/src/lib/calculations/breakeven.ts` → `generateAssetProjectionSeries()`
- **타입 정의**: `app/src/types/index.ts` → `AssetProjectionPoint`
- **차트 컴포넌트**: `app/src/components/charts/AssetProjectionChart.tsx`
- **추천 로직**: `app/src/lib/calculations/recommendation.ts`

---

## 개선 고려사항

1. **엣지 케이스**: `availableCash`가 자기자본보다 적거나 많을 경우 처리
2. **음수 절약액**: 전세/월세가 매수보다 비쌀 경우 투자 원금 감소 로직
3. **세금 반영**: 양도소득세, 종합부동산세 등 추가 고려
4. **거래비용**: 중개수수료, 취득세 등 초기 비용 반영
