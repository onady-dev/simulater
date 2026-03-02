'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { SliderWithLabel } from './SliderWithLabel';
import { formatRate, formatWon } from '@/lib/utils/format';
import type { HomeOwnerCount, LoanRepaymentType, JeonseInsuranceProvider, ScenarioKey } from '@/types';

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
  // const monthlyRentInputs = useCalculatorStore((s) => s.monthlyRentInputs);
  const updateBuyInputs = useCalculatorStore((s) => s.updateBuyInputs);
  const updateJeonseInputs = useCalculatorStore((s) => s.updateJeonseInputs);
  // const updateMonthlyRentInputs = useCalculatorStore((s) => s.updateMonthlyRentInputs);

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
                  />
                  <SliderWithLabel
                    label="연간 주택가격 변동률"
                    value={buyInputs.annualPriceChangeRate}
                    min={-0.1}
                    max={0.2}
                    step={0.005}
                    onChange={(v) => updateBuyInputs({ annualPriceChangeRate: v })}
                    formatValue={(v) => formatRate(v)}
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">주택 수</p>
                    <div className="flex gap-2">
                      {([1, 2, 3] as HomeOwnerCount[]).map((n) => (
                        <button
                          key={n}
                          onClick={() => updateBuyInputs({ numHomes: n })}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                            buyInputs.numHomes === n
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {n === 3 ? '3주택+' : `${n}주택`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">상환 방식</p>
                    <div className="flex flex-col gap-2">
                      {(
                        [
                          { key: 'equal_payment', label: '원리금균등상환' },
                          { key: 'equal_principal', label: '원금균등상환' },
                          { key: 'bullet', label: '만기일시상환' },
                        ] as { key: LoanRepaymentType; label: string }[]
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => updateBuyInputs({ loanType: key })}
                          className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                            buyInputs.loanType === key
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">생애최초 주택 구입</span>
                    <button
                      onClick={() =>
                        updateBuyInputs({ isFirstHomeBuyer: !buyInputs.isFirstHomeBuyer })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        buyInputs.isFirstHomeBuyer ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          buyInputs.isFirstHomeBuyer ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

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
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">전세보증보험</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { key: 'none', label: '가입 없음' },
                          { key: 'hf', label: 'HF (0.04~0.18%)' },
                          { key: 'hug', label: 'HUG (0.11~0.21%)' },
                          { key: 'sgi', label: 'SGI (0.18~0.21%)' },
                        ] as { key: JeonseInsuranceProvider; label: string }[]
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => updateJeonseInputs({ insuranceProvider: key })}
                          className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                            jeonseInputs.insuranceProvider === key
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
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
