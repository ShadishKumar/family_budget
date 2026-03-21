export type AssetType = 'PROPERTY' | 'VEHICLE' | 'INVESTMENT' | 'GOLD' | 'CASH' | 'CRYPTO' | 'OTHER';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  purchaseDate?: string;
  purchaseValue?: number;
  currentValue: number;
  currency: string;
  description?: string;
  metadata?: Record<string, unknown>;
  familyId: string;
  valueHistory?: AssetValueHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetValueHistory {
  id: string;
  value: number;
  date: string;
  assetId: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiquid: number;
  assetsByType: { type: AssetType; total: number; count: number }[];
  history: { date: string; totalValue: number }[];
}
