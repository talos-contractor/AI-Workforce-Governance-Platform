import { useState } from 'react';
import { Card, StatusBadge, ProgressBar } from '../components/ui';
import { mockCostByTenant } from '@/data';

export default function Costs() {
  const [period, setPeriod] = useState('month');
  
  const totalBudget = 10000;
  const currentSpend = 3083.25;
  const projected = 6450;
  const percentUsed = (currentSpend / totalBudget) * 100;

  const providers = [
    { name: 'OpenAI', budget: 5000, used: 1892.50, status: 'green' as const },
    { name: 'Anthropic', budget: 3000, used: 823.45, status: 'green' as const },
    { name: 'OpenRouter', budget: 2000, used: 367.30, status: 'green' as const },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cost Management</h2>
        <p className="text-gray-500 dark:text-gray-400">Track and manage AI spending</p>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-4 mb-6">
        {['day', 'week', 'month'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded transition-colors ${period === p ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'}`}
          >
            This {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Spend</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${currentSpend.toLocaleString()}</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentUsed}%` }} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{percentUsed.toFixed(1)}% used</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projected (EOM)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${projected.toLocaleString()}</p>
          <StatusBadge status="green">On Track</StatusBadge>
        </div>
      </div>

      {/* Provider Pools */}
      <Card title="Provider Credit Pools">
        <div className="space-y-4">
          {providers.map((provider) => (
            <div key={provider.name} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{provider.name}</span>
                <StatusBadge status={provider.status}>Active</StatusBadge>
              </div>
              <ProgressBar value={provider.used} max={provider.budget} />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>${provider.used.toLocaleString()} used</span>
                <span>${provider.budget.toLocaleString()} budget</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
