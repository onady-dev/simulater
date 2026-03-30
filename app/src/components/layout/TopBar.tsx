'use client';

import { useCalculatorStore } from '@/lib/store/calculatorStore';

export function TopBar() {
  const resetAll = useCalculatorStore((s) => s.resetAll);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-base font-bold text-gray-900">집사요말아요</h1>
        <p className="text-xs text-gray-500">월세vs전세vs매매 데이터로 비교 추천 해드림</p>
        <button
          onClick={resetAll}
          className="text-sm text-blue-500 font-medium active:opacity-70 transition-opacity"
        >
          초기화
        </button>
      </div>
    </header>
  );
}
