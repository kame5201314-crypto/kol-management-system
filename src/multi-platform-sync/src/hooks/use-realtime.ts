'use client'

/**
 * Real-time Data Hooks
 * Supabase real-time subscriptions for live updates
 */

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions<T> {
  table: string
  schema?: string
  event?: ChangeEvent
  filter?: string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T, oldRecord?: T) => void
  onDelete?: (payload: T) => void
}

/**
 * Hook for real-time table subscriptions
 */
export function useRealtime<T extends Record<string, unknown>>({
  table,
  schema = 'sync',
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOptions<T>) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const setupSubscription = () => {
      const channelName = `realtime:${schema}:${table}:${Date.now()}`

      channel = supabase.channel(channelName)

      const subscriptionConfig: {
        event: ChangeEvent
        schema: string
        table: string
        filter?: string
      } = {
        event,
        schema,
        table,
      }

      if (filter) {
        subscriptionConfig.filter = filter
      }

      channel
        .on(
          'postgres_changes' as never,
          subscriptionConfig as never,
          (payload: RealtimePostgresChangesPayload<T>) => {
            const newRecord = payload.new as T
            const oldRecord = payload.old as T

            switch (payload.eventType) {
              case 'INSERT':
                onInsert?.(newRecord)
                break
              case 'UPDATE':
                onUpdate?.(newRecord, oldRecord)
                break
              case 'DELETE':
                onDelete?.(oldRecord)
                break
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setError(null)
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false)
            setError('Failed to connect to real-time updates')
          }
        })
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, schema, event, filter, onInsert, onUpdate, onDelete])

  return { isConnected, error }
}

/**
 * Hook for real-time sync job progress
 */
export function useSyncJobProgress(jobId: string | null) {
  const [progress, setProgress] = useState<{
    status: string
    progress: number
    processedItems: number
    failedItems: number
    totalItems: number
  } | null>(null)

  useRealtime<{
    id: string
    status: string
    progress: number
    processed_items: number
    failed_items: number
    total_items: number
  }>({
    table: 'sync_jobs',
    filter: jobId ? `id=eq.${jobId}` : undefined,
    onUpdate: (payload) => {
      if (payload.id === jobId) {
        setProgress({
          status: payload.status,
          progress: payload.progress,
          processedItems: payload.processed_items,
          failedItems: payload.failed_items,
          totalItems: payload.total_items,
        })
      }
    },
  })

  return progress
}

/**
 * Hook for real-time order notifications
 */
export function useOrderNotifications(orgId: string, onNewOrder?: (order: unknown) => void) {
  useRealtime<{ id: string; org_id: string; order_number: string; platform: string; status: string }>({
    table: 'orders',
    filter: `org_id=eq.${orgId}`,
    event: 'INSERT',
    onInsert: (order) => {
      onNewOrder?.(order)
    },
  })
}

/**
 * Hook for real-time inventory alerts
 */
export function useInventoryAlerts(
  orgId: string,
  onLowStock?: (item: { sku: string; available_stock: number; low_stock_threshold: number }) => void
) {
  useRealtime<{
    id: string
    org_id: string
    sku: string
    total_stock: number
    reserved_stock: number
    low_stock_threshold: number
  }>({
    table: 'inventory',
    filter: `org_id=eq.${orgId}`,
    event: 'UPDATE',
    onUpdate: (item) => {
      const availableStock = item.total_stock - item.reserved_stock
      if (availableStock <= item.low_stock_threshold) {
        onLowStock?.({
          sku: item.sku,
          available_stock: availableStock,
          low_stock_threshold: item.low_stock_threshold,
        })
      }
    },
  })
}

/**
 * Hook for real-time platform connection status
 */
export function usePlatformConnectionStatus(orgId: string) {
  const [connections, setConnections] = useState<Map<string, boolean>>(new Map())

  const updateConnection = useCallback(
    (id: string, isConnected: boolean) => {
      setConnections((prev) => {
        const next = new Map(prev)
        next.set(id, isConnected)
        return next
      })
    },
    []
  )

  useRealtime<{ id: string; org_id: string; is_connected: boolean }>({
    table: 'platform_connections',
    filter: `org_id=eq.${orgId}`,
    onUpdate: (connection) => {
      updateConnection(connection.id, connection.is_connected)
    },
  })

  return connections
}
