import { Landmark } from 'lucide-react';
import { formatCurrency } from '@family-budget/shared';

interface NetWorthWidgetProps {
  totalAssets: number;
  assetsByType: { type: string; total: number; count: number }[];
}

const typeLabels: Record<string, string> = {
  PROPERTY: 'Property',
  VEHICLE: 'Vehicles',
  INVESTMENT: 'Investments',
  GOLD: 'Gold',
  CASH: 'Cash',
  CRYPTO: 'Crypto',
  OTHER: 'Other',
};

export default function NetWorthWidget({ totalAssets, assetsByType }: NetWorthWidgetProps) {
  return (
    <div className="card h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Net Worth</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Landmark className="text-primary-600" size={20} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAssets)}</p>
      </div>

      <div className="space-y-2">
        {assetsByType.map((item) => (
          <div key={item.type} className="flex justify-between text-sm">
            <span className="text-gray-500">{typeLabels[item.type] ?? item.type} ({item.count})</span>
            <span className="font-medium text-gray-700">{formatCurrency(item.total)}</span>
          </div>
        ))}
        {assetsByType.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-2">No assets tracked yet</p>
        )}
      </div>
    </div>
  );
}
