/**
 * Supabase Query Utilities
 * Helper functions for database operations with multi-tenancy support
 */

import { createClient } from './server'

/**
 * Get current session org_id
 * Fetches from Supabase auth session or returns default
 */
export async function getCurrentOrgId(): Promise<string> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      // Get org_id from user metadata or profile
      const orgId = session.user.user_metadata?.org_id
      if (orgId) return orgId

      // Fallback: fetch from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', session.user.id)
        .single()

      if (profile?.org_id) return profile.org_id
    }
  } catch {
    // Silently fall back to default
  }

  // Default org for development/demo
  return 'default'
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | undefined> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id
  } catch {
    return undefined
  }
}

/**
 * Generate insert data with required base fields
 */
export function withBaseFields<T extends object>(
  data: T,
  orgId: string,
  userId?: string
): T & { org_id: string; created_by?: string; updated_by?: string } {
  return {
    ...data,
    org_id: orgId,
    created_by: userId,
    updated_by: userId,
  }
}

/**
 * Generate update data with updated_at and updated_by
 */
export function withUpdateFields<T extends object>(
  data: T,
  userId?: string
): T & { updated_at: string; updated_by?: string } {
  return {
    ...data,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  }
}

/**
 * Standard filter helpers
 */
export const STANDARD_FILTERS = {
  orgId: (orgId: string) => ({ org_id: orgId }),
  notDeleted: () => ({ is_deleted: false }),
  active: () => ({ is_active: true }),
}

/**
 * Pagination helper
 */
export function getPaginationRange(page: number, pageSize: number): { from: number; to: number } {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}

/**
 * Build sort order
 */
export function getSortOrder(
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): { column: string; ascending: boolean } {
  return {
    column: sortBy,
    ascending: sortOrder === 'asc',
  }
}
