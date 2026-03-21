import Header from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';
import { CURRENCIES } from '@family-budget/shared';

export default function Settings() {
  const { user, currency, setCurrency } = useAuthStore();

  return (
    <div>
      <Header title="Settings" subtitle="Manage your preferences" />

      <div className="p-6 max-w-2xl space-y-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <select
              className="input-field w-48"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Data</h3>
          <div className="space-y-3">
            <button className="btn-secondary">Export All Data (CSV)</button>
            <p className="text-xs text-gray-400">
              Download all your transactions, assets, and settings as CSV files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
