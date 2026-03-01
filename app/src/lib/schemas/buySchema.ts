import { z } from 'zod';

export const buySchema = z.object({
  purchasePrice: z.number().min(10_000_000, '최소 1천만원 이상').max(10_000_000_000),
  areaM2: z.number().min(10).max(500),
  numHomes: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  loanAmount: z.number().min(0).max(5_000_000_000),
  loanRate: z.number().min(0.001).max(0.3),
  loanType: z.enum(['equal_payment', 'equal_principal', 'bullet']),
  yearsToHold: z.number().int().min(1).max(30),
  annualPriceChangeRate: z.number().min(-0.3).max(0.5),
  annualIncome: z.number().min(0).max(10_000_000_000),
  isFirstHomeBuyer: z.boolean(),
  isRegulatedZone: z.boolean(),
});

export type BuyFormValues = z.infer<typeof buySchema>;
