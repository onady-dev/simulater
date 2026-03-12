'use client';

import { useState } from 'react';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { NumberPadInput } from './NumberPadInput';
import { SliderWithLabel } from './SliderWithLabel';
import { formatRate, formatWonCompact } from '@/lib/utils/format';

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

const MONTHLY_SAVINGS_PRESETS = [
  { label: '100만', value: 1_000_000 },
  { label: '200만', value: 2_000_000 },
  { label: '300만', value: 3_000_000 },
  { label: '500만', value: 5_000_000 },
];
export function PriceStepCard() {
  const [showBuyDetails, setShowBuyDetails] = useState(false);
  const [showJeonseDetails, setShowJeonseDetails] = useState(false);

  const buyInputs = useCalculatorStore((s) => s.buyInputs);
  const jeonseInputs = useCalculatorStore((s) => s.jeonseInputs);
  const monthlyRentInputs = useCalculatorStore((s) => s.monthlyRentInputs);
  const updateBuyInputs = useCalculatorStore((s) => s.updateBuyInputs);
  const updateJeonseInputs = useCalculatorStore((s) => s.updateJeonseInputs);
  const updateMonthlyRentInputs = useCalculatorStore((s) => s.updateMonthlyRentInputs);

  const syncMonthlySavings = useCalculatorStore((s) => s.syncMonthlySavings);
  const syncAvailableCash = (v: number) => {
    updateBuyInputs({ 
      availableCash: v,
      loanAmount: Math.max(0, buyInputs.purchasePrice - v),
    });
    updateJeonseInputs({ 
      availableCash: v,
      loanAmount: Math.max(0, jeonseInputs.depositAmount - v),
    });
    updateMonthlyRentInputs({ availableCash: v });
  };

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 px-1">주택 정보 입력</h2>

        {/* 현재 보유 자산 */}

        {/* 월 저축 가능 금액 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900">월 저축 가능 금액</h3>
            <span className="text-2xl font-bold text-green-500">
              {formatWonCompact(buyInputs.monthlySavings)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={10_000_000}
            step={500_000}
            value={buyInputs.monthlySavings}
            onChange={(e) => syncMonthlySavings(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0원</span>
            <span>1,000만</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {MONTHLY_SAVINGS_PRESETS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => syncMonthlySavings(value)}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  buyInputs.monthlySavings === value
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            💡 매달 저축 가능한 금액을 입력하세요 (소득 - 생활비)
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900">현재 보유 자산</h3>
            <span className="text-2xl font-bold text-blue-500">
              {(buyInputs.availableCash / 100_000_000).toFixed(1)}억원
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={2_000_000_000}
            step={10_000_000}
            value={buyInputs.availableCash}
            onChange={(e) => syncAvailableCash(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0억</span>
            <span>20억</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {AVAILABLE_CASH_PRESETS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => syncAvailableCash(value)}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  buyInputs.availableCash === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">가용 가능 현금 (순자산 비교 기준)</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900">매수가격</h3>
            <span className="text-2xl font-bold text-blue-500">
              {(buyInputs.purchasePrice / 100_000_000).toFixed(1)}억원
            </span>
          </div>

          <input
            type="range"
            min={100_000_000}
            max={3_000_000_000}
            step={10_000_000}
            value={buyInputs.purchasePrice}
            onChange={(e) => {
              const v = Number(e.target.value);
              updateBuyInputs({
                purchasePrice: v,
                loanAmount: Math.max(0, v - buyInputs.availableCash),
              });
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1억</span>
            <span>30억</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BUY_PRICE_PRESETS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => {
                  updateBuyInputs({
                    purchasePrice: value,
                    loanAmount: Math.max(0, value - buyInputs.availableCash),
                  });
                }}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  buyInputs.purchasePrice === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowBuyDetails(!showBuyDetails)}
            className="w-full py-2 text-xs text-blue-600 font-medium flex items-center justify-center gap-1"
          >
            {showBuyDetails ? '대출 설정 접기' : '대출 설정 펼치기'}
            <svg
              className={`w-4 h-4 transition-transform ${showBuyDetails ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showBuyDetails && (
            <>
              <SliderWithLabel
                label="주택담보대출 금액"
                value={buyInputs.loanAmount}
                min={0}
                max={buyInputs.purchasePrice}
                step={10_000_000}
                onChange={(v) => updateBuyInputs({ loanAmount: v })}
                formatValue={(v) => `${(v / 100_000_000).toFixed(1)}억원`}
              />
              <SliderWithLabel
                label="대출 금리"
                value={buyInputs.loanRate}
                min={0.01}
                max={0.1}
                step={0.001}
                onChange={(v) => updateBuyInputs({ loanRate: v })}
                formatValue={(v) => formatRate(v)}
                userSet={buyInputs.userSetLoanRate}
              />
            </>
          )}
          <p className="text-xs text-gray-400">매수 시나리오</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900">전세보증금</h3>
            <span className="text-2xl font-bold text-amber-500">
              {(jeonseInputs.depositAmount / 100_000_000).toFixed(1)}억원
            </span>
          </div>

          <input
            type="range"
            min={50_000_000}
            max={2_000_000_000}
            step={10_000_000}
            value={jeonseInputs.depositAmount}
            onChange={(e) => {
              const v = Number(e.target.value);
              updateJeonseInputs({
                depositAmount: v,
                loanAmount: Math.max(0, v - buyInputs.availableCash),
              });
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0.5억</span>
            <span>20억</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {JEONSE_PRESETS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => {
                  updateJeonseInputs({
                    depositAmount: value,
                    loanAmount: Math.max(0, value - buyInputs.availableCash),
                  });
                }}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  jeonseInputs.depositAmount === value
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowJeonseDetails(!showJeonseDetails)}
            className="w-full py-2 text-xs text-amber-600 font-medium flex items-center justify-center gap-1"
          >
            {showJeonseDetails ? '대출 설정 접기' : '대출 설정 펼치기'}
            <svg
              className={`w-4 h-4 transition-transform ${showJeonseDetails ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showJeonseDetails && (
            <>
              <SliderWithLabel
                label="전세대출 금액"
                value={jeonseInputs.loanAmount}
                min={0}
                max={jeonseInputs.depositAmount}
                step={10_000_000}
                onChange={(v) => updateJeonseInputs({ loanAmount: v })}
                formatValue={(v) => `${(v / 100_000_000).toFixed(1)}억원`}
              />
              <SliderWithLabel
                label="전세대출 금리"
                value={jeonseInputs.loanRate}
                min={0.01}
                max={0.1}
                step={0.001}
                onChange={(v) => updateJeonseInputs({ loanRate: v })}
                formatValue={(v) => formatRate(v)}
                userSet={jeonseInputs.userSetLoanRate}
              />
            </>
          )}
          <p className="text-xs text-gray-400">전세 시나리오</p>
        </div>

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
            color="emerald"
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
            color="emerald"
          />
        </div>
      </div>
    </>
  );
}
