import { useState } from 'react';
import Header from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';
import { CURRENCIES } from '@family-budget/shared';
import { useChangePassword } from '../api/hooks/useAuth';

export default function Settings() {
  const { user, currency, setCurrency } = useAuthStore();
  const changePassword = useChangePassword();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters');
      return;
    }

    changePassword.mutate(
      { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
      {
        onSuccess: () => {
          setPwSuccess('Password changed successfully');
          setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (err: any) => {
          setPwError(err?.response?.data?.error ?? 'Failed to change password');
        },
      }
    );
  }

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
          <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="input-field w-full"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="input-field w-full"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="input-field w-full"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
            </div>
            {pwError && <p className="text-sm text-red-600">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-green-600">{pwSuccess}</p>}
            <button
              type="submit"
              className="btn-primary"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
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
