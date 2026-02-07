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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function applySchema() {
  console.log('🚀 Applying AWGP schema to Supabase...\n')
  
  try {
    // Read schema SQL
    const schemaPath = join(__dirname, 'supabase-schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')
    
    // Execute SQL using Supabase's rpc or direct query
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL })
    
    if (error) {
      // Try alternative: use the REST API to run SQL
      console.log('⚠️  Using alternative method...')
      
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ query: schemaSQL })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }
    }
    
    console.log('✅ Schema applied successfully!')
    console.log('\n📊 Tables created:')
    console.log('   • tenants')
    console.log('   • user_profiles')
    console.log('   • assistants')
    console.log('   • work_items')
    console.log('   • approvals')
    console.log('   • cost_transactions')
    console.log('   • audit_logs')
    
  } catch (err) {
    console.error('❌ Failed to apply schema:', err.message)
    console.log('\n💡 Alternative: Copy scripts/supabase-schema.sql')
    console.log('   and run it manually in Supabase SQL Editor')
  }
}

applySchema()
