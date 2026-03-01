'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { PresetButtons } from './PresetButtons';

const PERIOD_PRESETS = [
  { label: '1년', value: 1 },
  { label: '3년', value: 3 },
  { label: '5년', value: 5 },
  { label: '10년', value: 10 },
];

export function PeriodStepCard() {
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);
  const updateBuyInputs = useCalculatorStore((s) => s.updateBuyInputs);
  const updateJeonseInputs = useCalculatorStore((s) => s.updateJeonseInputs);
  const updateMonthlyRentInputs = useCalculatorStore((s) => s.updateMonthlyRentInputs);

  const setYears = (years: number) => {
    updateBuyInputs({ yearsToHold: years });
    updateJeonseInputs({ yearsToHold: years });
    updateMonthlyRentInputs({ yearsToHold: years });
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold text-gray-900">거주 예정 기간</h2>
        <span className="text-2xl font-bold text-blue-500">{yearsToHold}년</span>
      </div>

      <input
        type="range"
        min={1}
        max={20}
        step={1}
        value={yearsToHold}
        onChange={(e) => setYears(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>1년</span>
        <span>20년</span>
      </div>

      <PresetButtons
        presets={PERIOD_PRESETS}
        currentValue={yearsToHold}
        onSelect={setYears}
      />
    </div>
  );
}
