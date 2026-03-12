'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatWon, formatWonShort } from '@/lib/utils/format';
import type { CostBreakdown, JeonseCostBreakdown, MonthlyRentCostBreakdown } from '@/types';

interface Props {
  buyResult: CostBreakdown;
  jeonseResult: JeonseCostBreakdown;
  monthlyRentResult: MonthlyRentCostBreakdown;
  yearsToHold: number;
}

interface ChartDatum {
  name: string;
  value: number;
  color: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: ChartDatum;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{item.payload.name}</p>
      <p className="font-bold" style={{ color: item.payload.color }}>
        {formatWon(item.value)}
      </p>
    </div>
  );
}

export function ScenarioBarChart({ buyResult, jeonseResult, monthlyRentResult }: Props) {
  const data: ChartDatum[] = [
    { name: '매수', value: buyResult.netTotal, color: '#3B82F6' },
    { name: '전세', value: jeonseResult.netTotal, color: '#F59E0B' },
    { name: '월세', value: monthlyRentResult.netTotal, color: '#A855F7' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-800 mb-1">시나리오 순비용 비교</h3>
      <p className="text-xs text-gray-400 mb-4">세제혜택 차감 후 총 지출</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 13, fill: '#4B5563', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatWonShort(v)}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
