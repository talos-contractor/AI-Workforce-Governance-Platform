import { useEffect, useState } from 'react';
import { Card } from '../components/ui';
import { getTenants, createTenant, updateTenant, deleteTenant } from '../lib/api';

interface Tenant {
  id: string
  name: string
  slug: string
  type: string
  quota_max_assistants: number
  quota_max_users: number
  quota_monthly_cost_limit: number
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
}

function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Organization() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [activeTab, setActiveTab] = useState('tenants')
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'subsidiary',
    quota_max_assistants: 50,
    quota_max_users: 25,
    quota_monthly_cost_limit: 2500
  })

  useEffect(() => {
    loadTenants()
  }, [])

  async function loadTenants() {
    setLoading(true)
    const { data } = await getTenants()
    setTenants(data || [])
    setLoading(false)
  }

  function openCreate() {
    setFormData({
      name: '',
      slug: '',
      type: 'subsidiary',
      quota_max_assistants: 50,
      quota_max_users: 25,
      quota_monthly_cost_limit: 2500
    })
    setIsCreateOpen(true)
  }

  function openEdit(tenant: Tenant) {
    setSelectedTenant(tenant)
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      type: tenant.type,
      quota_max_assistants: tenant.quota_max_assistants,
      quota_max_users: tenant.quota_max_users,
      quota_monthly_cost_limit: tenant.quota_monthly_cost_limit
    })
    setIsEditOpen(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await createTenant(formData)
    if (!error) {
      setIsCreateOpen(false)
      loadTenants()
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTenant) return
    const { error } = await updateTenant(selectedTenant.id, formData)
    if (!error) {
      setIsEditOpen(false)
      loadTenants()
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const { error } = await deleteTenant(id)
    if (!error) {
      loadTenants()
    }
  }

  const formFields = (
    <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({...formData, slug: e.target.value})}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
        >
          <option value="holding">Holding Company</option>
          <option value="subsidiary">Subsidiary</option>
          <option value="primary">Primary Company</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Assistants</label>
        <input
          type="number"
          value={formData.quota_max_assistants}
          onChange={(e) => setFormData({...formData, quota_max_assistants: parseInt(e.target.value)})}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Users</label>
        <input
          type="number"
          value={formData.quota_max_users}
          onChange={(e) => setFormData({...formData, quota_max_users: parseInt(e.target.value)})}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Budget ($)</label>
        <input
          type="number"
          step="0.01"
          value={formData.quota_monthly_cost_limit}
          onChange={(e) => setFormData({...formData, quota_monthly_cost_limit: parseFloat(e.target.value)})}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
        />
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => isEditOpen ? setIsEditOpen(false) : setIsCreateOpen(false)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          {isEditOpen ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </form>
  )

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

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Company">
        {formFields}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Company">
        {formFields}
      </Modal>

      {activeTab === 'tenants' && (
        <Card title="Companies" action={{ label: 'Add Company', onClick: openCreate }}>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
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
                      <td className="px-6 py-4 text-sm">
                        <button onClick={() => openEdit(t)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">Edit</button>
                        <button onClick={() => handleDelete(t.id, t.name)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                      </td>
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
