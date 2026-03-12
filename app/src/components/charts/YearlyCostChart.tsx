'use client';

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
import { formatWonShort, formatWon } from '@/lib/utils/format';
import type { YearlyCostDataPoint } from '@/types';

interface Props {
  data: YearlyCostDataPoint[];
  currentYear: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold mb-2 text-gray-700">{label}년차</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {formatWon(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function YearlyCostChart({ data, currentYear }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-800 mb-4">연도별 누적 비용 추이</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="year"
            tickFormatter={(v: number) => `${v}년`}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
          />
          <YAxis
            tickFormatter={(v: number) => formatWonShort(v)}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
          />
          <ReferenceLine
            x={currentYear}
            stroke="#9CA3AF"
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="buyCumulative"
            stroke="#3B82F6"
            name="매수"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="jeonseCumulative"
            stroke="#F59E0B"
            name="전세"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="monthlyRentCumulative"
            stroke="#A855F7"
            name="월세"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
