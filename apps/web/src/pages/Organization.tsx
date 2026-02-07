import { useEffect, useState } from 'react';
import { Card } from '../components/ui';
import { getTenants } from '../lib/api';

interface Tenant {
  id: string
  name: string
  slug: string
  type: string
  quota_max_assistants: number
  quota_max_users: number
  quota_monthly_cost_limit: number
}

export default function Organization() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [activeTab, setActiveTab] = useState('tenants')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTenants()
  }, [])

  async function loadTenants() {
    setLoading(true)
    const { data } = await getTenants()
    setTenants(data || [])
    setLoading(false)
  }

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
              activeTab === tab 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'tenants' && (
        <Card title="Subsidiaries" action={{ label: 'Add Subsidiary', onClick: () => {} }}>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Max Assistants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Max Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t.name}</td>
                      <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-400">{t.type}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{t.quota_max_assistants}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{t.quota_max_users}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">${t.quota_monthly_cost_limit?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'users' && (
        <Card title="Users" action={{ label: 'Add User', onClick: () => {} }}>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">User management coming soon</p>
          </div>
        </Card>
      )}

      {activeTab === 'quotas' && (
        <Card title="Resource Quotas">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="font-medium text-gray-900 dark:text-white">Max Assistants per Subsidiary</span>
              <span className="text-2xl font-bold">50</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="font-medium text-gray-900 dark:text-white">Max Users per Subsidiary</span>
              <span className="text-2xl font-bold">25</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="font-medium text-gray-900 dark:text-white">Default Monthly Budget</span>
              <span className="text-2xl font-bold">$2,500</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
