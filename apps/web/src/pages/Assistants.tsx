import { Card, StatusBadge, StatsCard, ActivityIcon } from '../ui';
import { mockAssistants, mockWorkItems } from '../../data';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">AWGP</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                AU
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assistants</h1>
            <p className="text-gray-500">Manage your AI workforce</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Create Assistant
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Assistants"
            value={mockAssistants.length}
            icon="🤖"
            iconBgColor="bg-blue-100"
          />
          <StatsCard
            title="Active"
            value={activeCount}
            icon="🟢"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title="Errors"
            value={errorCount}
            icon="🔴"
            iconBgColor="bg-red-100"
          />
          <StatsCard
            title="Today's Cost"
            value={`$${mockAssistants.reduce((sum, a) => sum + a.currentCost, 0).toFixed(2)}`}
            icon="💰"
            iconBgColor="bg-yellow-100"
          />
        </div>

        {/* Assistants Table */}
        <Card title="All Assistants">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Today</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockAssistants.map((assistant) => (
                <tr key={assistant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assistant.name}</div>
                    <div className="text-sm text-gray-500">{assistant.lastActive}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assistant.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={getStatusColor(assistant.status)}>
                      {assistant.status}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Subsidiary {assistant.tenantId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    L{assistant.riskTier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${assistant.currentCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
