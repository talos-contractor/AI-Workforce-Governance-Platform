// Mock data for AWGP MVP
// Re-export all mock data from mocks/data.ts for convenience

export {
  currentUser,
  mockTenants,
  mockAssistants,
  mockWorkItems,
  mockApprovals,
  mockAuditLog,
  mockCostData,
  mockActivityFeed,
  mockCostByTenant,
} from './mocks/data';

// Legacy exports for compatibility
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
