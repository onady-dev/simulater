'use client';

export function InflationScenarioSelector() {
  return (
    <div className="px-4 mb-3">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
        <p className="text-sm text-gray-700 font-medium mb-2">
          📊 모든 계산은 <strong>평균 인플레이션 기준</strong>으로 합니다
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 주택가격 상승률: 3%</li>
          <li>• 전월세 상승률: 5% (법정 상한)</li>
          <li>• 투자수익률: 3%</li>
        </ul>
      </div>
    </div>
  );
}
