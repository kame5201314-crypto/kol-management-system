import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Admin Supabase Client (Service Role)
 * 僅限伺服器端使用，可繞過 RLS
 *
 * ⚠️ 警告：此 client 擁有完整的資料庫權限，請謹慎使用
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
