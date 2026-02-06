// Shared Card Component
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: { label: string; onClick: () => void };
}

export function Card({ title, children, className = '', action }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className} transition-colors`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            {action.label} →
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// Status Badge Component
interface BadgeProps {
  status: 'active' | 'inactive' | 'error' | 'pending' | 'success' | 'warning';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: BadgeProps) {
  const colors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    warning: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {children}
    </span>
  );
}

// Progress Bar Component
interface ProgressProps {
  value: number;
  max: number;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  showLabel?: boolean;
}

export function ProgressBar({ value, max, color = 'green', showLabel = true }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ${value.toLocaleString()} / ${max.toLocaleString()}
        </p>
      )}
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
}

export function StatsCard({ title, value, subtitle, icon, iconBgColor }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Activity Icon Component
export function ActivityIcon({ type }: { type: 'success' | 'warning' | 'error' }) {
  const icons = {
    success: '🟢',
    warning: '🟡',
    error: '🔴',
  };
  return <span className="text-lg">{icons[type]}</span>;
}
