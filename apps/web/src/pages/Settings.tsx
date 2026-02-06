import { useState } from 'react';
import { Card } from '../components/ui';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', name: 'General' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'integrations', name: 'Integrations' },
    { id: 'security', name: 'Security' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Configure your AWGP instance</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'general' && (
            <Card title="General Settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name</label>
                  <input type="text" defaultValue="Massillon Holdings" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                  <select className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2">
                    <option>America/New_York</option>
                    <option>America/Chicago</option>
                    <option>America/Los_Angeles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Language</label>
                  <select className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2">
                    <option>English</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card title="Notification Preferences">
              <div className="space-y-4">
                {[
                  { label: 'Email on approval request', default: true },
                  { label: 'Email on cost alert', default: true },
                  { label: 'Email on assistant error', default: true },
                  { label: 'Daily cost summary', default: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center">
                    <input type="checkbox" defaultChecked={item.default} className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'integrations' && (
            <Card title="API Keys & Integrations">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">OpenRouter API Key</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">sk-or-v1-••••••••••••</p>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 text-sm">Edit</button>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Keycloak Integration</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connected</p>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 text-sm">Configure</button>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">N8N Webhook URL</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">http://n8n:5678/webhook/awgp</p>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 text-sm">Test</button>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card title="Security Settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout (minutes)</label>
                  <input type="number" defaultValue={60} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Failed Login Attempts</label>
                  <input type="number" defaultValue={5} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Require MFA for admin users</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
