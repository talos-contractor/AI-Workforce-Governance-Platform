import { mockStats, mockActivity, mockCostByTenant, currentUser } from '../data'

function Dashboard() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '🟢'
      case 'warning': return '🟡'
      case 'error': return '🔴'
      default: return '⚪'
    }
  }

  const percentUsed = (mockStats.todaysSpend / mockStats.monthlyLimit) * 100

  return (
    <div>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">AWGP</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{currentUser.name}</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your AI workforce</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Assistants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assistants</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.activeAssistants}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                🤖
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">across 4 subsidiaries</p>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                ⚠️
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">requiring your action</p>
          </div>

          {/* Today's Spend */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Spend</p>
                <p className="text-3xl font-bold text-gray-900">${mockStats.todaysSpend.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                💰
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {percentUsed.toFixed(1)}% of ${mockStats.monthlyLimit.toLocaleString()} limit
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Real-Time Activity</h3>
            </div>
            <div className="p-6 space-y-4">
              {mockActivity.map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <span className="text-lg">{getIcon(item.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.message}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View All Activity →
              </button>
            </div>
          </div>

          {/* Cost by Subsidiary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cost by Subsidiary (This Month)</h3>
            </div>
            <div className="p-6 space-y-4">
              {mockCostByTenant.map((tenant) => {
                const percent = (tenant.used / tenant.budget) * 100
                return (
                  <div key={tenant.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900">{tenant.name}</span>
                      <span className="text-gray-600">
                        ${tenant.used.toLocaleString()} / ${tenant.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${percent > 75 ? 'bg-red-500' : percent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-6 py-3 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View Details →
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <footer className="mt-8 p-4 bg-white rounded-lg shadow">
          <nav className="flex flex-wrap gap-4">
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
              Dashboard
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Assistants
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Approvals
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Audit
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Costs
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Settings
            </button>
          </nav>
        </footer>
      </main>
    </div>
  )
}

export default Dashboard
