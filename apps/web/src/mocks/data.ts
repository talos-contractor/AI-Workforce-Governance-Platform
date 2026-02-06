// Mock data for AWGP MVP
// All data is static for demo purposes

export const currentUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@holding.com',
  role: 'super_admin',
  avatar: 'AU',
};

export const mockTenants = [
  { id: '1', name: 'Massillon Holdings', type: 'holding', slug: 'holdings' },
  { id: '2', name: 'Subsidiary A', type: 'subsidiary', parentId: '1', slug: 'sub-a' },
  { id: '3', name: 'Subsidiary B', type: 'subsidiary', parentId: '1', slug: 'sub-b' },
  { id: '4', name: 'Subsidiary C', type: 'subsidiary', parentId: '1', slug: 'sub-c' },
];

export const mockAssistants = [
  {
    id: '1',
    name: 'Finance-A',
    type: 'company_finance',
    status: 'active',
    tenantId: '2',
    riskTier: 2,
    currentCost: 12.45,
    dailyLimit: 50,
    lastActive: '2 min ago',
  },
  {
    id: '2',
    name: 'Legal-C',
    type: 'company_compliance',
    status: 'awaiting_approval',
    tenantId: '3',
    riskTier: 3,
    currentCost: 45.20,
    dailyLimit: 100,
    lastActive: '5 min ago',
  },
  {
    id: '3',
    name: 'Operations-B',
    type: 'company_operations',
    status: 'active',
    tenantId: '2',
    riskTier: 2,
    currentCost: 8.30,
    dailyLimit: 30,
    lastActive: '1 min ago',
  },
  {
    id: '4',
    name: 'Marketing-D',
    type: 'company_marketing',
    status: 'active',
    tenantId: '3',
    riskTier: 1,
    currentCost: 5.60,
    dailyLimit: 20,
    lastActive: '10 min ago',
  },
  {
    id: '5',
    name: 'Research-F',
    type: 'shared_legal',
    status: 'error',
    tenantId: '4',
    riskTier: 2,
    currentCost: 0,
    dailyLimit: 75,
    lastActive: '2 hours ago',
  },
];

export const mockWorkItems = [
  { id: '1', title: 'Invoice Check #234', status: 'backlog', priority: 2, riskLevel: 1, assistantId: '1' },
  { id: '2', title: 'Monthly Report Gen', status: 'backlog', priority: 3, riskLevel: 1, assistantId: '1' },
  { id: '3', title: 'Data Export #44', status: 'backlog', priority: 3, riskLevel: 2, assistantId: '1' },
  { id: '4', title: 'Vendor Analysis', status: 'in_progress', priority: 1, riskLevel: 2, assistantId: '1', startedAt: '09:30' },
  { id: '5', title: 'Expense Audit', status: 'in_progress', priority: 2, riskLevel: 2, assistantId: '1', startedAt: '10:15' },
  { id: '6', title: 'Contract Review - Q1 Vendor', status: 'awaiting_approval', priority: 1, riskLevel: 4, assistantId: '2' },
];

export const mockApprovals = [
  {
    id: '1',
    title: 'Contract Review - Q1 Vendor Agreement',
    assistantId: '2',
    riskLevel: 4,
    status: 'pending',
    createdAt: '09:15',
    timeout: '2h',
    context: 'Vendor ABC proposes contract amendment for Q1 services. Terms: $50,000 service level, modified SLA.',
  },
  {
    id: '2',
    title: 'Marketing Copy - Product Launch',
    assistantId: '4',
    riskLevel: 2,
    status: 'pending',
    createdAt: '08:45',
    timeout: '24h',
    context: 'Launch campaign copy for new product line. Estimated reach: 10,000 customers.',
  },
  {
    id: '3',
    title: 'Data Analysis - Q4 Performance',
    assistantId: '1',
    riskLevel: 2,
    status: 'pending',
    createdAt: '08:30',
    timeout: '24h',
    context: 'Quarterly financial performance analysis across all subsidiaries.',
  },
];

export const mockAuditLog = [
  { id: '1', timestamp: '2025-02-06 09:42', actorType: 'assistant', actorName: 'Finance-A', action: 'WORK_COMPLETE', entityId: 'INV-42', tenantName: 'Subsidiary A' },
  { id: '2', timestamp: '2025-02-06 09:38', actorType: 'assistant', actorName: 'Legal-C', action: 'APPROVAL_REQ', entityId: 'CTR-15', tenantName: 'Subsidiary B' },
  { id: '3', timestamp: '2025-02-06 09:35', actorType: 'system', actorName: 'System', action: 'COST_ALERT', entityId: 'Sub-A', tenantName: 'Subsidiary A' },
  { id: '4', timestamp: '2025-02-06 09:30', actorType: 'user', actorName: 'admin@a.com', action: 'ASST_ACTIVATE', entityId: 'Ops-B', tenantName: 'Subsidiary A' },
  { id: '5', timestamp: '2025-02-06 09:28', actorType: 'assistant', actorName: 'Research-F', action: 'HALLUC_FLAG', entityId: 'RPT-89', tenantName: 'Subsidiary C' },
  { id: '6', timestamp: '2025-02-06 09:15', actorType: 'user', actorName: 'legal@b.com', action: 'APPROVE_L4', entityId: 'CTR-15', tenantName: 'Subsidiary B' },
];

export const mockCostData = {
  totalBudget: 10000,
  currentSpend: 3083.25,
  projected: 6450,
  percentUsed: 30.8,
  alertStatus: 'green',
  byProvider: [
    { name: 'OpenAI', budget: 5000, used: 1892.50, percentUsed: 37.8 },
    { name: 'Anthropic', budget: 3000, used: 823.45, percentUsed: 27.4 },
    { name: 'OpenRouter', budget: 2000, used: 367.30, percentUsed: 18.4 },
  ],
  byTenant: [
    { name: 'Subsidiary A', budget: 2500, used: 1234 },
    { name: 'Subsidiary B', budget: 2500, used: 892 },
    { name: 'Subsidiary C', budget: 1500, used: 723 },
    { name: 'Venture Studio', budget: 1000, used: 234 },
  ],
};

export const mockActivityFeed = [
  { id: '1', type: 'success', time: '09:42', message: 'Assistant "Finance-A" completed task INV-2025-0042' },
  { id: '2', type: 'warning', time: '09:38', message: 'Assistant "Legal-C" awaiting approval (L4: Contract review)' },
  { id: '3', type: 'error', time: '09:35', message: 'Cost alert: Subsidiary A at 85% of daily limit' },
  { id: '4', type: 'success', time: '09:30', message: 'Assistant "Ops-B" activated by Admin' },
  { id: '5', type: 'warning', time: '09:28', message: 'Hallucination flag: Assistant "Research-F" (review pending)' },
];
