import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function cleanup() {
  console.log('Cleaning up old mock data...')
  
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    console.error('Error cleaning up:', error)
  } else {
    console.log('Successfully cleared old mock data!')
  }
}

cleanup()
