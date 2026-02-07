import { useEffect, useState } from 'react';
import { Card, StatusBadge, ProgressBar } from '../components/ui';
import { getCostTransactions } from '../lib/api';

interface CostTransaction {
  id: string
  provider: string
  model: string
  cost_amount: number
  input_tokens: number
  output_tokens: number
  created_at: string
  assistants: { name: string }
  metadata?: {
    project?: string
    task?: string
    description?: string
  }
}

export default function Costs() {
  const [transactions, setTransactions] = useState<CostTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month')

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    setLoading(true)
    const { data, error: apiError } = await getCostTransactions()
    if (apiError) {
      setError(apiError.message)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }

  const totalCost = transactions.reduce((sum, t) => sum + (t.cost_amount || 0), 0)
  const byProvider = transactions.reduce((acc, t) => {
    acc[t.provider] = (acc[t.provider] || 0) + t.cost_amount
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return <div className="text-center py-12">Loading cost data...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cost Management</h2>
        <p className="text-gray-500 dark:text-gray-400">Track and manage AI spending</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex space-x-4 mb-6">
        {['day', 'week', 'month'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`px-4 py-2 rounded transition-colors capitalize ${
              period === p 
                ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            This {p}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Provider</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {Object.entries(byProvider).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
          </p>
        </div>
      </div>

      {/* Provider Pools */}
      <Card title="Cost Transactions">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No cost transactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 20).map((transaction) => (
              <div key={transaction.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{transaction.assistants?.name || 'Unknown'}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{transaction.model}</span>
                  </div>
                  <StatusBadge status="success">{transaction.provider}</StatusBadge>
                </div>
                {transaction.metadata?.project && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    <span className="font-medium">Project:</span> {transaction.metadata.project}
                  </div>
                )}
                {transaction.metadata?.task && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Task:</span> {transaction.metadata.task}
                  </div>
                )}
                {transaction.metadata?.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {transaction.metadata.description}
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {transaction.input_tokens} / {transaction.output_tokens} tokens
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">${transaction.cost_amount.toFixed(6)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
