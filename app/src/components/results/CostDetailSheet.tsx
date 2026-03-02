'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatWon } from '@/lib/utils/format';
import type { CostBreakdown, JeonseCostBreakdown, MonthlyRentCostBreakdown, ScenarioKey } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scenario: ScenarioKey;
  buyResult: CostBreakdown;
  jeonseResult: JeonseCostBreakdown;
  monthlyRentResult: MonthlyRentCostBreakdown;
  yearsToHold: number;
}

const LABELS: Record<ScenarioKey, string> = {
  buy: '매수',
  jeonse: '전세',
  monthlyRent: '월세',
};

const COLORS: Record<ScenarioKey, string> = {
  buy: '#3182F6',
  jeonse: '#F59E0B',
  monthlyRent: '#00B493',
};

interface CostRow {
  label: string;
  value: number;
  isSubItem?: boolean;
  isNegative?: boolean;
}

function BuyCostRows({ result, yearsToHold }: { result: CostBreakdown; yearsToHold: number }): CostRow[] {
  return [
    { label: '초기 비용', value: result.initialCosts.total },
    { label: '취득세', value: result.initialCosts.acquisitionTax, isSubItem: true },
    { label: '중개수수료', value: result.initialCosts.agentFee, isSubItem: true },
    { label: '법무사 / 등기비용', value: result.initialCosts.legalFee + result.initialCosts.registrationTax + result.initialCosts.stampDuty, isSubItem: true },
    { label: '채권할인비용', value: result.initialCosts.bondDiscount, isSubItem: true },
    { label: `연간 보유비용 × ${yearsToHold}년`, value: result.annualHoldingCosts.total * yearsToHold },
    { label: '대출이자 (연)', value: result.annualHoldingCosts.loanInterest, isSubItem: true },
    { label: '재산세 (연)', value: result.annualHoldingCosts.propertyTax, isSubItem: true },
    { label: '관리비 (연)', value: result.annualHoldingCosts.maintenanceFee, isSubItem: true },
    { label: '처분 비용', value: result.disposalCosts.total },
    { label: '양도소득세', value: result.disposalCosts.capitalGainsTax, isSubItem: true },
    { label: '매도 중개수수료', value: result.disposalCosts.agentFee, isSubItem: true },
    { label: '자기자본 기회비용', value: result.opportunityCost },
    { label: '세제혜택', value: result.taxBenefits.total, isNegative: true },
  ];
}

function JeonseCostRows({ result }: { result: JeonseCostBreakdown }): CostRow[] {
  return [
    { label: '초기 비용', value: result.initialCosts.total },
    { label: '중개수수료', value: result.initialCosts.agentFee, isSubItem: true },
    { label: '전세보증보험', value: result.initialCosts.insurancePremium, isSubItem: true },
    { label: '기간 비용', value: result.periodicCosts.total },
    { label: '전세대출 이자', value: result.periodicCosts.loanInterest, isSubItem: true },
    { label: '기회비용', value: result.periodicCosts.opportunityCost, isSubItem: true },
    { label: '세제혜택 (소득공제)', value: result.taxBenefits.total, isNegative: true },
  ];
}

function RentCostRows({ result }: { result: MonthlyRentCostBreakdown }): CostRow[] {
  return [
    { label: '초기 비용', value: result.initialCosts.total },
    { label: '중개수수료', value: result.initialCosts.agentFee, isSubItem: true },
    { label: '기간 비용', value: result.periodicCosts.total },
    { label: '총 월세', value: result.periodicCosts.totalRentPaid, isSubItem: true },
    { label: '기회비용', value: result.periodicCosts.opportunityCost, isSubItem: true },
    { label: '세제혜택 (세액공제)', value: result.taxBenefits.total, isNegative: true },
  ];
}

export function CostDetailSheet({
  isOpen,
  onClose,
  scenario,
  buyResult,
  jeonseResult,
  monthlyRentResult,
  yearsToHold,
}: Props) {
  const color = COLORS[scenario];
  const label = LABELS[scenario];

  const summaryValue =
    scenario === 'buy'
      ? buyResult.effectiveCost
      : scenario === 'jeonse'
        ? jeonseResult.netTotal
        : monthlyRentResult.netTotal;

  const summaryLabel = scenario === 'buy' ? '실질 주거비' : '순비용 합계';

  const rows: CostRow[] =
    scenario === 'buy'
      ? BuyCostRows({ result: buyResult, yearsToHold })
      : scenario === 'jeonse'
        ? JeonseCostRows({ result: jeonseResult })
        : RentCostRows({ result: monthlyRentResult });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="relative bg-white rounded-t-3xl pb-10 max-h-[80vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            <div className="sticky top-0 bg-white px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold" style={{ color }}>
                  {label} 비용 상세
                </h2>
                <button onClick={onClose} className="text-gray-400 text-2xl leading-none">
                  ×
                </button>
              </div>
            </div>

            <div className="px-5 pt-4 space-y-1">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-2 ${
                    row.isSubItem ? 'pl-4' : 'border-b border-gray-100'
                  }`}
                >
                  <span
                    className={`text-sm ${
                      row.isSubItem ? 'text-gray-500' : 'font-semibold text-gray-800'
                    }`}
                  >
                    {row.isSubItem ? '└ ' : ''}{row.label}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      row.isNegative ? 'text-emerald-500' : row.isSubItem ? 'text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {row.isNegative ? '-' : ''}{formatWon(row.value)}
                  </span>
                </div>
              ))}

              {scenario === 'buy' && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">총 지출 비용</span>
                    <span className="text-gray-800 font-medium">{formatWon(buyResult.netTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-600">시세 상승 이익</span>
                    <span className="text-emerald-600 font-medium">-{formatWon(buyResult.assetGain.priceGain)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>예상 시세</span>
                    <span>{formatWon(buyResult.assetGain.finalPropertyValue)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 mt-4">
                <span className="font-bold text-gray-900">{summaryLabel}</span>
                <span className="text-xl font-bold" style={{ color }}>
                  {formatWon(summaryValue)}
                </span>
              </div>

              <p className="text-xs text-gray-400 pt-2">
                * 공시가격은 시세의 70% 근사치 적용 | 세제혜택 금액은 추정치입니다
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
