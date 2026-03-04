'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useCalculatorStore } from '@/lib/store/calculatorStore';
import { formatWon } from '@/lib/utils/format';

const SCENARIO_LABELS: Record<string, string> = { low: '저', medium: '중', high: '고' };

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}인플레이션</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <span className="font-semibold">{formatWon(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function ScenarioComparisonChart() {
  const scenarioComparisons = useCalculatorStore((s) => s.scenarioComparisons);

  if (!scenarioComparisons) return null;

  const data = scenarioComparisons.map((c) => ({
    scenario: SCENARIO_LABELS[c.scenario],
    매수: c.realAssetValue.buy,
    전세: c.realAssetValue.jeonse,
    월세: c.realAssetValue.monthlyRent,
  }));

  return (
    <div className="px-4 mb-4">
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">인플레이션 시나리오별 비교</h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-4">실질 순자산 (인플레이션 조정 후)</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="scenario"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickFormatter={(v: string) => `${v}인플`}
              />
              <YAxis
                tickFormatter={(v: number) => `${(v / 100_000_000).toFixed(1)}억`}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                width={42}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="매수" fill="#3182F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="전세" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="월세" fill="#00B493" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * 현재 입력값 기준, 인플레이션 시나리오별 파라미터 자동 적용
        </p>
      </div>
    </div>
  );
}
