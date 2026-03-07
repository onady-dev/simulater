'use client';

import { useState } from 'react';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { NumberPadInput } from './NumberPadInput';
import { SliderWithLabel } from './SliderWithLabel';
import { AdvancedSheet } from './AdvancedSheet';
import { formatRate } from '@/lib/utils/format';
import type { ScenarioKey } from '@/types';

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

const AVAILABLE_CASH_PRESETS = [
  { label: '1억', value: 100_000_000 },
  { label: '2억', value: 200_000_000 },
  { label: '3억', value: 300_000_000 },
  { label: '5억', value: 500_000_000 },
];

export function PriceStepCard() {
  const [openSheet, setOpenSheet] = useState<ScenarioKey | null>(null);
  const [showInvestmentInfo, setShowInvestmentInfo] = useState(false);

  const buyInputs = useCalculatorStore((s) => s.buyInputs);
  const jeonseInputs = useCalculatorStore((s) => s.jeonseInputs);
  const monthlyRentInputs = useCalculatorStore((s) => s.monthlyRentInputs);
  const updateBuyInputs = useCalculatorStore((s) => s.updateBuyInputs);
  const updateJeonseInputs = useCalculatorStore((s) => s.updateJeonseInputs);
  const updateMonthlyRentInputs = useCalculatorStore((s) => s.updateMonthlyRentInputs);

  const syncAvailableCash = (v: number) => {
    updateBuyInputs({ availableCash: v });
    updateJeonseInputs({ availableCash: v });
    updateMonthlyRentInputs({ availableCash: v });
  };

  const syncInvestmentReturn = (v: number) => {
    updateBuyInputs({ expectedInvestmentReturn: v });
    updateJeonseInputs({ expectedInvestmentReturn: v });
    updateMonthlyRentInputs({ expectedInvestmentReturn: v });
  };

  const syncPriceChangeRate = (v: number) => {
    updateBuyInputs({ annualPriceChangeRate: v });
  };

  return (
    <>
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
          onSettingsClick={() => setOpenSheet('buy')}
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
          onSettingsClick={() => setOpenSheet('jeonse')}
        />

        <div className="grid grid-cols-2 gap-3 items-stretch">
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
            className="h-full"
          />
          <NumberPadInput
            label="월세"
            value={monthlyRentInputs.monthlyRent}
            onChange={(v) => updateMonthlyRentInputs({ monthlyRent: v })}
            unit="만원/월"
            presets={MONTHLY_RENT_PRESETS}
            min={100_000}
            max={5_000_000}
            step={50_000}
            description="월세 시나리오"
            className="h-full"
          />
        </div>

        {/* 공통 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 space-y-5">
          <NumberPadInput
            label="현재 보유 자산"
            value={buyInputs.availableCash}
            onChange={syncAvailableCash}
            unit="억원"
            presets={AVAILABLE_CASH_PRESETS}
            min={0}
            max={2_000_000_000}
            step={10_000_000}
            description="가용 가능 현금 (순자산 비교 기준)"
          />

          <SliderWithLabel
            label="연간 주택가격 변동률"
            value={buyInputs.annualPriceChangeRate}
            min={-0.1}
            max={0.2}
            step={0.005}
            onChange={syncPriceChangeRate}
            formatValue={(v) => formatRate(v)}
            userSet={buyInputs.userSetPriceChangeRate}
          />

          <div>
            <SliderWithLabel
              label="기대 투자수익률"
              value={buyInputs.expectedInvestmentReturn}
              min={0.01}
              max={0.15}
              step={0.005}
              onChange={syncInvestmentReturn}
              formatValue={formatRate}
              userSet={buyInputs.userSetInvestmentReturn}
              onInfoClick={() => setShowInvestmentInfo((v) => !v)}
            />
            {showInvestmentInfo && (
              <div className="mt-2 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 leading-relaxed">
                전세·월세로 절약한 여유 자금을 운용할 때 기대하는 연간 수익률입니다.
                예금(3~4%), 주식 ETF(7~10%) 등 투자 방식에 따라 달라집니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <AdvancedSheet scenario={openSheet} onClose={() => setOpenSheet(null)} />
    </>
  );
}
