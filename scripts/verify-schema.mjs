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

async function verifySchema() {
  console.log('Verifying AWGP database schema...\n')
  
  const expectedTables = [
    'tenants',
    'user_profiles', 
    'assistants',
    'work_items',
    'approvals',
    'cost_transactions',
    'audit_logs'
  ]
  
  const results = {}
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        results[table] = { status: '❌', error: error.message }
      } else {
        results[table] = { status: '✅', count: data?.count || 0 }
      }
    } catch (err) {
      results[table] = { status: '❌', error: err.message }
    }
  }
  
  // Display results
  console.log('Table Status:')
  console.log('-'.repeat(50))
  
  for (const [table, result] of Object.entries(results)) {
    const statusStr = result.status === '✅' 
      ? `${result.status} EXIST${result.count !== undefined ? ` (${result.count} rows)` : ''}`
      : `${result.status} MISSING${result.error ? `: ${result.error}` : ''}`
    console.log(`  ${table.padEnd(20)} ${statusStr}`)
  }
  
  console.log('-'.repeat(50))
  
  const successCount = Object.values(results).filter(r => r.status === '✅').length
  const totalCount = expectedTables.length
  
  console.log(`\n${successCount}/${totalCount} tables ready\n`)
  
  if (successCount === totalCount) {
    console.log('✅ All tables created successfully!')
    console.log('\nNext steps:')
    console.log('  1. Pull latest: git pull')
    console.log('  2. Install deps: cd apps/web && npm install')
    console.log('  3. Add env vars: apps/web/.env')
    console.log('  4. Run: npm run dev')
    return true
  } else {
    console.log('⚠️  Some tables may still be creating or there was an error')
    console.log('Check Supabase dashboard → Table Editor to verify')
    return false
  }
}

verifySchema().then(success => {
  process.exit(success ? 0 : 1)
})
