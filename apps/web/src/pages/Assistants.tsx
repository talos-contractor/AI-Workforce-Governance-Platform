import { useEffect, useState } from 'react'
import { Card, StatusBadge, StatsCard } from '../components/ui'
import { getAssistants, createAssistant } from '../lib/api'

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

export default function Assistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAssistants()
  }, [])

  async function loadAssistants() {
    setLoading(true)
    setError(null)
    
    const { data, error: apiError } = await getAssistants()
    
    if (apiError) {
      setError(apiError.message)
    } else {
      setAssistants(data || [])
    }
    
    setLoading(false)
  }

  const activeCount = assistants.filter(a => a.status === 'active').length
  const errorCount = assistants.filter(a => a.status === 'error').length
  const totalCost = assistants.reduce((sum, a) => sum + (a.max_cost_per_day || 0), 0)

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

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 dark:text-gray-400">Loading assistants...</div>
    </div>
  }

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
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
            Make sure the database schema has been applied in Supabase.
          </p>
        </div>
      )}

      {/* Assistants Table */}
      <Card title="All Assistants">
        {assistants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No assistants yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Create your first assistant to get started
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
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">Edit</button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
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
