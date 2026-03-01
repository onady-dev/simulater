'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { NumberPadInput } from './NumberPadInput';

const BUY_PRICE_PRESETS = [
  { label: '3억', value: 300_000_000 },
  { label: '5억', value: 500_000_000 },
  { label: '7억', value: 700_000_000 },
  { label: '10억', value: 1_000_000_000 },
];

const JEONSE_PRESETS = [
  { label: '2억', value: 200_000_000 },
  { label: '3억', value: 300_000_000 },
  { label: '4.5억', value: 450_000_000 },
  { label: '6억', value: 600_000_000 },
];

const DEPOSIT_PRESETS = [
  { label: '1천만', value: 10_000_000 },
  { label: '3천만', value: 30_000_000 },
  { label: '5천만', value: 50_000_000 },
  { label: '1억', value: 100_000_000 },
];

const MONTHLY_RENT_PRESETS = [
  { label: '50만', value: 500_000 },
  { label: '100만', value: 1_000_000 },
  { label: '150만', value: 1_500_000 },
  { label: '200만', value: 2_000_000 },
];

export function PriceStepCard() {
  const buyInputs = useCalculatorStore((s) => s.buyInputs);
  const jeonseInputs = useCalculatorStore((s) => s.jeonseInputs);
  const monthlyRentInputs = useCalculatorStore((s) => s.monthlyRentInputs);
  const updateBuyInputs = useCalculatorStore((s) => s.updateBuyInputs);
  const updateJeonseInputs = useCalculatorStore((s) => s.updateJeonseInputs);
  const updateMonthlyRentInputs = useCalculatorStore((s) => s.updateMonthlyRentInputs);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-gray-900 px-1">주택 정보 입력</h2>

      <NumberPadInput
        label="매수가격"
        value={buyInputs.purchasePrice}
        onChange={(v) => {
          updateBuyInputs({
            purchasePrice: v,
            loanAmount: Math.floor(v * 0.6),
          });
        }}
        unit="억원"
        presets={BUY_PRICE_PRESETS}
        min={100_000_000}
        max={3_000_000_000}
        step={10_000_000}
        description="매수 시나리오"
      />

      <NumberPadInput
        label="전세보증금"
        value={jeonseInputs.depositAmount}
        onChange={(v) => {
          updateJeonseInputs({
            depositAmount: v,
            loanAmount: Math.floor(v * 0.4),
          });
        }}
        unit="억원"
        presets={JEONSE_PRESETS}
        min={50_000_000}
        max={2_000_000_000}
        step={10_000_000}
        description="전세 시나리오"
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <NumberPadInput
            label="보증금"
            value={monthlyRentInputs.depositAmount}
            onChange={(v) => updateMonthlyRentInputs({ depositAmount: v })}
            unit="만원"
            presets={DEPOSIT_PRESETS}
            min={0}
            max={500_000_000}
            step={1_000_000}
            description="월세 시나리오"
          />
        </div>
        <div className="flex-1">
          <NumberPadInput
            label="월세"
            value={monthlyRentInputs.monthlyRent}
            onChange={(v) => updateMonthlyRentInputs({ monthlyRent: v })}
            unit="만원/월"
            presets={MONTHLY_RENT_PRESETS}
            min={100_000}
            max={5_000_000}
            step={50_000}
          />
        </div>
      </div>
    </div>
  );
}
