'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { formatWon } from '@/lib/utils/format';

const LABELS = { buy: '매수', jeonse: '전세', monthlyRent: '월세' } as const;
const COLORS = { buy: '#3B82F6', jeonse: '#F59E0B', monthlyRent: '#A855F7' } as const;
const BG_COLORS = { buy: 'from-blue-50 to-indigo-50', jeonse: 'from-amber-50 to-orange-50', monthlyRent: 'from-purple-50 to-fuchsia-50' } as const;
const BORDER_COLORS = { buy: 'border-blue-100', jeonse: 'border-amber-100', monthlyRent: 'border-purple-100' } as const;

export function MonthlyCostSummary() {
  const results = useCalculatorStore((s) => s.results);
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);
  const monthlyRent = useCalculatorStore((s) => s.monthlyRentInputs.monthlyRent);

  if (!results) return null;

  // 예상 월 지출 비용 (실제 현금 지출 기준)
  const buyMonthly = Math.round(results.buy.annualHoldingCosts.total / 12);
  const jeonseMonthly = Math.round(results.jeonse.periodicCosts.loanInterest / yearsToHold / 12);
  const rentMonthly = monthlyRent;

  const items = [
    { key: 'buy' as const, value: buyMonthly, sub: '대출+세금+관리비' },
    { key: 'jeonse' as const, value: jeonseMonthly, sub: '대출이자' },
    { key: 'monthlyRent' as const, value: rentMonthly, sub: '월 임차료' },
  ];

  const minVal = Math.min(...items.map((i) => i.value));

  return (
    <div className="px-4 mb-4">
      <h3 className="text-base font-bold text-gray-900 mb-2 px-1">예상 월 지출 비용</h3>
      <div className="grid grid-cols-3 gap-2">
        {items.map(({ key, value, sub }) => {
          const isMin = value === minVal;
          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${BG_COLORS[key]} rounded-2xl p-3 shadow-sm border-2 transition-all ${isMin ? BORDER_COLORS[key] : 'border-gray-200'}`}
            >
              <p className="text-xs text-gray-500 mb-1">{LABELS[key]}</p>
              <p className="text-sm font-bold leading-tight text-gray-900">
                {formatWon(value)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              {isMin && (
                <span
                  className="inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: COLORS[key] }}
                >
                  최저
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
