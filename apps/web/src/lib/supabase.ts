import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging (remove in production)
console.log('DEBUG: Supabase URL:', supabaseUrl ? 'Set (hidden)' : 'MISSING')
console.log('DEBUG: Supabase Key:', supabaseKey ? 'Set (hidden)' : 'MISSING')

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase environment variables!')
  console.error('Make sure apps/web/.env has:')
  console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co')
  console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key')
}

// Create client even if env vars missing (will fail gracefully later)
export const supabase = createClient(
  supabaseUrl || 'http://localhost',
  supabaseKey || 'dummy-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// Helper to set tenant context for RLS
export async function setTenantContext(tenantId: string) {
  try {
    await supabase.rpc('set_tenant_context', { tenant_id: tenantId })
  } catch (err) {
    console.error('DEBUG: Failed to set tenant context:', err)
    throw err
  }
}

// Get current user with profile
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return { ...user, profile }
  } catch (err) {
    console.error('DEBUG: getCurrentUser error:', err)
    return null
  }
}

// Sign in
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

// Sign out
export async function signOut() {
  return supabase.auth.signOut()
}
