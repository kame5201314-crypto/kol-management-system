import { createBrowserClient } from '@supabase/ssr'

/**
 * 瀏覽器端 Supabase Client
 * 用於客戶端元件中的資料操作
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
