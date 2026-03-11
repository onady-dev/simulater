# 구현 상태

## 개선 #1: 매수 관리비 제거
- [x] buy.ts에서 estimateAnnualMaintenanceFee 함수 제거
- [x] buy.ts에서 maintenanceFee 변수 제거
- [x] types/index.ts에서 BuyAnnualHoldingCosts.maintenanceFee 제거
- [ ] breakeven.ts 수정 필요 (복잡한 의존성으로 인해 #4와 함께 처리)

## 개선 #2: 월 저축 가능 금액 입력 추가
- [ ] 타입 정의 추가 (monthlySavings)
- [ ] 기본값 설정
- [ ] UI 컴포넌트 추가
- [ ] 상태 관리 수정

## 개선 #3: 월세 인라인 입력 변경
- [ ] UI 컴포넌트 수정

## 개선 #4: 순자산 계산 통일
- [ ] breakeven.ts 전면 수정
- [ ] 대출금 자동 계산
- [ ] 월 지출 기반 실제 저축액 계산

## 참고사항
- 개선 #1, #3, #4는 breakeven.ts와 밀접하게 연관되어 있어 함께 처리하는 것이 효율적
- 개선 #2를 먼저 완료한 후, 나머지를 통합 처리 예정
