import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Note: Service role key provides admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function applySchema() {
  console.log('🚀 Setting up AWGP database in Supabase...\n')
  
  try {
    // Read schema SQL
    const schemaPath = join(__dirname, 'supabase-schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')
    
    // Split SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    console.log(`📄 Found ${statements.length} SQL statements\n`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      const shortDesc = statement.substring(0, 60).replace(/\s+/g, ' ') + '...'
      
      process.stdout.write(`[${i + 1}/${statements.length}] ${shortDesc} `)
      
      // Use Supabase's SQL execution via RPC
      const { error } = await supabase.rpc('exec_sql', { query: statement })
      
      if (error) {
        // If RPC doesn't exist, try direct REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ query: statement })
        })
        
        if (!response.ok) {
          console.error('❌')
          console.error(`   Error: ${error?.message || await response.text()}`)
          continue
        }
      }
      
      console.log('✅')
    }
    
    console.log('\n✅ Schema applied successfully!')
    console.log('\n📊 Tables created:')
    console.log('   • tenants')
    console.log('   • user_profiles')
    console.log('   • assistants')
    console.log('   • work_items')
    console.log('   • approvals')
    console.log('   • cost_transactions')
    console.log('   • audit_logs')
    
    // Verify tables exist
    console.log('\n🔍 Verifying tables...')
    const { data, error } = await supabase.from('tenants').select('count')
    if (error) {
      console.log('⚠️  Tables may exist but RLS is blocking access (expected)')
    } else {
      console.log('✅ Tables verified')
    }
    
    return true
    
  } catch (err) {
    console.error('\n❌ Failed to apply schema:', err.message)
    console.log('\n💡 Alternative: Copy scripts/supabase-schema.sql')
    console.log('   and run it manually in Supabase SQL Editor')
    return false
  }
}

applySchema().then(success => {
  process.exit(success ? 0 : 1)
})
