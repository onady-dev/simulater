import { z } from 'zod';

export const jeonseSchema = z.object({
  depositAmount: z.number().min(10_000_000, '최소 1천만원 이상').max(5_000_000_000),
  loanAmount: z.number().min(0).max(5_000_000_000),
  loanRate: z.number().min(0.001).max(0.3),
  insuranceProvider: z.enum(['none', 'hf', 'hug', 'sgi']),
  yearsToHold: z.number().int().min(1).max(30),
  expectedInvestmentReturn: z.number().min(0).max(0.5),
  annualIncome: z.number().min(0).max(10_000_000_000),
});

export type JeonseFormValues = z.infer<typeof jeonseSchema>;
