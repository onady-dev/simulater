'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { formatWon } from '@/lib/utils/format';
import type { AssetProjectionPoint } from '@/types';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}년 후</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <span className="font-semibold">{formatWon(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function AssetProjectionChart() {
  const results = useCalculatorStore((s) => s.results);
  const yearsToHold = useCalculatorStore((s) => s.buyInputs.yearsToHold);
  const investmentRate = useCalculatorStore((s) => s.jeonseInputs.expectedInvestmentReturn);

  if (!results) return null;

  const data: AssetProjectionPoint[] = results.assetProjectionSeries;

  return (
    <div className="px-4">
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">순자산 변화 시뮬레이션</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          투자수익률 {(investmentRate * 100).toFixed(0)}% 가정 · 초기 보유현금 = 매수 자기자본 기준
        </p>

        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="year"
                tickFormatter={(v: number) => `${v}년`}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
              />
              <YAxis
                tickFormatter={(v: number) => `${(v / 100_000_000).toFixed(1)}억`}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                width={42}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={yearsToHold} stroke="#D1D5DB" strokeDasharray="4 2" />
              <Line
                type="monotone"
                dataKey="buyNetAsset"
                stroke="#3182F6"
                name="매수"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="jeonseNetAsset"
                stroke="#F59E0B"
                name="전세"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="monthlyRentNetAsset"
                stroke="#00B493"
                name="월세"
                strokeWidth={2.5}
                dot={false}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          * 실제 자산은 투자수익률·집값 변동에 따라 크게 달라질 수 있습니다
        </p>
      </div>
    </div>
  );
}
