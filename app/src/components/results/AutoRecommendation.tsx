'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';

const LABELS: Record<string, string> = { buy: '매수', jeonse: '전세', monthlyRent: '월세' };

export function AutoRecommendation() {
  const recommendation = useCalculatorStore((s) => s.recommendation);

  if (!recommendation) return null;

  return (
    <div className="mx-4 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💡</span>
        <h3 className="text-base font-bold">추천 결과</h3>
      </div>

      <div className="bg-white/20 rounded-2xl p-3 mb-3">
        <p className="text-xs opacity-80 mb-0.5">최적 선택</p>
        <p className="text-2xl font-bold">{LABELS[recommendation.primary]}</p>
        <p className="text-xs opacity-80 mt-0.5">
          차선: {LABELS[recommendation.secondary]}
        </p>
      </div>

      <div className="space-y-1.5 mb-3">
        {recommendation.reasoning.map((reason, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-yellow-300 shrink-0">•</span>
            <p className="text-sm opacity-95">{reason}</p>
          </div>
        ))}
      </div>

      {recommendation.leverageAdvice && (
        <div className="bg-white/10 rounded-xl p-3 mb-3">
          <p className="text-xs opacity-80 mb-1">💰 레버리지 전략</p>
          <p className="text-sm font-medium">{recommendation.leverageAdvice}</p>
        </div>
      )}

      {recommendation.warnings.length > 0 && (
        <div className="bg-yellow-500/20 rounded-xl p-3">
          <p className="text-xs font-bold mb-1.5">⚠️ 주의사항</p>
          {recommendation.warnings.map((warning, i) => (
            <p key={i} className="text-xs opacity-90 mt-1">• {warning}</p>
          ))}
        </div>
      )}
    </div>
  );
}
