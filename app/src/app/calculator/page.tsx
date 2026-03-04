'use client';

import { useEffect } from 'react';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { TopBar } from '@/components/layout/TopBar';
import { PriceStepCard } from '@/components/inputs/PriceStepCard';
import { PeriodStepCard } from '@/components/inputs/PeriodStepCard';
import { InflationScenarioSelector } from '@/components/inputs/InflationScenarioSelector';
import { WinnerBanner } from '@/components/results/WinnerBanner';
import { AutoRecommendation } from '@/components/results/AutoRecommendation';
import { ScenarioSwipeCards } from '@/components/results/ScenarioSwipeCards';
import { LeverageSimulator } from '@/components/results/LeverageSimulator';
import { AssetProjectionChart } from '@/components/charts/AssetProjectionChart';
import { ScenarioComparisonChart } from '@/components/charts/ScenarioComparisonChart';

export default function CalculatorPage() {
  const calculate = useCalculatorStore((s) => s.calculate);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-10 pt-4">
        {/* 경제 전망 선택 */}
        <InflationScenarioSelector />

        {/* 입력 섹션 */}
        <section className="px-4 space-y-3 mb-4">
          <PriceStepCard />
          <PeriodStepCard />
        </section>

        {/* 추천 결과 */}
        <AutoRecommendation />

        {/* [메인] 인플레이션 시나리오별 비교 */}
        <ScenarioComparisonChart />

        {/* [메인] 순자산 변화 차트 */}
        <AssetProjectionChart />

        {/* 레버리지 시뮬레이션 */}
        <LeverageSimulator />

        {/* [보조] 시나리오 비용 카드 */}
        <ScenarioSwipeCards />

        {/* 결과 배너 */}
        <WinnerBanner />

        <p className="text-xs text-gray-400 text-center px-6 mt-4">
          ※ 공시가격은 시세의 70% 근사치 적용. 본 계산기는 참고용이며 법적 효력이 없습니다.
        </p>
      </main>
    </div>
  );
}
