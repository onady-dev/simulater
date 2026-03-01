import { z } from 'zod';

export const monthlyRentSchema = z.object({
  depositAmount: z.number().min(0).max(5_000_000_000),
  monthlyRent: z.number().min(10_000, '최소 1만원 이상').max(100_000_000),
  yearsToHold: z.number().int().min(1).max(30),
  expectedInvestmentReturn: z.number().min(0).max(0.5),
  annualIncome: z.number().min(0).max(10_000_000_000),
  areaM2: z.number().min(10).max(500),
  marketPrice: z.number().min(0).max(10_000_000_000),
});

export type MonthlyRentFormValues = z.infer<typeof monthlyRentSchema>;
