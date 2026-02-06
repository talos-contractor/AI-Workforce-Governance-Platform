import { Card, StatusBadge } from '../components/ui';
import { mockAuditLog } from '@/data';

export default function Audit() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit & Compliance</h2>
        <p className="text-gray-500 dark:text-gray-400">Complete audit trail of all system actions</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 transition-colors">
        <div className="flex flex-wrap gap-4">
          <select className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2">
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
          <select className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2">
            <option>All Tenants</option>
            <option>Subsidiary A</option>
            <option>Subsidiary B</option>
          </select>
          <select className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2">
            <option>All Actions</option>
            <option>WORK_COMPLETE</option>
            <option>APPROVAL_REQ</option>
          </select>
          <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600">Apply Filters</button>
        </div>
      </div>

      {/* Audit Table */}
      <Card title="Event Log" action={{ label: 'Export CSV', onClick: () => {} }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tenant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockAuditLog.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{log.actorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={log.action.includes('ALERT') ? 'warning' : 'success'}>
                      {log.action}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.entityId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.tenantName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
