'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { getInflationParameters } from '@/lib/calculations/inflation';

export function InflationScenarioSelector() {
  const inflationScenario = useCalculatorStore((s) => s.inflationScenario);
  const params = getInflationParameters(inflationScenario);

  return (
    <div className="px-4 mb-3">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-amber-600 font-medium shrink-0">기본값 적용 중</span>
        <span className="text-xs text-amber-700">
          주택가격 +{(params.housingPriceGrowth * 100).toFixed(0)}%
          · 대출금리 {(params.loanInterestRate * 100).toFixed(0)}%
          · 투자수익률 {(params.expectedInvestmentReturn * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
