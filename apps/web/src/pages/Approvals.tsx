import { Card, StatusBadge } from '../components/ui';
import { mockApprovals } from '@/data';

export default function Approvals() {
  const urgentApprovals = mockApprovals.filter(a => a.riskLevel >= 4);
  const normalApprovals = mockApprovals.filter(a => a.riskLevel < 4);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h2>
        <p className="text-gray-500 dark:text-gray-400">Review and approve assistant actions</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded">My Inbox</button>
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">My Requests</button>
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">All Pending</button>
      </div>

      {/* Urgent Approvals */}
      {urgentApprovals.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-red-600 mb-4">🔴 Urgent</h3>
          {urgentApprovals.map((approval) => (
            <Card key={approval.id} title="" className="mb-4 border-red-200 dark:border-red-900/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{approval.title}</h3>
                  <div className="mt-2 flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Assistant: {approval.assistantId === '2' ? 'Legal-C' : '-'}</span>
                    <span>Risk: L{approval.riskLevel}</span>
                    <span>Timeout: {approval.timeout}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-700 dark:text-gray-300">
                    {approval.context}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600">✓ Approve</button>
                <button className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600">✗ Reject</button>
                <button className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-600">➤ Delegate</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Normal Approvals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Normal Priority</h3>
        {normalApprovals.map((approval) => (
          <Card key={approval.id} title="" className="mb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{approval.title}</h3>
                <div className="mt-2 flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Assistant: {approval.assistantId === '4' ? 'Marketing-D' : approval.assistantId === '1' ? 'Finance-A' : '-'}</span>
                  <StatusBadge status={approval.riskLevel >= 3 ? 'warning' : 'success'}>L{approval.riskLevel}</StatusBadge>
                  <span>Timeout: {approval.timeout}</span>
                </div>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-700 dark:text-gray-300">
                  {approval.context}
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600">✓ Approve</button>
              <button className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600">✗ Reject</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
