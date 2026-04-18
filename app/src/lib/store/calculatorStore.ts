import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  CalculationResults,
  ScenarioKey,
  Recommendation,
  CalculationPhase,
} from '@/types';
import {
  DEFAULT_BUY_INPUTS,
  DEFAULT_JEONSE_INPUTS,
  DEFAULT_MONTHLY_RENT_INPUTS,
} from '@/lib/constants/defaults';
import { runAllCalculations } from '@/lib/calculations';
import { generateRecommendation } from '@/lib/calculations/recommendation';

const LOADING_DURATION_MS = 3000;

// persist 대상 외부에서 timer ID 관리 (persist에 포함되지 않도록)
let loadingTimer: ReturnType<typeof setTimeout> | null = null;

interface CalculatorState {
  buyInputs: BuyInputs;
  jeonseInputs: JeonseInputs;
  monthlyRentInputs: MonthlyRentInputs;
  results: CalculationResults | null;
  activeTab: ScenarioKey;
  recommendation: Recommendation | null;
  calculationPhase: CalculationPhase;

  updateBuyInputs: (partial: Partial<BuyInputs>) => void;
  updateJeonseInputs: (partial: Partial<JeonseInputs>) => void;
  updateMonthlyRentInputs: (partial: Partial<MonthlyRentInputs>) => void;
  calculate: () => void;
  startCalculation: () => void;
  resetAll: () => void;
  syncMonthlySavings: (savings: number) => void;
  setActiveTab: (tab: ScenarioKey) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  devtools(
    persist(
      (set, get) => ({
        buyInputs: DEFAULT_BUY_INPUTS,
        jeonseInputs: DEFAULT_JEONSE_INPUTS,
        monthlyRentInputs: DEFAULT_MONTHLY_RENT_INPUTS,
        results: null,
        activeTab: 'buy' as ScenarioKey,
        recommendation: null,
        calculationPhase: 'idle' as CalculationPhase,

        updateBuyInputs: (partial) => {
          set((s) => ({
            buyInputs: { ...s.buyInputs, ...partial },
            calculationPhase: 'idle',
            results: null,
            recommendation: null,
          }));
        },

        updateJeonseInputs: (partial) => {
          set((s) => ({
            jeonseInputs: { ...s.jeonseInputs, ...partial },
            calculationPhase: 'idle',
            results: null,
            recommendation: null,
          }));
        },

        updateMonthlyRentInputs: (partial) => {
          set((s) => ({
            monthlyRentInputs: { ...s.monthlyRentInputs, ...partial },
            calculationPhase: 'idle',
            results: null,
            recommendation: null,
          }));
        },

        calculate: () => {
          const { buyInputs, jeonseInputs, monthlyRentInputs } = get();
          const results = runAllCalculations(buyInputs, jeonseInputs, monthlyRentInputs);
          const recommendation = generateRecommendation(results, buyInputs, jeonseInputs, monthlyRentInputs);
          set({ results, recommendation });
        },

        startCalculation: () => {
          // 이전 타이머 취소 (중복 클릭 방지)
          if (loadingTimer !== null) {
            clearTimeout(loadingTimer);
            loadingTimer = null;
          }

          // 즉시 계산 실행 후 로딩 phase 시작
          get().calculate();
          set({ calculationPhase: 'loading' });

          loadingTimer = setTimeout(() => {
            set({ calculationPhase: 'result' });
            loadingTimer = null;
          }, LOADING_DURATION_MS);
        },

        resetAll: () => {
          if (loadingTimer !== null) {
            clearTimeout(loadingTimer);
            loadingTimer = null;
          }
          set({
            buyInputs: DEFAULT_BUY_INPUTS,
            jeonseInputs: DEFAULT_JEONSE_INPUTS,
            monthlyRentInputs: DEFAULT_MONTHLY_RENT_INPUTS,
            results: null,
            recommendation: null,
            calculationPhase: 'idle',
          });
        },

        setActiveTab: (tab) => set({ activeTab: tab }),

        syncMonthlySavings: (savings) => {
          set((s) => ({
            buyInputs: { ...s.buyInputs, monthlySavings: savings },
            jeonseInputs: { ...s.jeonseInputs, monthlySavings: savings },
            monthlyRentInputs: { ...s.monthlyRentInputs, monthlySavings: savings },
            calculationPhase: 'idle',
            results: null,
            recommendation: null,
          }));
        },
      }),
      {
        name: 'calculator-inputs',
        partialize: (state) => ({
          buyInputs: state.buyInputs,
          jeonseInputs: state.jeonseInputs,
          monthlyRentInputs: state.monthlyRentInputs,
          // calculationPhase는 persist 제외 — 항상 idle로 시작
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.calculationPhase = 'idle';
          }
        },
      },
    ),
    { name: 'CalculatorStore' },
  ),
);
