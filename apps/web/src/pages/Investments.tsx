import { useState } from 'react';
import Header from '../components/layout/Header';
import { useInvestmentConfig, useInvestmentProjection, useUpdateInvestmentConfig } from '../api/hooks/useInvestments';
import { useCurrency } from '../hooks/useCurrency';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Lightbulb, Settings, TrendingUp } from 'lucide-react';

export default function Investments() {
  const { formatCurrency } = useCurrency();
  const { data: config } = useInvestmentConfig();
  const { data: projection } = useInvestmentProjection();
  const updateConfig = useUpdateInvestmentConfig();
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    savingsPercentage: 50,
    expectedReturnRate: 12,
    projectionYears: 10,
  });

  const handleSaveConfig = () => {
    updateConfig.mutate(configForm, {
      onSuccess: () => setShowConfig(false),
    });
  };

  return (
    <div>
      <Header
        title="Investment Insights"
        subtitle="Plan your financial future"
        actions={
          <button
            onClick={() => {
              if (config) {
                setConfigForm({
                  savingsPercentage: config.savingsPercentage,
                  expectedReturnRate: config.expectedReturnRate,
                  projectionYears: config.projectionYears,
                });
              }
              setShowConfig(!showConfig);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings size={18} /> Configure
          </button>
        }
      />

      <div className="p-6">
        {/* Config panel */}
        {showConfig && (
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Investment Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  % of Savings to Invest
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={0}
                  max={100}
                  value={configForm.savingsPercentage}
                  onChange={(e) => setConfigForm({ ...configForm, savingsPercentage: +e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return (%)
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={0}
                  max={100}
                  step={0.5}
                  value={configForm.expectedReturnRate}
                  onChange={(e) => setConfigForm({ ...configForm, expectedReturnRate: +e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projection Years
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={1}
                  max={50}
                  value={configForm.projectionYears}
                  onChange={(e) => setConfigForm({ ...configForm, projectionYears: +e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={handleSaveConfig} className="btn-primary" disabled={updateConfig.isPending}>
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {/* Summary cards */}
        {projection && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-500">Monthly Savings</p>
              <p className={`text-2xl font-bold ${projection.monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(projection.monthlySavings)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Avg. over last 3 months</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Monthly Investment</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(projection.monthlyInvestment)}
              </p>
              <p className="text-xs text-gray-400 mt-1">{config?.savingsPercentage ?? 50}% of savings</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Projected Value ({config?.projectionYears ?? 10} yrs)</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  projection.projections?.[projection.projections.length - 1]?.totalValue ?? 0
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">At {config?.expectedReturnRate ?? 12}% annual return</p>
            </div>
          </div>
        )}

        {/* Projection chart */}
        {projection?.projections && (
          <div className="card mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              <TrendingUp className="inline mr-2" size={16} />
              Compound Growth Projection
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={projection.projections} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" label={{ value: 'Year', position: 'bottom' }} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'invested' ? 'Amount Invested' : name === 'returns' ? 'Returns' : 'Total Value',
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="invested"
                  name="Invested"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                />
                <Area
                  type="monotone"
                  dataKey="returns"
                  name="Returns"
                  stackId="1"
                  stroke="#10b981"
                  fill="#6ee7b7"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Allocation suggestion */}
        {projection?.allocation && (
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Suggested Allocation</h3>
              <div className="space-y-3">
                {Object.entries(projection.allocation.suggested).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(value as number)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Savings Rate: <span className="font-semibold">{projection.allocation.savingsRate}%</span>
                </p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" /> Tips & Insights
              </h3>
              <div className="space-y-3">
                {projection.allocation.tips.map((tip: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-primary-400 mt-0.5">&#8226;</span>
                    <p className="text-sm text-gray-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
