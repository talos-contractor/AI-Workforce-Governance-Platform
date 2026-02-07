import { useEffect, useState } from 'react'
import { Card, StatusBadge } from '../components/ui'
import { getApprovals, approveRequest, rejectRequest, subscribeToApprovals } from '../lib/api'

interface Approval {
  id: string
  title: string
  description: string
  risk_level: number
  status: string
  requested_by: { first_name: string; last_name: string }
  work_items: { title: string }
  expires_at: string
  context: any
}

export default function Approvals() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    loadApprovals()
    
    // Subscribe to real-time approval updates
    const subscription = subscribeToApprovals((payload) => {
      console.log('Approval updated:', payload)
      loadApprovals()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [activeTab])

  async function loadApprovals() {
    setLoading(true)
    setError(null)
    
    const { data, error: apiError } = await getApprovals(
      activeTab === 'all' ? undefined : activeTab
    )
    
    if (apiError) {
      setError(apiError.message)
    } else {
      setApprovals(data || [])
    }
    
    setLoading(false)
  }

  const urgentApprovals = approvals.filter(a => a.risk_level >= 4)
  const normalApprovals = approvals.filter(a => a.risk_level < 4)

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 dark:text-gray-400">Loading approvals...</div>
    </div>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h2>
        <p className="text-gray-500 dark:text-gray-400">Review and approve assistant actions</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded transition-colors capitalize ${
              activeTab === tab 
                ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {approvals.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {activeTab === 'pending' ? 'No pending approvals' : `No ${activeTab} approvals`}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {activeTab === 'pending' ? 'All caught up!' : 'Check other tabs for approvals'}
          </p>
        </div>
      )}

      {/* Urgent Approvals */}
      {urgentApprovals.length > 0 && activeTab === 'pending' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-red-600 mb-4">🔴 Urgent (Risk L4+)</h3>
          {urgentApprovals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} onUpdate={loadApprovals} />
          ))}
        </div>
      )}

      {/* Normal Approvals */}
      {(activeTab !== 'pending' ? approvals : normalApprovals).length > 0 && (
        <div>
          {activeTab === 'pending' && (
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Normal Priority</h3>
          )}
          {(activeTab !== 'pending' ? approvals : normalApprovals).map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} onUpdate={loadApprovals} />
          ))}
        </div>
      )}
    </div>
  )
}

function ApprovalCard({ approval, onUpdate }: { approval: Approval; onUpdate: () => void }) {
  const [processing, setProcessing] = useState(false)

  async function handleApprove() {
    setProcessing(true)
    // TODO: Get actual user ID from auth context
    const userId = '00000000-0000-0000-0000-000000000000'
    await approveRequest(approval.id, userId)
    setProcessing(false)
    onUpdate()
  }

  async function handleReject() {
    setProcessing(true)
    await rejectRequest(approval.id, 'Rejected by user')
    setProcessing(false)
    onUpdate()
  }

  const isPending = approval.status === 'pending'

  return (
    <Card title={approval.title} className={`mb-4 ${approval.risk_level >= 4 ? 'border-red-200 dark:border-red-900/50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="mt-2 flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>From: {approval.requested_by?.first_name} {approval.requested_by?.last_name}</span>
            <StatusBadge status={approval.risk_level >= 4 ? 'warning' : 'success'}>L{approval.risk_level}</StatusBadge>
            <span>Work: {approval.work_items?.title}</span>
          </div>
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-700 dark:text-gray-300">
            {approval.description || approval.context?.description || 'No additional context'}
          </div>
          {isPending && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Expires: {new Date(approval.expires_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      {isPending && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={processing}
            className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
          >
            {processing ? 'Processing...' : '✓ Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={processing}
            className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
          >
            {processing ? 'Processing...' : '✗ Reject'}
          </button>
        </div>
      )}
      
      {!isPending && (
        <div className="mt-4">
          <StatusBadge status={approval.status === 'approved' ? 'success' : 'error'}>
            {approval.status.toUpperCase()}
          </StatusBadge>
        </div>
      )}
    </Card>
  )
}
