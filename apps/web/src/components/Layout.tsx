import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
  { id: 'assistants', label: 'Assistants', icon: '🤖', path: '/assistants' },
  { id: 'approvals', label: 'Approvals', icon: '✅', path: '/approvals' },
  { id: 'audit', label: 'Audit', icon: '📋', path: '/audit' },
  { id: 'costs', label: 'Costs', icon: '💰', path: '/costs' },
  { id: 'organization', label: 'Organization', icon: '🏢', path: '/organization' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
        <div className="p-6">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">AWGP</span>
        </div>
        <nav className="px-4 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-colors ${
                currentPath === item.path
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {navItems.find(item => item.path === currentPath)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggle}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">🔔</button>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
