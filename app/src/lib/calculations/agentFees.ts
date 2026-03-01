import {
  BUY_AGENT_FEE_BRACKETS,
  RENT_AGENT_FEE_BRACKETS,
  type AgentFeeBracket,
} from '@/lib/constants/taxRates';

function applyFeeBracket(amount: number, brackets: AgentFeeBracket[]): number {
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
