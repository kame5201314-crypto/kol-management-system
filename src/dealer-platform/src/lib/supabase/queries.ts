/**
 * 多租戶查詢輔助函式
 * 自動加入 org_id 過濾與軟刪除條件
 *
 * 使用範例：
 * const query = supabase.from('suppliers').select('*')
 * const filteredQuery = withOrgFilter(query, orgId)
 */
export function withOrgFilter<T>(
  query: T & { eq: (column: string, value: unknown) => T },
  orgId: string
): T {
  return (query as any).eq('org_id', orgId).eq('is_deleted', false)
}

/**
 * 從 Session 取得當前組織 ID
 * TODO: 實作真實的 session 邏輯
 */
export async function getCurrentOrgId(): Promise<string> {
  // 這裡應該從實際的 session 中取得 org_id
  // 目前暫時回傳 'default'，待認證系統建立後更新
  return 'default'
}

/**
 * 取得當前使用者 ID
 * TODO: 實作真實的 session 邏輯
 */
export async function getCurrentUserId(): Promise<string | null> {
  // 這裡應該從實際的 session 中取得 user_id
  return null
}
