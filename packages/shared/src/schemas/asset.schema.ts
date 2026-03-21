import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(100),
  type: z.enum(['PROPERTY', 'VEHICLE', 'INVESTMENT', 'GOLD', 'CASH', 'CRYPTO', 'OTHER']),
  purchaseDate: z.string().optional(),
  purchaseValue: z.number().positive().optional(),
  currentValue: z.number().positive('Current value must be positive'),
  currency: z.string().default('INR'),
  description: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const recordAssetValueSchema = z.object({
  value: z.number().positive('Value must be positive'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type RecordAssetValueInput = z.infer<typeof recordAssetValueSchema>;
