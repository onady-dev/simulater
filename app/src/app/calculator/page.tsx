'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { TopBar } from '@/components/layout/TopBar';
import { PriceStepCard } from '@/components/inputs/PriceStepCard';
import { PeriodStepCard } from '@/components/inputs/PeriodStepCard';
import { AutoRecommendation } from '@/components/results/AutoRecommendation';
import { AssetProjectionChart } from '@/components/charts/AssetProjectionChart';
import { MonthlyCostSummary } from '@/components/results/MonthlyCostSummary';
import { CalculationLoadingScreen } from '@/components/loading/CalculationLoadingScreen';
import { IdleStateGuide } from '@/components/results/IdleStateGuide';

export default function CalculatorPage() {
  const calculationPhase = useCalculatorStore((s) => s.calculationPhase);
  const startCalculation = useCalculatorStore((s) => s.startCalculation);
  const isLoading = calculationPhase === 'loading';

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-10 pt-4">
        <section className="px-4 space-y-3 mb-4">
          <PriceStepCard />
          <PeriodStepCard />
        </section>

        <div className="px-4 mb-4">
          <button
            onClick={startCalculation}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{
              background: isLoading
                ? '#93c5fd'
                : 'linear-gradient(135deg, #3182F6 0%, #7C3AED 100%)',
              boxShadow: isLoading ? 'none' : '0 4px 20px rgba(49,130,246,0.35)',
            }}
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-lg">⚙️</span>
                <span>계산 중...</span>
              </>
            ) : (
              <>
                <span>🏠</span>
                <span>계산하기</span>
              </>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {calculationPhase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IdleStateGuide />
            </motion.div>
          )}

          {calculationPhase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
            >
              <CalculationLoadingScreen />
            </motion.div>
          )}

          {calculationPhase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <AutoRecommendation />
              <div className="px-4 mb-4">
                <AssetProjectionChart />
              </div>
              <MonthlyCostSummary />
              <p className="text-xs text-gray-400 text-center px-6 mt-4">
                ※ 공시가격은 시세의 70% 근사치 적용. 본 계산기는 참고용이며 법적 효력이 없습니다.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
