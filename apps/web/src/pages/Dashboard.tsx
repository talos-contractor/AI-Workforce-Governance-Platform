import { Card, StatusBadge, ActivityIcon, ProgressBar } from '../components/ui';
import { mockApprovals, mockCostByTenant } from '@/data';

export default function Dashboard() {
  const activeAssistants = 34;
  const pendingApprovals = 12;
  const todaysSpend = 423.67;
  const monthlyLimit = 5000;
  const percentUsed = (todaysSpend / monthlyLimit) * 100;

  const mockActivity = [
    { id: '1', type: 'success' as const, time: '09:42', message: 'Assistant "Finance-A" completed task INV-2025-0042' },
    { id: '2', type: 'warning' as const, time: '09:38', message: 'Assistant "Legal-C" awaiting approval (L4: Contract review)' },
    { id: '3', type: 'error' as const, time: '09:35', message: 'Cost alert: Subsidiary A at 85% of daily limit' },
    { id: '4', type: 'success' as const, time: '09:30', message: 'Assistant "Ops-B" activated by Admin' },
    { id: '5', type: 'warning' as const, time: '09:28', message: 'Hallucination flag: Assistant "Research-F" (review pending)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">AWGP</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-blue-600 font-medium">Dashboard</a>
              <a href="/assistants" className="text-gray-500 hover:text-gray-900">Assistants</a>
              <a href="/approvals" className="text-gray-500 hover:text-gray-900">Approvals ({pendingApprovals})</a>
              <a href="/audit" className="text-gray-500 hover:text-gray-900">Audit</a>
              <a href="/costs" className="text-gray-500 hover:text-gray-900">Costs</a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">AU</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your AI workforce</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assistants</p>
                <p className="text-3xl font-bold text-gray-900">{activeAssistants}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🤖</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">across 4 subsidiaries</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900">{pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">⚠️</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">requiring your action</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Spend</p>
                <p className="text-3xl font-bold text-gray-900">${todaysSpend.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">💰</div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentUsed}%` }} />
              </div>
              <p className="text-sm text-gray-500 mt-1">{percentUsed.toFixed(1)}% of ${monthlyLimit.toLocaleString()} limit</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Real-Time Activity Feed">
            <div className="space-y-4">
              {mockActivity.map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <ActivityIcon type={item.type} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.message}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Cost by Subsidiary (This Month)">
            <div className="space-y-4">
              {mockCostByTenant.map((tenant) => (
                <div key={tenant.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-900 font-medium">{tenant.name}</span>
                    <span className="text-gray-600">${tenant.used.toLocaleString()} / ${tenant.budget.toLocaleString()}</span>
                  </div>
                  <ProgressBar value={tenant.used} max={tenant.budget} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
