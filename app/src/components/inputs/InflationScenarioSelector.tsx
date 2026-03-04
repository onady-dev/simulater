'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import type { InflationScenario } from '@/types';

const SCENARIOS: { key: InflationScenario; label: string; rate: string; color: string; desc: string }[] = [
  { key: 'low', label: '저인플레이션', rate: '1.5%', color: '#10B981', desc: '안정적 경제' },
  { key: 'medium', label: '중인플레이션', rate: '3%', color: '#F59E0B', desc: '일반적 상황' },
  { key: 'high', label: '고인플레이션', rate: '5%', color: '#EF4444', desc: '고물가 시대' },
];

export function InflationScenarioSelector() {
  const inflationScenario = useCalculatorStore((s) => s.inflationScenario);
  const setInflationScenario = useCalculatorStore((s) => s.setInflationScenario);

  return (
    <div className="px-4 mb-4">
      <p className="text-xs text-gray-500 mb-2 font-medium">향후 경제 전망</p>
      <div className="grid grid-cols-3 gap-2">
        {SCENARIOS.map((s) => {
          const isSelected = inflationScenario === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setInflationScenario(s.key)}
              className={`p-3 rounded-2xl border-2 transition-all text-left ${
                isSelected ? 'border-current bg-opacity-10' : 'border-gray-100 bg-white'
              }`}
              style={isSelected ? { borderColor: s.color, backgroundColor: s.color + '15' } : {}}
            >
              <div className="text-xs text-gray-500 mb-1">{s.desc}</div>
              <div className="text-base font-bold" style={{ color: s.color }}>
                {s.rate}
              </div>
              <div className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
