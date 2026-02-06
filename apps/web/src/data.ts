// Mock data for AWGP MVP
export const currentUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@holding.com',
  role: 'super_admin',
};

export const mockStats = {
  activeAssistants: 34,
  pendingApprovals: 12,
  todaysSpend: 423.67,
  monthlyLimit: 5000,
};

export const mockActivity = [
  { id: '1', type: 'success', time: '09:42', message: 'Assistant "Finance-A" completed task' },
  { id: '2', type: 'warning', time: '09:38', message: 'Assistant "Legal-C" awaiting approval' },
  { id: '3', type: 'error', time: '09:35', message: 'Cost alert: Subsidiary A at 85%' },
  { id: '4', type: 'success', time: '09:30', message: 'Assistant "Ops-B" activated' },
];

export const mockCostByTenant = [
  { name: 'Subsidiary A', budget: 2000, used: 1234 },
  { name: 'Subsidiary B', budget: 2000, used: 892 },
  { name: 'Subsidiary C', budget: 1500, used: 723 },
  { name: 'Venture Studio', budget: 1000, used: 234 },
];
