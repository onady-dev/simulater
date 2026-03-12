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
import { checkAffordability } from '@/lib/calculations/breakeven';
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
  const buyInputs = useCalculatorStore((s) => s.buyInputs);
  const jeonseInputs = useCalculatorStore((s) => s.jeonseInputs);
  const monthlyRentInputs = useCalculatorStore((s) => s.monthlyRentInputs);

  if (!results) return null;

  const buyAffordability = checkAffordability('buy', buyInputs, buyInputs.monthlySavings);
  const jeonseAffordability = checkAffordability('jeonse', jeonseInputs, jeonseInputs.monthlySavings);
  const rentAffordability = checkAffordability('monthlyRent', monthlyRentInputs, monthlyRentInputs.monthlySavings);

  const data: AssetProjectionPoint[] = results.assetProjectionSeries;

  // Y축 범위: 데이터 최솟값~최댓값에 10% 여백 추가
  const allValues = data.flatMap((d) => [d.buyNetAsset, d.jeonseNetAsset, d.monthlyRentNetAsset]);
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const padding = (dataMax - dataMin) * 0.15 || 100_000_000;
  const yMin = Math.floor((dataMin - padding) / 100_000_000) * 100_000_000;
  const yMax = Math.ceil((dataMax + padding) / 100_000_000) * 100_000_000;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">순자산 변화 시뮬레이션</h3>
      <p className="text-xs text-gray-400 mt-0.5">
        투자수익률 {(investmentRate * 100).toFixed(0)}% 가정 · 보유 자산 기준
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
              tickFormatter={(v: number) => `${(v / 100_000_000).toFixed(0)}억`}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              width={42}
              domain={[yMin, yMax]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={yearsToHold} stroke="#D1D5DB" strokeDasharray="4 2" />
            <Line
              type="monotone"
              dataKey="buyNetAsset"
              stroke="#3B82F6"
              name="매수"
              strokeWidth={2.5}
              strokeDasharray={!buyAffordability.isAffordable ? "5 5" : "0"}
              opacity={!buyAffordability.isAffordable ? 0.5 : 1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="jeonseNetAsset"
              stroke="#F59E0B"
              name="전세"
              strokeWidth={2.5}
              strokeDasharray={!jeonseAffordability.isAffordable ? "5 5" : "0"}
              opacity={!jeonseAffordability.isAffordable ? 0.5 : 1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="monthlyRentNetAsset"
              stroke="#A855F7"
              name="월세"
              strokeWidth={2.5}
              strokeDasharray={!rentAffordability.isAffordable ? "5 5" : "0"}
              opacity={!rentAffordability.isAffordable ? 0.5 : 1}
              dot={false}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {(!buyAffordability.isAffordable || !jeonseAffordability.isAffordable || !rentAffordability.isAffordable) && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-700 font-medium mb-1">⚠️ 월 지출 초과 시나리오</p>
          <ul className="text-xs text-red-600 space-y-0.5">
            {!buyAffordability.isAffordable && <li>• 매수: 점선으로 표시 (월 지출이 저축액 초과)</li>}
            {!jeonseAffordability.isAffordable && <li>• 전세: 점선으로 표시 (월 지출이 저축액 초과)</li>}
            {!rentAffordability.isAffordable && <li>• 월세: 점선으로 표시 (월 지출이 저축액 초과)</li>}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        * 실제 자산은 투자수익률·집값 변동에 따라 크게 달라질 수 있습니다
      </p>
    </div>
  );
}
