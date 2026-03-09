'use client';

import { useEffect } from 'react';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { TopBar } from '@/components/layout/TopBar';
import { PriceStepCard } from '@/components/inputs/PriceStepCard';
import { PeriodStepCard } from '@/components/inputs/PeriodStepCard';
import { AutoRecommendation } from '@/components/results/AutoRecommendation';
import { AssetProjectionChart } from '@/components/charts/AssetProjectionChart';
import { MonthlyCostSummary } from '@/components/results/MonthlyCostSummary';

export default function CalculatorPage() {
  const calculate = useCalculatorStore((s) => s.calculate);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-10 pt-4">
        {/* 입력 섹션 */}
        <section className="px-4 space-y-3 mb-4">
          <PriceStepCard />
          <PeriodStepCard />
        </section>

        {/* 추천 결과 */}
        <AutoRecommendation />

        {/* 순자산 변화 차트 */}
        <div className="px-4 mb-4">
          <AssetProjectionChart />
        </div>

        {/* 예상 월 지출 비용 */}
        <MonthlyCostSummary />

        <p className="text-xs text-gray-400 text-center px-6 mt-4">
          ※ 공시가격은 시세의 70% 근사치 적용. 본 계산기는 참고용이며 법적 효력이 없습니다.
        </p>
      </main>
    </div>
  );
}
