// Environment variables check script
console.log('=== Environment Variables Check ===')

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

let allPresent = true

requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
    allPresent = false
  }
})

console.log('\n=== Summary ===')
if (allPresent) {
  console.log('✅ All required environment variables are set')
} else {
  console.log('❌ Some environment variables are missing')
  console.log('\nPlease set the following environment variables in Vercel:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY') 
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
} 