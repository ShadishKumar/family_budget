import { useState } from 'react';
import Header from '../components/layout/Header';
import AssetForm from '../components/assets/AssetForm';
import { useAssets, useNetWorth, useDeleteAsset } from '../api/hooks/useAssets';
import { formatCurrency, formatDate } from '@family-budget/shared';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const typeLabels: Record<string, string> = {
  PROPERTY: 'Property',
  VEHICLE: 'Vehicle',
  INVESTMENT: 'Investment',
  GOLD: 'Gold',
  CASH: 'Cash',
  CRYPTO: 'Crypto',
  OTHER: 'Other',
};

const typeColors: Record<string, string> = {
  PROPERTY: 'bg-amber-100 text-amber-700',
  VEHICLE: 'bg-blue-100 text-blue-700',
  INVESTMENT: 'bg-green-100 text-green-700',
  GOLD: 'bg-yellow-100 text-yellow-700',
  CASH: 'bg-emerald-100 text-emerald-700',
  CRYPTO: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export default function Assets() {
  const [showForm, setShowForm] = useState(false);
  const { data: assets = [] } = useAssets();
  const { data: netWorth } = useNetWorth();
  const deleteAsset = useDeleteAsset();

  return (
    <div>
      <Header
        title="Assets"
        subtitle="Track your family's wealth"
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Asset
          </button>
        }
      />

      <div className="p-6">
        {/* Net worth card */}
        <div className="card mb-6">
          <p className="text-sm text-gray-500">Total Net Worth</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(netWorth?.totalAssets ?? 0)}
          </p>
          {netWorth?.assetsByType && (
            <div className="flex gap-4 mt-4">
              {netWorth.assetsByType.map((item: { type: string; total: number; count: number }) => (
                <div key={item.type} className="text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[item.type] ?? 'bg-gray-100'}`}>
                    {typeLabels[item.type] ?? item.type}
                  </span>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Asset list */}
        <div className="space-y-3">
          {(assets as Array<{
            id: string;
            name: string;
            type: string;
            currentValue: number;
            purchaseValue?: number;
            purchaseDate?: string;
            description?: string;
          }>).map((asset) => {
            const gain = asset.purchaseValue
              ? Number(asset.currentValue) - Number(asset.purchaseValue)
              : null;
            const gainPercent = asset.purchaseValue && Number(asset.purchaseValue) > 0
              ? (gain! / Number(asset.purchaseValue)) * 100
              : null;

            return (
              <div key={asset.id} className="card flex items-center gap-4">
                <div>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${typeColors[asset.type] ?? 'bg-gray-100'}`}>
                    {typeLabels[asset.type] ?? asset.type}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{asset.name}</p>
                  {asset.description && <p className="text-sm text-gray-500">{asset.description}</p>}
                  {asset.purchaseDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Purchased: {formatDate(asset.purchaseDate)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(Number(asset.currentValue))}</p>
                  {gain !== null && (
                    <div className={`flex items-center gap-1 justify-end text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{formatCurrency(gain)} ({gainPercent?.toFixed(1)}%)</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteAsset.mutate(asset.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          {(assets as unknown[]).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No assets tracked yet</p>
              <p className="text-sm mt-1">Add your first asset to start tracking your net worth</p>
            </div>
          )}
        </div>
      </div>

      {showForm && <AssetForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
