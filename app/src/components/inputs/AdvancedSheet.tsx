'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { SliderWithLabel } from './SliderWithLabel';
import { formatRate, formatWon } from '@/lib/utils/format';
import type { HomeOwnerCount, LoanRepaymentType, JeonseInsuranceProvider, ScenarioKey } from '@/types';

type ActiveSheet = ScenarioKey | null;

const SHEET_CONFIG = {
  buy: {
    label: '매수',
    color: 'text-blue-500',
    activeBg: 'bg-blue-50 border border-blue-200',
    titleColor: 'text-blue-500',
  },
  jeonse: {
    label: '전세',
    color: 'text-amber-500',
    activeBg: 'bg-amber-50 border border-amber-200',
    titleColor: 'text-amber-500',
  },
  monthlyRent: {
    label: '월세',
    color: 'text-emerald-500',
    activeBg: 'bg-emerald-50 border border-emerald-200',
    titleColor: 'text-emerald-500',
  },
} as const;

export function AdvancedSheet() {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  const buyInputs = useCalculatorStore((s) => s.buyInputs);
  const jeonseInputs = useCalculatorStore((s) => s.jeonseInputs);
  const monthlyRentInputs = useCalculatorStore((s) => s.monthlyRentInputs);
  const updateBuyInputs = useCalculatorStore((s) => s.updateBuyInputs);
  const updateJeonseInputs = useCalculatorStore((s) => s.updateJeonseInputs);
  const updateMonthlyRentInputs = useCalculatorStore((s) => s.updateMonthlyRentInputs);

  const close = () => setActiveSheet(null);

  return (
    <>
      {/* 시나리오별 상세 설정 버튼 3개 */}
      <div className="grid grid-cols-3 gap-2">
        {(['buy', 'jeonse', 'monthlyRent'] as ScenarioKey[]).map((scenario) => {
          const cfg = SHEET_CONFIG[scenario];
          return (
            <button
              key={scenario}
              onClick={() => setActiveSheet(scenario)}
              className="flex items-center justify-center gap-1.5 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600 active:bg-gray-100 transition-colors"
            >
              <span className="text-base">⚙️</span>
              <span className={cfg.color}>{cfg.label}</span>
              <span className="text-gray-400 text-xs">›</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {activeSheet && (
          <motion.div
            key={activeSheet}
            className="fixed inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={close} />
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
                  <h2 className={`text-lg font-bold ${SHEET_CONFIG[activeSheet].titleColor}`}>
                    {SHEET_CONFIG[activeSheet].label} 상세 설정
                  </h2>
                  <button onClick={close} className="text-gray-400 text-2xl leading-none">
                    ×
                  </button>
                </div>
              </div>

              <div className="px-5 pt-5 space-y-5">
                {/* ── 매수 ── */}
                {activeSheet === 'buy' && (
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

                    <SliderWithLabel
                      label="연 소득 (세제혜택 계산)"
                      value={buyInputs.annualIncome}
                      min={10_000_000}
                      max={300_000_000}
                      step={5_000_000}
                      onChange={(v) => {
                        updateBuyInputs({ annualIncome: v });
                        updateJeonseInputs({ annualIncome: v });
                        updateMonthlyRentInputs({ annualIncome: v });
                      }}
                      formatValue={formatWon}
                    />
                  </>
                )}

                {/* ── 전세 ── */}
                {activeSheet === 'jeonse' && (
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

                    <SliderWithLabel
                      label="기대 투자수익률 (기회비용)"
                      value={jeonseInputs.expectedInvestmentReturn}
                      min={0.01}
                      max={0.15}
                      step={0.005}
                      onChange={(v) => updateJeonseInputs({ expectedInvestmentReturn: v })}
                      formatValue={(v) => formatRate(v)}
                    />

                    <SliderWithLabel
                      label="연 소득 (세제혜택 계산)"
                      value={jeonseInputs.annualIncome}
                      min={10_000_000}
                      max={300_000_000}
                      step={5_000_000}
                      onChange={(v) => {
                        updateBuyInputs({ annualIncome: v });
                        updateJeonseInputs({ annualIncome: v });
                        updateMonthlyRentInputs({ annualIncome: v });
                      }}
                      formatValue={formatWon}
                    />
                  </>
                )}

                {/* ── 월세 ── */}
                {activeSheet === 'monthlyRent' && (
                  <>
                    <SliderWithLabel
                      label="기대 투자수익률 (기회비용)"
                      value={monthlyRentInputs.expectedInvestmentReturn}
                      min={0.01}
                      max={0.15}
                      step={0.005}
                      onChange={(v) => updateMonthlyRentInputs({ expectedInvestmentReturn: v })}
                      formatValue={(v) => formatRate(v)}
                    />

                    <SliderWithLabel
                      label="연 소득 (세제혜택 계산)"
                      value={monthlyRentInputs.annualIncome}
                      min={10_000_000}
                      max={300_000_000}
                      step={5_000_000}
                      onChange={(v) => {
                        updateBuyInputs({ annualIncome: v });
                        updateJeonseInputs({ annualIncome: v });
                        updateMonthlyRentInputs({ annualIncome: v });
                      }}
                      formatValue={formatWon}
                    />
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
