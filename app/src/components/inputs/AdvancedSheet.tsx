'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { SliderWithLabel } from './SliderWithLabel';
import { formatRate, formatWon } from '@/lib/utils/format';
import type { ScenarioKey } from '@/types';

interface Props {
  scenario: ScenarioKey | null;
  onClose: () => void;
}

const TITLE: Record<ScenarioKey, string> = {
  buy: '매수 상세 설정',
  jeonse: '전세 상세 설정',
  monthlyRent: '월세 상세 설정',
};

const TITLE_COLOR: Record<ScenarioKey, string> = {
  buy: 'text-blue-500',
  jeonse: 'text-amber-500',
  monthlyRent: 'text-emerald-500',
};

export function AdvancedSheet({ scenario, onClose }: Props) {
  const buyInputs = useCalculatorStore((s) => s.buyInputs);
  const jeonseInputs = useCalculatorStore((s) => s.jeonseInputs);
  const updateBuyInputs = useCalculatorStore((s) => s.updateBuyInputs);
  const updateJeonseInputs = useCalculatorStore((s) => s.updateJeonseInputs);

  return (
    <AnimatePresence>
      {scenario && (
        <motion.div
          key={scenario}
          className="fixed inset-0 z-50 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="relative bg-white rounded-t-3xl pb-10 max-h-[85vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            <div className="sticky top-0 bg-white px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex justify-between items-center">
                <h2 className={`text-lg font-bold ${TITLE_COLOR[scenario]}`}>
                  {TITLE[scenario]}
                </h2>
                <button onClick={onClose} className="text-gray-400 text-2xl leading-none">
                  ×
                </button>
              </div>
            </div>

            <div className="px-5 pt-5 space-y-5">
              {/* ── 매수 ── */}
              {scenario === 'buy' && (
                <>
                  <SliderWithLabel
                    label="주택담보대출 금액"
                    value={buyInputs.loanAmount}
                    min={0}
                    max={buyInputs.purchasePrice}
                    step={10_000_000}
                    onChange={(v) => updateBuyInputs({ loanAmount: v })}
                    formatValue={formatWon}
                  />
                  <SliderWithLabel
                    label="대출 금리"
                    value={buyInputs.loanRate}
                    min={0.01}
                    max={0.1}
                    step={0.001}
                    onChange={(v) => updateBuyInputs({ loanRate: v })}
                    formatValue={(v) => formatRate(v)}
                    userSet={buyInputs.userSetLoanRate}
                  />
                </>
              )}

              {/* ── 전세 ── */}
              {scenario === 'jeonse' && (
                <>
                  <SliderWithLabel
                    label="전세대출 금액"
                    value={jeonseInputs.loanAmount}
                    min={0}
                    max={jeonseInputs.depositAmount}
                    step={10_000_000}
                    onChange={(v) => updateJeonseInputs({ loanAmount: v })}
                    formatValue={formatWon}
                  />
                  <SliderWithLabel
                    label="전세대출 금리"
                    value={jeonseInputs.loanRate}
                    min={0.01}
                    max={0.1}
                    step={0.001}
                    onChange={(v) => updateJeonseInputs({ loanRate: v })}
                    formatValue={(v) => formatRate(v)}
                    userSet={jeonseInputs.userSetLoanRate}
                  />
                </>
              )}

              {/* ── 월세 ── */}
              {scenario === 'monthlyRent' && (
                <p className="text-sm text-gray-400 text-center py-4">
                  월세 전용 상세 설정이 없습니다.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
