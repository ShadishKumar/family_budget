import { z } from 'zod';

export const investmentConfigSchema = z.object({
  savingsPercentage: z.number().min(0).max(100),
  expectedReturnRate: z.number().min(0).max(100),
  projectionYears: z.number().int().min(1).max(50).default(10),
});

export type InvestmentConfigInput = z.infer<typeof investmentConfigSchema>;
