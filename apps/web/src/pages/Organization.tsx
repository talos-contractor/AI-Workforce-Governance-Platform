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
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage tenants and users</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        {['tenants', 'users', 'quotas'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'tenants' && (
        <Card title="Subsidiaries" action={{ label: 'Add Subsidiary', onClick: () => {} }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Assistants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t.name}</td>
                    <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-400">{t.type}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{t.users}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{t.assistants}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">${t.budget.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card title="Users" action={{ label: 'Add User', onClick: () => {} }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tenant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">{u.role}</span></td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{u.tenant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'quotas' && (
        <Card title="Resource Quotas">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="font-medium text-gray-900 dark:text-white">Max Assistants per Subsidiary</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">50</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="font-medium text-gray-900 dark:text-white">Max Users per Subsidiary</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">25</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="font-medium text-gray-900 dark:text-white">Default Monthly Budget</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">$2,500</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
