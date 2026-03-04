import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  CalculationResults,
  ScenarioKey,
  InflationScenario,
  ScenarioComparison,
  Recommendation,
} from '@/types';
import {
  DEFAULT_BUY_INPUTS,
  DEFAULT_JEONSE_INPUTS,
  DEFAULT_MONTHLY_RENT_INPUTS,
} from '@/lib/constants/defaults';
import { runAllCalculations } from '@/lib/calculations';
import { getInflationParameters, compareInflationScenarios } from '@/lib/calculations/inflation';
import { generateRecommendation } from '@/lib/calculations/recommendation';

interface CalculatorState {
  buyInputs: BuyInputs;
  jeonseInputs: JeonseInputs;
  monthlyRentInputs: MonthlyRentInputs;
  results: CalculationResults | null;
  activeTab: ScenarioKey;
  inflationScenario: InflationScenario;
  scenarioComparisons: ScenarioComparison[] | null;
  recommendation: Recommendation | null;

  updateBuyInputs: (partial: Partial<BuyInputs>) => void;
  updateJeonseInputs: (partial: Partial<JeonseInputs>) => void;
  updateMonthlyRentInputs: (partial: Partial<MonthlyRentInputs>) => void;
  setInflationScenario: (scenario: InflationScenario) => void;
  calculate: () => void;
  resetAll: () => void;
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
        inflationScenario: 'medium' as InflationScenario,
        scenarioComparisons: null,
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

        setInflationScenario: (scenario) => {
          set({ inflationScenario: scenario });
          get().calculate();
        },

        calculate: () => {
          const { buyInputs, jeonseInputs, monthlyRentInputs, inflationScenario } = get();

          // 인플레이션 시나리오 파라미터 적용
          const params = getInflationParameters(inflationScenario);
          const adjustedBuy: BuyInputs = {
            ...buyInputs,
            annualPriceChangeRate: params.housingPriceGrowth,
            loanRate: params.loanInterestRate,
            expectedInvestmentReturn: params.expectedInvestmentReturn,
          };
          const adjustedJeonse: JeonseInputs = {
            ...jeonseInputs,
            loanRate: params.loanInterestRate,
            expectedInvestmentReturn: params.expectedInvestmentReturn,
          };
          const adjustedRent: MonthlyRentInputs = {
            ...monthlyRentInputs,
            expectedInvestmentReturn: params.expectedInvestmentReturn,
          };

          const results = runAllCalculations(adjustedBuy, adjustedJeonse, adjustedRent);
          const scenarioComparisons = compareInflationScenarios(buyInputs, jeonseInputs, monthlyRentInputs);
          const recommendation = generateRecommendation(inflationScenario, results, adjustedBuy);

          set({ results, scenarioComparisons, recommendation });
        },

        resetAll: () => {
          set({
            buyInputs: DEFAULT_BUY_INPUTS,
            jeonseInputs: DEFAULT_JEONSE_INPUTS,
            monthlyRentInputs: DEFAULT_MONTHLY_RENT_INPUTS,
            inflationScenario: 'medium',
          });
          get().calculate();
        },

        setActiveTab: (tab) => set({ activeTab: tab }),
      }),
      {
        name: 'calculator-inputs',
        partialize: (state) => ({
          buyInputs: state.buyInputs,
          jeonseInputs: state.jeonseInputs,
          monthlyRentInputs: state.monthlyRentInputs,
          inflationScenario: state.inflationScenario,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) state.calculate();
        },
      },
    ),
    { name: 'CalculatorStore' },
  ),
);
