import type { LoanRepaymentType } from '@/types';

export interface LoanRepaymentResult {
  totalInterestPaid: number;
  yearlyInterestSchedule: number[];
  remainingPrincipal: number;
}

/**
 * 원리금균등상환 (Annuity)
 * 월 상환액 = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateEqualPayment(
  principal: number,
  annualRate: number,
  totalYears: number,
  holdingYears: number,
): LoanRepaymentResult {
  const r = annualRate / 12;
  const n = totalYears * 12;
  const monthlyPayment =
    r === 0
      ? principal / n
      : (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

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
 * 매월 원금 고정 = P / 총개월수, 이자 = 잔여원금 × 월이자율
 */
export function calculateEqualPrincipal(
  principal: number,
  annualRate: number,
  totalYears: number,
  holdingYears: number,
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
 */
export function calculateBullet(
  principal: number,
  annualRate: number,
  holdingYears: number,
): LoanRepaymentResult {
  const yearlyInterest = Math.round(principal * annualRate);
  return {
    totalInterestPaid: yearlyInterest * holdingYears,
    yearlyInterestSchedule: Array<number>(holdingYears).fill(yearlyInterest),
    remainingPrincipal: principal,
  };
}

export function calculateLoanRepayment(
  principal: number,
  annualRate: number,
  loanType: LoanRepaymentType,
  totalLoanYears: number,
  holdingYears: number,
): LoanRepaymentResult {
  switch (loanType) {
    case 'equal_payment':
      return calculateEqualPayment(principal, annualRate, totalLoanYears, holdingYears);
    case 'equal_principal':
      return calculateEqualPrincipal(principal, annualRate, totalLoanYears, holdingYears);
    case 'bullet':
      return calculateBullet(principal, annualRate, holdingYears);
  }
}
