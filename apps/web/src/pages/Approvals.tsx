import { Card, StatusBadge } from '../ui';
import { mockApprovals } from '../../data';

export default function Approvals() {
  const urgentApprovals = mockApprovals.filter(a => a.riskLevel >= 4);
  const normalApprovals = mockApprovals.filter(a => a.riskLevel < 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-gray-900">AWGP</span>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">Dashboard</a>
              <a href="/assistants" className="text-gray-500 hover:text-gray-900">Assistants</a>
              <a href="/approvals" className="text-blue-600 font-medium">Approvals (12)</a>
              <a href="/audit" className="text-gray-500 hover:text-gray-900">Audit</a>
              <a href="/costs" className="text-gray-500 hover:text-gray-900">Costs</a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">AU</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-500">Review and approve assistant actions</p>
        </div>

        <div className="flex space-x-4 mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">My Inbox</button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">My Requests</button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">All Pending</button>
        </div>

        {/* Urgent Approvals */}
        {urgentApprovals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-red-600 mb-4">🔴 Urgent</h2>
            {urgentApprovals.map((approval) => (
              <Card key={approval.id} title="" className="mb-4 border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{approval.title}</h3>
                    <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                      <span>Assistant: {approval.assistantId === '2' ? 'Legal-C' : '-'}</span>
                      <span>Risk: L{approval.riskLevel}</span>
                      <span>Timeout: {approval.timeout}</span>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      {approval.context}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">✓ Approve</button>
                  <button className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">✗ Reject</button>
                  <button className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">➤ Delegate</button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Normal Approvals */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Normal Priority</h2>
          {normalApprovals.map((approval) => (
            <Card key={approval.id} title="" className="mb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{approval.title}</h3>
                  <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                    <span>Assistant: {approval.assistantId === '4' ? 'Marketing-D' : approval.assistantId === '1' ? 'Finance-A' : '-'}</span>
                    <StatusBadge status={approval.riskLevel >= 3 ? 'warning' : 'success'}>L{approval.riskLevel}</StatusBadge>
                    <span>Timeout: {approval.timeout}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                    {approval.context}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">✓ Approve</button>
                <button className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">✗ Reject</button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
