import { Card, StatusBadge, StatsCard } from '../components/ui';
import { mockAssistants } from '@/data';

export default function Assistants() {
  const activeCount = mockAssistants.filter(a => a.status === 'active').length;
  const errorCount = mockAssistants.filter(a => a.status === 'error').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'active';
      case 'awaiting_approval': return 'warning';
      case 'error': return 'error';
      default: return 'inactive';
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Assistants</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your AI workforce</p>
        </div>
        <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
          + Create Assistant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Assistants"
          value={mockAssistants.length}
          icon="🤖"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatsCard
          title="Active"
          value={activeCount}
          icon="🟢"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
        />
        <StatsCard
          title="Errors"
          value={errorCount}
          icon="🔴"
          iconBgColor="bg-red-100 dark:bg-red-900/30"
        />
        <StatsCard
          title="Today's Cost"
          value={`$${mockAssistants.reduce((sum, a) => sum + a.currentCost, 0).toFixed(2)}`}
          icon="💰"
          iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
        />
      </div>

      {/* Assistants Table */}
      <Card title="All Assistants">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost Today</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {mockAssistants.map((assistant) => (
                <tr key={assistant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{assistant.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{assistant.lastActive}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {assistant.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={getStatusColor(assistant.status)}>
                      {assistant.status}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    Subsidiary {assistant.tenantId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    L{assistant.riskTier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    ${assistant.currentCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">Edit</button>
                    <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
