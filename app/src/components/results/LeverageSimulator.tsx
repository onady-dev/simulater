'use client';

import { useState } from 'react';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { formatWon } from '@/lib/utils/format';

export function LeverageSimulator() {
  const purchasePrice = useCalculatorStore((s) => s.buyInputs.purchasePrice);
  const annualPriceChangeRate = useCalculatorStore((s) => s.buyInputs.annualPriceChangeRate);
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);
  const [ltv, setLtv] = useState(60);

  const loanAmount = Math.floor(purchasePrice * (ltv / 100));
  const equity = purchasePrice - loanAmount;

  const futureValue = purchasePrice * Math.pow(1 + annualPriceChangeRate, yearsToHold);
  const priceGain = futureValue - purchasePrice;
  const roe = equity > 0 ? (priceGain / equity) * 100 : 0;

  // 레버리지 없을 때 수익률
  const baseRoe = (priceGain / purchasePrice) * 100;
  const leverageEffect = roe - baseRoe;

  return (
    <div className="px-4 mb-4">
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4">레버리지 시뮬레이션</h3>

        <div className="mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">LTV 비율</span>
            <span className="font-bold text-blue-600">{ltv}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={70}
            step={5}
            value={ltv}
            onChange={(e) => setLtv(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>70%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-gray-500 mb-1">대출금</p>
            <p className="text-base font-bold text-gray-900">{formatWon(loanAmount)}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-gray-500 mb-1">자기자본</p>
            <p className="text-base font-bold text-gray-900">{formatWon(equity)}</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-xs text-blue-600 mb-1">
            {yearsToHold}년 후 자기자본 수익률 (집값 연 {(annualPriceChangeRate * 100).toFixed(1)}% 상승 가정)
          </p>
          <p className="text-3xl font-bold text-blue-600">{roe.toFixed(1)}%</p>
          {ltv > 0 && (
            <p className="text-xs text-blue-500 mt-1">
              레버리지 효과: +{leverageEffect.toFixed(1)}%p (무대출 {baseRoe.toFixed(1)}% 대비)
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          * 이자 비용 미반영 단순 수익률 / 실제 수익은 대출이자 차감 필요
        </p>
      </div>
    </div>
  );
}
