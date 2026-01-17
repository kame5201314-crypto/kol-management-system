/**
 * Toast Notification System
 * Client-side notification utilities
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

// Simple toast event system for SSR compatibility
type ToastCallback = (toast: ToastMessage) => void
const listeners: Set<ToastCallback> = new Set()

export function subscribeToToasts(callback: ToastCallback): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function emitToast(toast: ToastMessage): void {
  listeners.forEach((callback) => callback(toast))
}

/**
 * Show a toast notification
 */
export function showToast(
  type: ToastType,
  title: string,
  description?: string,
  duration: number = 5000
): void {
  const toast: ToastMessage = {
    id: crypto.randomUUID(),
    type,
    title,
    description,
    duration,
  }
  emitToast(toast)
}

/**
 * Convenience methods
 */
export const toast = {
  success: (title: string, description?: string) => showToast('success', title, description),
  error: (title: string, description?: string) => showToast('error', title, description),
  warning: (title: string, description?: string) => showToast('warning', title, description),
  info: (title: string, description?: string) => showToast('info', title, description),
}

/**
 * Show sync progress notification
 */
export function showSyncProgress(
  platform: string,
  status: 'started' | 'completed' | 'failed',
  details?: string
): void {
  switch (status) {
    case 'started':
      toast.info(`同步 ${platform}`, details || '正在同步中...')
      break
    case 'completed':
      toast.success(`${platform} 同步完成`, details)
      break
    case 'failed':
      toast.error(`${platform} 同步失敗`, details)
      break
  }
}

/**
 * Show inventory alert notification
 */
export function showInventoryAlert(sku: string, currentStock: number, threshold: number): void {
  if (currentStock === 0) {
    toast.error('庫存不足', `${sku} 已缺貨`)
  } else if (currentStock <= threshold) {
    toast.warning('低庫存警告', `${sku} 庫存僅剩 ${currentStock} 件`)
  }
}

/**
 * Show order notification
 */
export function showOrderNotification(platform: string, orderNumber: string, status: string): void {
  const statusMessages: Record<string, { type: ToastType; message: string }> = {
    pending: { type: 'info', message: '新訂單' },
    confirmed: { type: 'success', message: '訂單已確認' },
    shipped: { type: 'info', message: '訂單已出貨' },
    delivered: { type: 'success', message: '訂單已送達' },
    cancelled: { type: 'warning', message: '訂單已取消' },
    refunded: { type: 'warning', message: '訂單已退款' },
  }

  const { type, message } = statusMessages[status] || { type: 'info', message: status }
  showToast(type, message, `${platform} 訂單 ${orderNumber}`)
}
