import React, { useState, useEffect } from 'react'
import { Card, StatusBadge, StatsCard } from '../components/ui'
import { getAssistants, createAssistant, updateAssistant, deleteAssistant, subscribeToAssistants } from '../lib/api'

interface Assistant {
  id: string
  name: string
  slug: string
  type: string
  status: string
  risk_tier: number
  max_cost_per_day: number
  created_at: string
}

interface CreateAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

interface EditAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  assistant: Assistant | null
}

function CreateAssistantModal({ isOpen, onClose, onCreated }: CreateAssistantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'company_operations',
    risk_tier: 2,
    max_cost_per_day: 10
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: _data, error: apiError } = await createAssistant(formData)
      
      if (apiError) {
        setError(apiError.message)
      } else {
        onCreated()
        onClose()
        setFormData({
          name: '',
          slug: '',
          description: '',
          type: 'company_operations',
          risk_tier: 2,
          max_cost_per_day: 10
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create assistant')
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Assistant</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slug (auto-generated)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
              >
                <option value="company_operations">Operations</option>
                <option value="company_finance">Finance</option>
                <option value="company_marketing">Marketing</option>
                <option value="company_compliance">Compliance</option>
                <option value="shared_legal">Legal (Shared)</option>
                <option value="shared_finance">Finance (Shared)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Risk Tier (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={formData.risk_tier}
                onChange={(e) => setFormData({ ...formData, risk_tier: parseInt(e.target.value) })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Cost Per Day ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.max_cost_per_day}
                onChange={(e) => setFormData({ ...formData, max_cost_per_day: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function EditAssistantModal({ isOpen, onClose, onUpdated, assistant }: EditAssistantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'company_operations',
    risk_tier: 2,
    max_cost_per_day: 10,
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (assistant) {
      setFormData({
        name: assistant.name,
        slug: assistant.slug,
        type: assistant.type,
        risk_tier: assistant.risk_tier,
        max_cost_per_day: assistant.max_cost_per_day,
        status: assistant.status
      })
    }
  }, [assistant])

  if (!isOpen || !assistant) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: apiError } = await updateAssistant(assistant.id, formData)
      
      if (apiError) {
        setError(apiError.message)
      } else {
        onUpdated()
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update assistant')
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Assistant</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2">
                <option value="company_operations">Operations</option>
                <option value="company_finance">Finance</option>
                <option value="company_marketing">Marketing</option>
                <option value="company_compliance">Compliance</option>
                <option value="shared_legal">Legal (Shared)</option>
                <option value="shared_finance">Finance (Shared)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
                <option value="awaiting_approval">Awaiting Approval</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Tier (0-5)</label>
              <input type="number" min="0" max="5" value={formData.risk_tier} onChange={(e) => setFormData({ ...formData, risk_tier: parseInt(e.target.value) })} className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Cost Per Day ($)</label>
              <input type="number" step="0.01" min="0" value={formData.max_cost_per_day} onChange={(e) => setFormData({ ...formData, max_cost_per_day: parseFloat(e.target.value) })} className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2" />
            </div>
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Assistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    console.log('DEBUG: Assistants component mounted')
    loadAssistants()
    
    // Subscribe to real-time assistant updates
    const subscription = subscribeToAssistants((payload) => {
      console.log('Assistant updated:', payload)
      loadAssistants()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function loadAssistants() {
    console.log('DEBUG: loadAssistants called')
    setLoading(true)
    setError(null)
    setDebugInfo('Loading...')
    
    try {
      console.log('DEBUG: Calling getAssistants()')
      const { data, error: apiError } = await getAssistants()
      
      console.log('DEBUG: getAssistants result:', { data, apiError })
      setDebugInfo(`Data: ${JSON.stringify(data?.length || 0)} items, Error: ${apiError?.message || 'none'}`)
      
      if (apiError) {
        console.error('DEBUG: API Error:', apiError)
        setError(apiError.message)
      } else {
        console.log('DEBUG: Setting assistants:', data)
        setAssistants(data || [])
      }
    } catch (err: any) {
      console.error('DEBUG: Exception caught:', err)
      setError(`Exception: ${err.message}`)
      setDebugInfo(`Exception: ${err.message}`)
    }
    
    setLoading(false)
  }

  const activeCount = assistants.filter(a => a.status === 'active').length
  const errorCount = assistants.filter(a => a.status === 'error').length
  const totalCost = assistants.reduce((sum, a) => sum + (a.max_cost_per_day || 0), 0)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }
    
    const { error } = await deleteAssistant(id)
    if (error) {
      alert('Failed to delete: ' + error.message)
    } else {
      loadAssistants()
    }
  }

  function openEditModal(assistant: Assistant) {
    setSelectedAssistant(assistant)
    setIsEditModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'active'
      case 'awaiting_approval': return 'warning'
      case 'error': return 'error'
      default: return 'inactive'
    }
  }

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  console.log('DEBUG: Render - loading:', loading, 'error:', error, 'assistants:', assistants.length)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-gray-500 dark:text-gray-400">Loading assistants...</div>
        {debugInfo && (
          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono max-w-md">
            {debugInfo}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <CreateAssistantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={loadAssistants}
      />
      <EditAssistantModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onUpdated={loadAssistants}
        assistant={selectedAssistant}
      />

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Assistants</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your AI workforce</p>
        </div>
        <button 
          onClick={() => {
            console.log('DEBUG: Create button clicked')
            setIsModalOpen(true)
          }}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          + Create Assistant
        </button>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
          Debug: {debugInfo}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Assistants"
          value={assistants.length}
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
          title="Daily Cost Limit"
          value={`$${totalCost.toFixed(2)}`}
          icon="💰"
          iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error: {error}</p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
            Check browser console for details. Common issues:
          </p>
          <ul className="text-sm text-red-500 dark:text-red-400 list-disc ml-5 mt-2">
            <li>Supabase URL/key missing in .env</li>
            <li>Database tables don't exist</li>
            <li>RLS policy blocking access</li>
            <li>CORS error (check Network tab)</li>
          </ul>
        </div>
      )}

      {/* Assistants Table */}
      <Card title="All Assistants">
        {assistants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No assistants yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Click "Create Assistant" to add your first one
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {assistants.map((assistant) => (
                  <tr key={assistant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{assistant.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{assistant.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatType(assistant.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={getStatusColor(assistant.status)}>
                        {assistant.status}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      L{assistant.risk_tier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      ${assistant.max_cost_per_day?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => openEditModal(assistant)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">Edit</button>
                      <button onClick={() => handleDelete(assistant.id, assistant.name)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
