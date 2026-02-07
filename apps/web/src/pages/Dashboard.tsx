import { useEffect, useState } from 'react'
import { Card, ActivityIcon, ProgressBar } from '../components/ui'
import { getCostSummary, subscribeToWorkItems } from '../lib/api'

interface ActivityItem {
  id: string
  type: 'success' | 'warning' | 'error'
  time: string
  message: string
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeAssistants: 0,
    pendingApprovals: 0,
    todaysSpend: 0,
    monthlyLimit: 5000,
  })
  const [costByTenant, setCostByTenant] = useState<Array<{name: string, budget: number, used: number}>>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Subscribe to real-time updates
    const subscription = subscribeToWorkItems((payload) => {
      console.log('Work item updated:', payload)
      loadDashboardData() // Refresh on changes
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    
    try {
      // Get cost summary
      const { data: costData } = await getCostSummary('month')
      
      if (costData) {
        setStats(prev => ({
          ...prev,
          todaysSpend: costData.byDay[new Date().toISOString().split('T')[0]] || 0,
        }))
      }
      
      // For now, keep mock tenant data until we have real data
      setCostByTenant([
        { name: 'Subsidiary A', budget: 2500, used: 1234 },
        { name: 'Subsidiary B', budget: 2500, used: 892 },
        { name: 'Subsidiary C', budget: 1500, used: 723 },
        { name: 'Venture Studio', budget: 1000, used: 234 },
      ])
      
      setActivities([
        { id: '1', type: 'success', time: '09:42', message: 'Assistant "Finance-A" completed task INV-2025-0042' },
        { id: '2', type: 'warning', time: '09:38', message: 'Assistant "Legal-C" awaiting approval (L4: Contract review)' },
        { id: '3', type: 'error', time: '09:35', message: 'Cost alert: Subsidiary A at 85% of daily limit' },
        { id: '4', type: 'success', time: '09:30', message: 'Assistant "Ops-B" activated by Admin' },
        { id: '5', type: 'warning', time: '09:28', message: 'Hallucination flag: Assistant "Research-F" (review pending)' },
      ])
      
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const percentUsed = (stats.todaysSpend / stats.monthlyLimit) * 100

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 dark:text-gray-400">Loading...</div>
    </div>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">Dashboard overview of your AI workforce</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Assistants</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeAssistants}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl">🤖</div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">across 4 subsidiaries</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-2xl">⚠️</div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">requiring your action</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Spend</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">${stats.todaysSpend.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl">💰</div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentUsed}%` }} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{percentUsed.toFixed(1)}% of ${stats.monthlyLimit.toLocaleString()} limit</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Real-Time Activity Feed">
          <div className="space-y-4">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <ActivityIcon type={item.type} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-200">{item.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cost by Subsidiary (This Month)">
          <div className="space-y-4">
            {costByTenant.map((tenant) => (
              <div key={tenant.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-900 dark:text-gray-200 font-medium">{tenant.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">${tenant.used.toLocaleString()} / ${tenant.budget.toLocaleString()}</span>
                </div>
                <ProgressBar value={tenant.used} max={tenant.budget} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
