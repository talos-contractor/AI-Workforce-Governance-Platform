import { useState } from 'react';
import { Card, StatusBadge, ProgressBar } from '../ui';
import { mockCostByTenant } from '../../data';

export default function Costs() {
  const [period, setPeriod] = useState('month');
  
  const totalBudget = 10000;
  const currentSpend = 3083.25;
  const projected = 6450;
  const percentUsed = (currentSpend / totalBudget) * 100;

  const providers = [
    { name: 'OpenAI', budget: 5000, used: 1892.50, status: 'green' },
    { name: 'Anthropic', budget: 3000, used: 823.45, status: 'green' },
    { name: 'OpenRouter', budget: 2000, used: 367.30, status: 'green' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-gray-900">AWGP</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">AU</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cost Management</h1>
          <p className="text-gray-500">Track and manage AI spending</p>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-4 mb-6">
          {['day', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded ${period === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              This {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Budget</p>
            <p className="text-3xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Current Spend</p>
            <p className="text-3xl font-bold text-gray-900">${currentSpend.toLocaleString()}</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentUsed}%` }} />
              </div>
              <p className="text-sm text-gray-500">{percentUsed.toFixed(1)}% used</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Projected (EOM)</p>
            <p className="text-3xl font-bold text-gray-900">${projected.toLocaleString()}</p>
            <StatusBadge status="green">On Track</StatusBadge>
          </div>
        </div>

        {/* Provider Pools */}
        <Card title="Provider Credit Pools">
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.name} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{provider.name}</span>
                  <StatusBadge status={provider.status as any}>Active</StatusBadge>
                </div>
                <ProgressBar value={provider.used} max={provider.budget} />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>${provider.used.toLocaleString()} used</span>
                  <span>${provider.budget.toLocaleString()} budget</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
