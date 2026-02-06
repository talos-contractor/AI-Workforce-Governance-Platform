import { useState } from 'react';
import { Card } from '../ui';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', name: 'General' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'integrations', name: 'Integrations' },
    { id: 'security', name: 'Security' },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure your AWGP instance</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
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
                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <input type="text" defaultValue="Massillon Holdings" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>America/New_York</option>
                      <option>America/Chicago</option>
                      <option>America/Los_Angeles</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Default Language</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
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
                      <input type="checkbox" defaultChecked={item.default} className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-3 text-sm text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === 'integrations' && (
              <Card title="API Keys & Integrations">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">OpenRouter API Key</span>
                      <p className="text-sm text-gray-500">sk-or-v1-••••••••••••</p>
                    </div>
                    <button className="text-blue-600 text-sm">Edit</button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">Keycloak Integration</span>
                      <p className="text-sm text-gray-500">Connected</p>
                    </div>
                    <button className="text-blue-600 text-sm">Configure</button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">N8N Webhook URL</span>
                      <p className="text-sm text-gray-500">http://n8n:5678/webhook/awgp</p>
                    </div>
                    <button className="text-blue-600 text-sm">Test</button>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card title="Security Settings">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                    <input type="number" defaultValue={60} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Failed Login Attempts</label>
                    <input type="number" defaultValue={5} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    <span className="ml-3 text-sm text-gray-700">Require MFA for admin users</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
