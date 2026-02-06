import { Card, StatusBadge } from '../ui';
import { mockAuditLog } from '../../data';

export default function Audit() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-gray-900">AWGP</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">AU</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit & Compliance</h1>
          <p className="text-gray-500">Complete audit trail of all system actions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select className="border rounded px-3 py-2">
              <option>Today</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
            <select className="border rounded px-3 py-2">
              <option>All Tenants</option>
              <option>Subsidiary A</option>
              <option>Subsidiary B</option>
            </select>
            <select className="border rounded px-3 py-2">
              <option>All Actions</option>
              <option>WORK_COMPLETE</option>
              <option>APPROVAL_REQ</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Apply Filters</button>
          </div>
        </div>

        {/* Audit Table */}
        <Card title="Event Log" action={{ label: 'Export CSV', onClick: () => {} }}>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockAuditLog.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.actorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={log.action.includes('ALERT') ? 'warning' : 'success'}>
                      {log.action}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.entityId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.tenantName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
