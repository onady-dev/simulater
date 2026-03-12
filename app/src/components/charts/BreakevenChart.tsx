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
import { formatWon, formatRate, formatWonShort } from '@/lib/utils/format';
import type { BreakevenDataPoint } from '@/types';

interface Props {
  data: BreakevenDataPoint[];
  currentRate: number;
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
      <p className="font-semibold mb-2 text-gray-700">연 {formatRate(label ?? 0)} 상승</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {formatWon(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function BreakevenChart({ data, currentRate }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-800 mb-1">손익분기 분석</h3>
      <p className="text-xs text-gray-400 mb-4">주택가격 연간 변동률에 따른 순비용 변화</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="annualPriceChangeRate"
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
          />
          <YAxis
            tickFormatter={(v: number) => formatWonShort(v)}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <ReferenceLine
            x={currentRate}
            stroke="#9CA3AF"
            strokeDasharray="4 4"
            label={{ value: '현재', fill: '#6B7280', fontSize: 10, position: 'top' }}
          />
          <Line
            type="monotone"
            dataKey="buyNetCost"
            stroke="#3B82F6"
            name="매수"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="jeonseNetCost"
            stroke="#F59E0B"
            name="전세"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="monthlyRentNetCost"
            stroke="#A855F7"
            name="월세"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
