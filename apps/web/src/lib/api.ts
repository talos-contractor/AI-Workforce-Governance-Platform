import { supabase } from '../lib/supabase'

// Current tenant ID (would come from auth context in production)
const CURRENT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

// Set tenant context for all queries
async function withTenant() {
  await supabase.rpc('set_tenant_context', { tenant_id: CURRENT_TENANT_ID })
}

// ===== TENANTS =====
export async function getTenants() {
  await withTenant()
  const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })
  return { data, error }
}

export async function createTenant(tenant: any) {
  const { data, error } = await supabase
    .from('tenants')
    .insert(tenant)
    .select()
    .single()
  return { data, error }
}

export async function updateTenant(id: string, updates: any) {
  const { data, error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteTenant(id: string) {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', id)
  return { error }
}

// ===== USER PROFILES =====
export async function getUserProfiles() {
  await withTenant()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, tenants(name)')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getUserProfile(userId: string) {
  await withTenant()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, tenants(name)')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function createUserProfile(profile: any) {
  await withTenant()
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ ...profile, tenant_id: CURRENT_TENANT_ID })
    .select()
    .single()
  return { data, error }
}

export async function updateUserProfile(id: string, updates: any) {
  await withTenant()
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteUserProfile(id: string) {
  await withTenant()
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', id)
  return { error }
}

// ===== ASSISTANTS =====
export async function getAssistants() {
  await withTenant()
  const { data, error } = await supabase
    .from('assistants')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getAssistantById(id: string) {
  await withTenant()
  const { data, error } = await supabase
    .from('assistants')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function createAssistant(assistant: any) {
  await withTenant()
  const { data, error } = await supabase
    .from('assistants')
    .insert({
      ...assistant,
      tenant_id: CURRENT_TENANT_ID,
      soul_md: assistant.soul_md,
      user_md: assistant.user_md,
      tools_md: assistant.tools_md,
      server_host: assistant.server_host
    })
    .select()
    .single()
  return { data, error }
}

export async function updateAssistant(id: string, updates: any) {
  await withTenant()

  // Build update payload with optional file storage fields
  const payload: any = {
    name: updates.name,
    slug: updates.slug,
    type: updates.type,
    risk_tier: updates.risk_tier,
    max_cost_per_day: updates.max_cost_per_day,
    status: updates.status
  }

  // Only include optional file storage fields if provided
  if (updates.soul_md !== undefined) payload.soul_md = updates.soul_md
  if (updates.user_md !== undefined) payload.user_md = updates.user_md
  if (updates.tools_md !== undefined) payload.tools_md = updates.tools_md
  if (updates.server_host !== undefined) payload.server_host = updates.server_host

  const { data, error } = await supabase
    .from('assistants')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) return { data: null, error }
  return { data: data?.[0] || null, error: null }
}

export async function deleteAssistant(id: string) {
  await withTenant()
  const { error } = await supabase
    .from('assistants')
    .delete()
    .eq('id', id)
  return { error }
}

// ===== WORK ITEMS =====
export async function getWorkItems() {
  await withTenant()
  const { data, error } = await supabase
    .from('work_items')
    .select('*, assistants(name)')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getWorkItemById(id: string) {
  await withTenant()
  const { data, error } = await supabase
    .from('work_items')
    .select('*, assistants(*)')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function createWorkItem(workItem: any) {
  await withTenant()
  const { data, error } = await supabase
    .from('work_items')
    .insert({ ...workItem, tenant_id: CURRENT_TENANT_ID })
    .select()
    .single()
  return { data, error }
}

export async function updateWorkItemStatus(id: string, status: string, result?: any) {
  await withTenant()
  const updates: any = { status }
  if (result) updates.result = result
  if (status === 'completed') updates.completed_at = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('work_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// ===== APPROVALS =====
export async function getApprovals(status?: string) {
  await withTenant()
  let query = supabase
    .from('approvals')
    .select('*, work_items(title)')
    .order('created_at', { ascending: false })
  
  if (status) query = query.eq('status', status)
  
  const { data, error } = await query
  return { data, error }
}

export async function getApprovalById(id: string) {
  await withTenant()
  const { data, error } = await supabase
    .from('approvals')
    .select('*, work_items(*)')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function createApproval(approval: any) {
  await withTenant()
  const { data, error } = await supabase
    .from('approvals')
    .insert({ 
      ...approval, 
      tenant_id: CURRENT_TENANT_ID,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    })
    .select()
    .single()
  return { data, error }
}

export async function approveRequest(id: string, userId: string, _notes?: string) {
  await withTenant()
  const { data, error } = await supabase
    .from('approvals')
    .update({
      status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function rejectRequest(id: string, reason: string) {
  await withTenant()
  const { data, error } = await supabase
    .from('approvals')
    .update({
      status: 'rejected',
      rejected_reason: reason
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// ===== COSTS =====
export async function getCostTransactions() {
  await withTenant()
  const { data, error } = await supabase
    .from('cost_transactions')
    .select('*, assistants(name)')
    .order('created_at', { ascending: false })
    .limit(100)
  return { data, error }
}

export async function getCostSummary(_period: 'day' | 'week' | 'month' = 'month') {
  await withTenant()
  
  // Get transactions grouped by day
  const { data, error } = await supabase
    .from('cost_transactions')
    .select('created_at, cost_amount, provider')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  
  if (error) return { data: null, error }
  
  // Calculate summary
  const summary = {
    total: data?.reduce((sum, t) => sum + (t.cost_amount || 0), 0) || 0,
    byProvider: {} as Record<string, number>,
    byDay: {} as Record<string, number>
  }
  
  data?.forEach(t => {
    // By provider
    if (!summary.byProvider[t.provider]) summary.byProvider[t.provider] = 0
    summary.byProvider[t.provider] += t.cost_amount || 0
    
    // By day
    const day = t.created_at.split('T')[0]
    if (!summary.byDay[day]) summary.byDay[day] = 0
    summary.byDay[day] += t.cost_amount || 0
  })
  
  return { data: summary, error: null }
}

// ===== AUDIT LOGS =====
export async function getAuditLogs(limit = 100) {
  await withTenant()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
  return { data, error }
}

// ===== REAL-TIME SUBSCRIPTIONS =====
export function subscribeToApprovals(callback: (payload: any) => void) {
  return supabase
    .channel('approvals-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'approvals',
        filter: `tenant_id=eq.${CURRENT_TENANT_ID}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToWorkItems(callback: (payload: any) => void) {
  return supabase
    .channel('work-items-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'work_items',
        filter: `tenant_id=eq.${CURRENT_TENANT_ID}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToAssistants(callback: (payload: any) => void) {
  return supabase
    .channel('assistants-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'assistants',
        filter: `tenant_id=eq.${CURRENT_TENANT_ID}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToCostTransactions(callback: (payload: any) => void) {
  return supabase
    .channel('cost-transactions-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cost_transactions',
        filter: `tenant_id=eq.${CURRENT_TENANT_ID}`
      },
      callback
    )
    .subscribe()
}
