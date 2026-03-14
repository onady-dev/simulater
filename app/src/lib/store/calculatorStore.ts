import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  CalculationResults,
  ScenarioKey,
  Recommendation,
} from '@/types';
import {
  DEFAULT_BUY_INPUTS,
  DEFAULT_JEONSE_INPUTS,
  DEFAULT_MONTHLY_RENT_INPUTS,
} from '@/lib/constants/defaults';
import { runAllCalculations } from '@/lib/calculations';
import { generateRecommendation } from '@/lib/calculations/recommendation';

interface CalculatorState {
  buyInputs: BuyInputs;
  jeonseInputs: JeonseInputs;
  monthlyRentInputs: MonthlyRentInputs;
  results: CalculationResults | null;
  activeTab: ScenarioKey;
  recommendation: Recommendation | null;

  updateBuyInputs: (partial: Partial<BuyInputs>) => void;
  updateJeonseInputs: (partial: Partial<JeonseInputs>) => void;
  updateMonthlyRentInputs: (partial: Partial<MonthlyRentInputs>) => void;
  calculate: () => void;
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

        updateBuyInputs: (partial) => {
          set((s) => ({ buyInputs: { ...s.buyInputs, ...partial } }));
          get().calculate();
        },

        updateJeonseInputs: (partial) => {
          set((s) => ({ jeonseInputs: { ...s.jeonseInputs, ...partial } }));
          get().calculate();
        },

        updateMonthlyRentInputs: (partial) => {
          set((s) => ({ monthlyRentInputs: { ...s.monthlyRentInputs, ...partial } }));
          get().calculate();
        },

        calculate: () => {
          const { buyInputs, jeonseInputs, monthlyRentInputs } = get();

          const results = runAllCalculations(buyInputs, jeonseInputs, monthlyRentInputs);
          const recommendation = generateRecommendation(results, buyInputs, jeonseInputs, monthlyRentInputs);

          set({ results, recommendation });
        },

        resetAll: () => {
          set({
            buyInputs: DEFAULT_BUY_INPUTS,
            jeonseInputs: DEFAULT_JEONSE_INPUTS,
            monthlyRentInputs: DEFAULT_MONTHLY_RENT_INPUTS,
          });
          get().calculate();
        },

        setActiveTab: (tab) => set({ activeTab: tab }),

        syncMonthlySavings: (savings) => {
          set((s) => ({
            buyInputs: { ...s.buyInputs, monthlySavings: savings },
            jeonseInputs: { ...s.jeonseInputs, monthlySavings: savings },
            monthlyRentInputs: { ...s.monthlyRentInputs, monthlySavings: savings },
          }));
          get().calculate();
        },
      }),
      {
        name: 'calculator-inputs',
        partialize: (state) => ({
          buyInputs: state.buyInputs,
          jeonseInputs: state.jeonseInputs,
          monthlyRentInputs: state.monthlyRentInputs,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            setTimeout(() => state.calculate(), 0);
          }
        },
      },
    ),
    { name: 'CalculatorStore' },
  ),
);
