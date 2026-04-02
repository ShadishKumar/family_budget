import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  originalAmount: z.number().positive().optional(),
  originalCurrency: z.string().optional(),
  exchangeRate: z.number().positive().optional(),
  description: z.string().min(1, 'Description is required').max(500),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  type: z.enum(['INCOME', 'EXPENSE']),
  inputMethod: z.enum(['MANUAL', 'VOICE', 'OCR']).default('MANUAL'),
  categoryId: z.string().uuid(),
  receiptUrl: z.string().url().optional(),
  ocrRawText: z.string().optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().uuid().optional(),
  inputMethod: z.enum(['MANUAL', 'VOICE', 'OCR']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
