import { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import { Save, X, RotateCcw, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states
  const [general, setGeneral] = useState({
    organizationName: 'Massillon Holdings',
    timezone: 'America/New_York',
    language: 'English'
  });
  const [originalGeneral] = useState({...general});

  const [notifications, setNotifications] = useState({
    emailOnApproval: true,
    emailOnCostAlert: true,
    emailOnError: true,
    dailySummary: false
  });
  const [originalNotifications] = useState({...notifications});

  const [integrations, setIntegrations] = useState({
    openrouterKey: 'sk-or-v1-••••••••••••',
    n8nWebhook: 'http://n8n:5678/webhook/awgp',
    keycloakEnabled: true
  });
  const [originalIntegrations] = useState({...integrations});

  const [security, setSecurity] = useState({
    sessionTimeout: 60,
    maxFailedAttempts: 5,
    requireMfa: true
  });
  const [originalSecurity] = useState({...security});

  // Check for unsaved changes
  useEffect(() => {
    const changed = JSON.stringify(general) !== JSON.stringify(originalGeneral) ||
                   JSON.stringify(notifications) !== JSON.stringify(originalNotifications) ||
                   JSON.stringify(integrations) !== JSON.stringify(originalIntegrations) ||
                   JSON.stringify(security) !== JSON.stringify(originalSecurity);
    setHasChanges(changed);
  }, [general, notifications, integrations, security]);

  const sections = [
    { id: 'general', name: 'General' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'integrations', name: 'Integrations' },
    { id: 'security', name: 'Security' },
  ];

  function handleSectionChange(sectionId: string) {
    if (hasChanges) {
      setPendingSection(sectionId);
      setShowUnsavedModal(true);
    } else {
      setActiveSection(sectionId);
    }
  }

  function confirmNavigation() {
    if (pendingSection) {
      setActiveSection(pendingSection);
    }
    setShowUnsavedModal(false);
    setPendingSection(null);
    handleCancel();
  }

  async function handleSave() {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }

  function handleCancel() {
    setGeneral({...originalGeneral});
    setNotifications({...originalNotifications});
    setIntegrations({...originalIntegrations});
    setSecurity({...originalSecurity});
    setShowUnsavedModal(false);
    setPendingSection(null);
  }

  function handleReset() {
    setGeneral({ organizationName: 'Massillon Holdings', timezone: 'America/New_York', language: 'English' });
    setNotifications({ emailOnApproval: true, emailOnCostAlert: true, emailOnError: true, dailySummary: false });
    setIntegrations({ openrouterKey: 'sk-or-v1-••••••••••••', n8nWebhook: 'http://n8n:5678/webhook/awgp', keycloakEnabled: true });
    setSecurity({ sessionTimeout: 60, maxFailedAttempts: 5, requireMfa: true });
  }

  return (
    <div>
      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unsaved Changes</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">You have unsaved changes. What would you like to do?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowUnsavedModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Keep Editing</button>
              <button onClick={confirmNavigation} className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">Discard Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-4 py-2 rounded-lg shadow-lg z-50">
          Settings saved successfully!
        </div>
      )}

      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-500 dark:text-gray-400">Configure your AWGP instance</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Unsaved
            </span>
          )}
          <button onClick={handleReset} disabled={isSaving} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleCancel} disabled={isSaving || !hasChanges} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving || !hasChanges} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {section.name}
                {hasChanges && activeSection === section.id && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
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
                  <input 
                    type="text" 
                    value={general.organizationName}
                    onChange={(e) => setGeneral({...general, organizationName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                  <select 
                    value={general.timezone}
                    onChange={(e) => setGeneral({...general, timezone: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                  >
                    <option>America/New_York</option>
                    <option>America/Chicago</option>
                    <option>America/Los_Angeles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Language</label>
                  <select 
                    value={general.language}
                    onChange={(e) => setGeneral({...general, language: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                  >
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
                  { label: 'Email on approval request', key: 'emailOnApproval' },
                  { label: 'Email on cost alert', key: 'emailOnCostAlert' },
                  { label: 'Email on assistant error', key: 'emailOnError' },
                  { label: 'Daily cost summary', key: 'dailySummary' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" 
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'integrations' && (
            <Card title="API Keys & Integrations">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">OpenRouter API Key</label>
                  <input 
                    type="password" 
                    value={integrations.openrouterKey}
                    onChange={(e) => setIntegrations({...integrations, openrouterKey: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">n8n Webhook URL</label>
                  <input 
                    type="text" 
                    value={integrations.n8nWebhook}
                    onChange={(e) => setIntegrations({...integrations, n8nWebhook: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2" 
                  />
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={integrations.keycloakEnabled}
                    onChange={(e) => setIntegrations({...integrations, keycloakEnabled: e.target.checked})}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" 
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Enable Keycloak SSO</span>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card title="Security Settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout (minutes)</label>
                  <input 
                    type="number" 
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Failed Login Attempts</label>
                  <input 
                    type="number" 
                    value={security.maxFailedAttempts}
                    onChange={(e) => setSecurity({...security, maxFailedAttempts: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2" 
                  />
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={security.requireMfa}
                    onChange={(e) => setSecurity({...security, requireMfa: e.target.checked})}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" 
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Require MFA for Admin Users</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
