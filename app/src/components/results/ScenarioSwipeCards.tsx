'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { formatWon } from '@/lib/utils/format';
import { CostDetailSheet } from './CostDetailSheet';
import type { ScenarioKey } from '@/types';

const SCENARIOS: ScenarioKey[] = ['buy', 'jeonse', 'monthlyRent'];
const LABELS: Record<ScenarioKey, string> = { buy: '매수', jeonse: '전세', monthlyRent: '월세' };
const COLORS: Record<ScenarioKey, string> = {
  buy: '#3182F6',
  jeonse: '#F59E0B',
  monthlyRent: '#00B493',
};

const SWIPE_THRESHOLD = 40;
const SWIPE_VELOCITY_THRESHOLD = 400;

export function ScenarioSwipeCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailScenario, setDetailScenario] = useState<ScenarioKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWidthRef = useRef(0);
  const x = useMotionValue(0);

  const results = useCalculatorStore((s) => s.results);
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);

  // useLayoutEffect: paint 전 동기 측정 → 첫 프레임 cardWidth=0 노출 방지
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      if (w === cardWidthRef.current) return;
      cardWidthRef.current = w;
      // 현재 인덱스 위치로 즉시 보정 (animate() 아닌 x.set())
      x.set(-activeIndex * w);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeIndex, x]);

  function goTo(index: number) {
    const width = containerRef.current?.offsetWidth ?? cardWidthRef.current;
    animate(x, -index * width, { type: 'spring', damping: 30, stiffness: 300 });
    setActiveIndex(index);
  }

  function handleDragEnd(
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) {
    const dx = info.offset.x;
    const vx = info.velocity.x;
    const width = containerRef.current?.offsetWidth ?? cardWidthRef.current;

    if (
      (dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY_THRESHOLD) &&
      activeIndex < SCENARIOS.length - 1
    ) {
      const next = activeIndex + 1;
      animate(x, -next * width, { type: 'spring', damping: 30, stiffness: 300 });
      setActiveIndex(next);
    } else if (
      (dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY_THRESHOLD) &&
      activeIndex > 0
    ) {
      const prev = activeIndex - 1;
      animate(x, -prev * width, { type: 'spring', damping: 30, stiffness: 300 });
      setActiveIndex(prev);
    } else {
      animate(x, -activeIndex * width, { type: 'spring', damping: 30, stiffness: 300 });
    }
  }

  if (!results) {
    return (
      <div className="px-4 space-y-3">
        <div className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
        <div className="flex justify-center gap-2">
          {SCENARIOS.map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  const compareValues: Record<ScenarioKey, number> = {
    buy: results.buy.effectiveCost,
    jeonse: results.jeonse.netTotal,
    monthlyRent: results.monthlyRent.netTotal,
  };
  const minCompare = Math.min(...Object.values(compareValues));

  return (
    <>
      <div className="space-y-3">
        <div className="overflow-hidden" ref={containerRef}>
          <motion.div
            className="flex cursor-grab active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragConstraints={{
              left: cardWidthRef.current > 0 ? -(SCENARIOS.length - 1) * cardWidthRef.current : 0,
              right: 0,
            }}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            {SCENARIOS.map((scenario) => {
              const compareValue = compareValues[scenario];
              const isWinner = compareValue === minCompare;
              const color = COLORS[scenario];
              const monthlyAvg = Math.round(compareValue / (yearsToHold * 12));

              return (
                <div
                  key={scenario}
                  className="flex-shrink-0 px-4"
                  style={{ width: cardWidthRef.current > 0 ? cardWidthRef.current : '100%' }}
                >
                  <div
                    className="bg-white rounded-3xl p-6 shadow-sm border-2 transition-colors"
                    style={{ borderColor: isWinner ? color : '#E5E7EB' }}
                  >
                    {/* 고정 높이 배지 영역 — 없는 카드도 동일 공간 확보 */}
                    <div className="h-7 mb-1">
                      {isWinner && (
                        <span
                          className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white"
                          style={{ backgroundColor: color }}
                        >
                          추천
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">{LABELS[scenario]}</h3>

                    <p className="text-3xl font-bold mt-2" style={{ color }}>
                      {formatWon(compareValue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      월 평균 {formatWon(monthlyAvg)}
                    </p>

                    {/* 매수 자산이익 3행 — 없는 카드에는 invisible 플레이스홀더 */}
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                      {scenario === 'buy' ? (
                        <>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>총 지출 비용</span>
                            <span>{formatWon(results.buy.netTotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-emerald-600">시세 상승 이익</span>
                            <span className="text-emerald-600 font-medium">
                              -{formatWon(results.buy.assetGain.priceGain)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>예상 시세</span>
                            <span>{formatWon(results.buy.assetGain.finalPropertyValue)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="invisible flex justify-between text-xs">
                            <span>placeholder</span>
                            <span>-</span>
                          </div>
                          <div className="invisible flex justify-between text-xs">
                            <span>placeholder</span>
                            <span>-</span>
                          </div>
                          <div className="invisible flex justify-between text-xs">
                            <span>placeholder</span>
                            <span>-</span>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setDetailScenario(scenario)}
                      className="mt-4 w-full py-3 rounded-2xl text-sm font-semibold transition-colors"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      상세 내역 보기
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* 페이지 인디케이터 */}
        <div className="flex justify-center gap-2">
          {SCENARIOS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex ? 'w-6 h-2 bg-blue-500' : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {detailScenario && (
        <CostDetailSheet
          isOpen={detailScenario !== null}
          onClose={() => setDetailScenario(null)}
          scenario={detailScenario}
          buyResult={results.buy}
          jeonseResult={results.jeonse}
          monthlyRentResult={results.monthlyRent}
          yearsToHold={yearsToHold}
        />
      )}
    </>
  );
}
