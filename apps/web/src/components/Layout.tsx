import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  currentPage?: string
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'assistants', label: 'Assistants', icon: '🤖' },
  { id: 'approvals', label: 'Approvals', icon: '✅' },
  { id: 'audit', label: 'Audit', icon: '📋' },
  { id: 'costs', label: 'Costs', icon: '💰' },
  { id: 'organization', label: 'Organization', icon: '🏢' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export function Layout({ children, currentPage = 'dashboard' }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <span className="text-2xl font-bold text-gray-900">AWGP</span>
        </div>
        <nav className="px-4 pb-4">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {currentPage === 'dashboard' ? 'Overview' : currentPage.replace('-', ' ')}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700">🔔</button>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
