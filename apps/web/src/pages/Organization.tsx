import { useState } from 'react';
import { Card } from '../components/ui';

export default function Organization() {
  const [activeTab, setActiveTab] = useState('tenants');
  
  const tenants = [
    { id: '1', name: 'Massillon Holdings', type: 'holding', users: 5, assistants: 12, budget: 10000 },
    { id: '2', name: 'Subsidiary A', type: 'subsidiary', users: 8, assistants: 34, budget: 2500 },
    { id: '3', name: 'Subsidiary B', type: 'subsidiary', users: 6, assistants: 28, budget: 2500 },
    { id: '4', name: 'Subsidiary C', type: 'subsidiary', users: 4, assistants: 15, budget: 1500 },
  ];

  const users = [
    { id: '1', name: 'Admin User', email: 'admin@holding.com', role: 'Super Admin', tenant: 'All' },
    { id: '2', name: 'Manager A', email: 'manager@a.com', role: 'Admin', tenant: 'Subsidiary A' },
    { id: '3', name: 'Operator B', email: 'ops@b.com', role: 'Operator', tenant: 'Subsidiary B' },
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
          <h1 className="text-3xl font-bold text-gray-900">Organization</h1>
          <p className="text-gray-500">Manage tenants and users</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          {['tenants', 'users', 'quotas'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                activeTab === tab ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'tenants' && (
          <Card title="Subsidiaries" action={{ label: 'Add Subsidiary', onClick: () => {} }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assistants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                    <td className="px-6 py-4 capitalize">{t.type}</td>
                    <td className="px-6 py-4">{t.users}</td>
                    <td className="px-6 py-4">{t.assistants}</td>
                    <td className="px-6 py-4">${t.budget.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'users' && (
          <Card title="Users" action={{ label: 'Add User', onClick: () => {} }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{u.role}</span></td>
                    <td className="px-6 py-4">{u.tenant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'quotas' && (
          <Card title="Resource Quotas">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">Max Assistants per Subsidiary</span>
                <span className="text-2xl font-bold">50</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">Max Users per Subsidiary</span>
                <span className="text-2xl font-bold">25</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">Default Monthly Budget</span>
                <span className="text-2xl font-bold">$2,500</span>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
