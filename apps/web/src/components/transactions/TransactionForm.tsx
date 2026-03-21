import { useState } from 'react';
import { useCategories } from '../../api/hooks/useCategories';
import { useCreateTransaction } from '../../api/hooks/useTransactions';
import { CreateTransactionInput, TransactionType, Category } from '@family-budget/shared';
import VoiceInput from './VoiceInput';
import ReceiptScanner from './ReceiptScanner';
import { Mic, Camera, X } from 'lucide-react';

interface TransactionFormProps {
  onClose: () => void;
  initialData?: Partial<CreateTransactionInput>;
}

export default function TransactionForm({ onClose, initialData }: TransactionFormProps) {
  const { data: categories = [] } = useCategories();
  const createTransaction = useCreateTransaction();

  const [form, setForm] = useState<Partial<CreateTransactionInput>>({
    amount: undefined,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    categoryId: '',
    inputMethod: 'MANUAL',
    notes: '',
    ...initialData,
  });

  const [showVoice, setShowVoice] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const filteredCategories = (categories as Category[]).filter(
    (c) => c.type === form.type
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.categoryId || !form.date) return;

    createTransaction.mutate(form as CreateTransactionInput, {
      onSuccess: () => onClose(),
    });
  };

  const handleVoiceResult = (data: { amount?: number; description?: string; type?: TransactionType }) => {
    setForm((prev) => ({
      ...prev,
      ...(data.amount && { amount: data.amount }),
      ...(data.description && { description: data.description }),
      ...(data.type && { type: data.type }),
      inputMethod: 'VOICE',
    }));
    setShowVoice(false);
  };

  const handleScanResult = (data: {
    merchantName?: string;
    totalAmount?: number;
    date?: string;
    suggestedCategory?: string;
  }) => {
    const matchedCategory = (categories as Category[]).find(
      (c) => c.name === data.suggestedCategory
    );
    setForm((prev) => ({
      ...prev,
      ...(data.totalAmount && { amount: data.totalAmount }),
      ...(data.merchantName && { description: data.merchantName }),
      ...(data.date && { date: data.date }),
      ...(matchedCategory && { categoryId: matchedCategory.id }),
      inputMethod: 'OCR',
    }));
    setShowScanner(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Add Transaction</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoice(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              title="Voice input"
            >
              <Mic size={20} />
            </button>
            <button
              onClick={() => setShowScanner(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              title="Scan receipt"
            >
              <Camera size={20} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <X size={20} />
            </button>
          </div>
        </div>

        {showVoice && <VoiceInput onResult={handleVoiceResult} onClose={() => setShowVoice(false)} />}
        {showScanner && <ReceiptScanner onResult={handleScanResult} onClose={() => setShowScanner(false)} />}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(['EXPENSE', 'INCOME'] as TransactionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, type, categoryId: '' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.type === type
                    ? type === 'EXPENSE'
                      ? 'bg-red-50 text-red-700 border-2 border-red-200'
                      : 'bg-green-50 text-green-700 border-2 border-green-200'
                    : 'bg-gray-50 text-gray-500 border-2 border-transparent'
                }`}
              >
                {type === 'EXPENSE' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#8377;</span>
              <input
                type="number"
                step="0.01"
                className="input-field pl-8"
                placeholder="0.00"
                value={form.amount ?? ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || undefined })}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              className="input-field"
              placeholder="What was this for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="input-field"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Additional details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
