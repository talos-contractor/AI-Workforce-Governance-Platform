import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function testConnection() {
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('tenants')
      .select('count')
      .single()
    
    if (error && error.code === '42P01') {
      console.log('✅ Connected to Supabase')
      console.log('ℹ️  Database tables do not exist yet - need to run schema')
      return true
    } else if (error) {
      console.error('❌ Error:', error.message)
      return false
    } else {
      console.log('✅ Connected and tables exist')
      return true
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return false
  }
}

testConnection()
