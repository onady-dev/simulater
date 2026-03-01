'use client';

import { useEffect } from 'react';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { TopBar } from '@/components/layout/TopBar';
import { PriceStepCard } from '@/components/inputs/PriceStepCard';
import { PeriodStepCard } from '@/components/inputs/PeriodStepCard';
import { AdvancedSheet } from '@/components/inputs/AdvancedSheet';
import { WinnerBanner } from '@/components/results/WinnerBanner';
import { ScenarioSwipeCards } from '@/components/results/ScenarioSwipeCards';
import { YearlyCostChart } from '@/components/charts/YearlyCostChart';
import { BreakevenChart } from '@/components/charts/BreakevenChart';
import { ScenarioBarChart } from '@/components/charts/ScenarioBarChart';
import { AssetProjectionChart } from '@/components/charts/AssetProjectionChart';

export default function CalculatorPage() {
  const calculate = useCalculatorStore((s) => s.calculate);
  const results = useCalculatorStore((s) => s.results);
  const buyInputs = useCalculatorStore((s) => s.buyInputs);

  // 초기 계산
  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-10 space-y-4 pt-4">
        {/* 입력 섹션 */}
        <section className="px-4 space-y-3">
          <PriceStepCard />
          <PeriodStepCard />
          <AdvancedSheet />
        </section>

        {/* 결과 배너 */}
        <WinnerBanner />

        {/* [메인] 순자산 변화 차트 */}
        <AssetProjectionChart />

        {/* [보조] 시나리오 비용 카드 */}
        <ScenarioSwipeCards />

        {/* [보조] 비용 상세 차트 */}
        {results && (
          <section className="px-4 space-y-4">
            <ScenarioBarChart
              buyResult={results.buy}
              jeonseResult={results.jeonse}
              monthlyRentResult={results.monthlyRent}
              yearsToHold={buyInputs.yearsToHold}
            />
            <YearlyCostChart
              data={results.yearlyCostSeries}
              currentYear={buyInputs.yearsToHold}
            />
            <BreakevenChart
              data={results.breakevenSeries}
              currentRate={buyInputs.annualPriceChangeRate}
            />
          </section>
        )}

        <p className="text-xs text-gray-400 text-center px-6">
          ※ 공시가격은 시세의 70% 근사치 적용. 본 계산기는 참고용이며 법적 효력이 없습니다.
        </p>
      </main>
    </div>
  );
}
