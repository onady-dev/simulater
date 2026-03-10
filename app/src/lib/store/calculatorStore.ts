import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  BuyInputs,
  JeonseInputs,
  MonthlyRentInputs,
  CalculationResults,
  ScenarioKey,
  InflationScenario,
  Recommendation,
} from '@/types';
import {
  DEFAULT_BUY_INPUTS,
  DEFAULT_JEONSE_INPUTS,
  DEFAULT_MONTHLY_RENT_INPUTS,
} from '@/lib/constants/defaults';
import { runAllCalculations } from '@/lib/calculations';
import { getInflationParameters } from '@/lib/calculations/inflation';
import { generateRecommendation } from '@/lib/calculations/recommendation';

interface CalculatorState {
  buyInputs: BuyInputs;
  jeonseInputs: JeonseInputs;
  monthlyRentInputs: MonthlyRentInputs;
  results: CalculationResults | null;
  activeTab: ScenarioKey;
  inflationScenario: InflationScenario;
  recommendation: Recommendation | null;

  updateBuyInputs: (partial: Partial<BuyInputs>) => void;
  updateJeonseInputs: (partial: Partial<JeonseInputs>) => void;
  updateMonthlyRentInputs: (partial: Partial<MonthlyRentInputs>) => void;
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
        recommendation: null,

        updateBuyInputs: (partial) => {
          // 사용자가 직접 변경한 필드에 플래그 설정
          const flags: Partial<BuyInputs> = {};
          if ('annualPriceChangeRate' in partial) flags.userSetPriceChangeRate = true;
          if ('loanRate' in partial) flags.userSetLoanRate = true;
          if ('expectedInvestmentReturn' in partial) flags.userSetInvestmentReturn = true;

          set((s) => ({ buyInputs: { ...s.buyInputs, ...partial, ...flags } }));
          get().calculate();
        },

        updateJeonseInputs: (partial) => {
          const flags: Partial<JeonseInputs> = {};
          if ('loanRate' in partial) flags.userSetLoanRate = true;
          if ('expectedInvestmentReturn' in partial) flags.userSetInvestmentReturn = true;

          set((s) => ({ jeonseInputs: { ...s.jeonseInputs, ...partial, ...flags } }));
          get().calculate();
        },

        updateMonthlyRentInputs: (partial) => {
          const flags: Partial<MonthlyRentInputs> = {};
          if ('expectedInvestmentReturn' in partial) flags.userSetInvestmentReturn = true;

          set((s) => ({ monthlyRentInputs: { ...s.monthlyRentInputs, ...partial, ...flags } }));
          get().calculate();
        },

        calculate: () => {
          const { buyInputs, jeonseInputs, monthlyRentInputs, inflationScenario } = get();

          // 인플레이션 시나리오 파라미터 적용 (사용자 직접 입력 시 해당 값 우선)
          const params = getInflationParameters(inflationScenario);

          const adjustedBuy: BuyInputs = {
            ...buyInputs,
            annualPriceChangeRate: buyInputs.userSetPriceChangeRate
              ? buyInputs.annualPriceChangeRate
              : params.housingPriceGrowth,
            loanRate: buyInputs.userSetLoanRate
              ? buyInputs.loanRate
              : params.loanInterestRate,
            expectedInvestmentReturn: buyInputs.userSetInvestmentReturn
              ? buyInputs.expectedInvestmentReturn
              : params.expectedInvestmentReturn,
          };

          const adjustedJeonse: JeonseInputs = {
            ...jeonseInputs,
            loanRate: jeonseInputs.userSetLoanRate
              ? jeonseInputs.loanRate
              : params.loanInterestRate,
            expectedInvestmentReturn: jeonseInputs.userSetInvestmentReturn
              ? jeonseInputs.expectedInvestmentReturn
              : params.expectedInvestmentReturn,
            rentGrowthRate: params.rentGrowthRate,
          };

          const adjustedRent: MonthlyRentInputs = {
            ...monthlyRentInputs,
            expectedInvestmentReturn: monthlyRentInputs.userSetInvestmentReturn
              ? monthlyRentInputs.expectedInvestmentReturn
              : params.expectedInvestmentReturn,
            rentGrowthRate: params.rentGrowthRate,
          };

          const results = runAllCalculations(adjustedBuy, adjustedJeonse, adjustedRent);
          const recommendation = generateRecommendation(inflationScenario, results, adjustedBuy);

          set({ results, recommendation });
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
          if (state) {
            setTimeout(() => state.calculate(), 0);
          }
        },
      },
    ),
    { name: 'CalculatorStore' },
  ),
);
