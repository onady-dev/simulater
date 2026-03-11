'use client';

import { motion } from 'framer-motion';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { formatWon } from '@/lib/utils/format';

const SCENARIO_LABELS = {
  buy: '매수',
  jeonse: '전세',
  monthlyRent: '월세',
} as const;

export function WinnerBanner() {
  const results = useCalculatorStore((s) => s.results);
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);

  if (!results) {
    return (
      <div className="mx-4 rounded-2xl p-4 bg-gray-100 animate-pulse h-20" />
    );
  }

  const nets = {
    buy: results.buy.effectiveCost,   // 실질 주거비 (자산이익 반영)
    jeonse: results.jeonse.netTotal,
    monthlyRent: results.monthlyRent.netTotal,
  };

  const sorted = (Object.entries(nets) as [keyof typeof nets, number][]).sort(
    (a, b) => a[1] - b[1],
  );
  const winner = sorted[0];
  const second = sorted[1];

  if (!winner || !second) return null;

  const saving = second[1] - winner[1];
  const monthlySaving = Math.round(saving / (yearsToHold * 12));
  const label = SCENARIO_LABELS[winner[0]];

  return (
    <motion.div
      layout
      className="mx-4 rounded-2xl p-4 text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3182F6, #00B493)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm opacity-80">현재 조건에서는</p>
      <p className="text-xl font-bold mt-1">
        <span className="text-yellow-300">{label}</span>가 가장 유리해요
      </p>
      <p className="text-sm opacity-90 mt-1">
        차선책 대비 월 {formatWon(monthlySaving)} 절약
      </p>
    </motion.div>
  );
}
