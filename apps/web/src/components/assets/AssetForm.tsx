import { useState } from 'react';
import { useCreateAsset } from '../../api/hooks/useAssets';
import { AssetType } from '@family-budget/shared';
import { X } from 'lucide-react';

interface AssetFormProps {
  onClose: () => void;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'PROPERTY', label: 'Property' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'CASH', label: 'Cash / Savings' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'OTHER', label: 'Other' },
];

export default function AssetForm({ onClose }: AssetFormProps) {
  const createAsset = useCreateAsset();
  const [form, setForm] = useState({
    name: '',
    type: 'PROPERTY' as AssetType,
    purchaseDate: '',
    purchaseValue: '',
    currentValue: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset.mutate(
      {
        name: form.name,
        type: form.type,
        currency: 'INR',
        purchaseDate: form.purchaseDate || undefined,
        purchaseValue: form.purchaseValue ? parseFloat(form.purchaseValue) : undefined,
        currentValue: parseFloat(form.currentValue),
        description: form.description || undefined,
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Add Asset</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., House in Chennai"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}
            >
              {assetTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Value</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="Optional"
                value={form.purchaseValue}
                onChange={(e) => setForm({ ...form, purchaseValue: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={form.currentValue}
                onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
            <input
              type="date"
              className="input-field"
              value={form.purchaseDate}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={createAsset.isPending}>
              {createAsset.isPending ? 'Saving...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
