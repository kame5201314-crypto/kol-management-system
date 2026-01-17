/**
 * Shopee Webhook Handler
 * Receives push notifications from Shopee for orders, products, and inventory updates
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSyncLog } from '@/lib/supabase/database'

const DEFAULT_ORG_ID = 'default'

// Shopee webhook event types
type ShopeeEventType =
  | 'order_status_update'
  | 'tracking_no_update'
  | 'product_update'
  | 'stock_update'
  | 'shop_authorization'

interface ShopeeWebhookPayload {
  shop_id: number
  code: number
  timestamp: number
  data: {
    ordersn?: string
    status?: string
    tracking_no?: string
    item_id?: number
    model_id?: number
    stock?: number
    [key: string]: unknown
  }
}

/**
 * Verify Shopee webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  partnerKey: string
): boolean {
  const baseString = `${partnerKey}${payload}`
  const computedSignature = crypto
    .createHmac('sha256', partnerKey)
    .update(baseString)
    .digest('hex')

  return computedSignature === signature
}

/**
 * Map Shopee event code to event type
 */
function getEventType(code: number): ShopeeEventType {
  const eventMap: Record<number, ShopeeEventType> = {
    3: 'order_status_update',
    4: 'tracking_no_update',
    5: 'product_update',
    7: 'stock_update',
    1: 'shop_authorization',
  }
  return eventMap[code] || 'order_status_update'
}

/**
 * Process order status update
 */
async function handleOrderStatusUpdate(
  shopId: number,
  data: ShopeeWebhookPayload['data']
): Promise<void> {
  const { ordersn, status } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'shopee',
    action: 'webhook_order_status',
    entity_type: 'order',
    entity_id: ordersn,
    status: 'success',
    message: `Order ${ordersn} status updated to ${status}`,
    request_data: { shop_id: shopId, ...data },
  })

  // In production: Update order in database, trigger notifications
}

/**
 * Process tracking number update
 */
async function handleTrackingUpdate(
  shopId: number,
  data: ShopeeWebhookPayload['data']
): Promise<void> {
  const { ordersn, tracking_no } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'shopee',
    action: 'webhook_tracking_update',
    entity_type: 'order',
    entity_id: ordersn,
    status: 'success',
    message: `Tracking number updated: ${tracking_no}`,
    request_data: { shop_id: shopId, ...data },
  })

  // In production: Update order tracking in database
}

/**
 * Process product update
 */
async function handleProductUpdate(
  shopId: number,
  data: ShopeeWebhookPayload['data']
): Promise<void> {
  const { item_id } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'shopee',
    action: 'webhook_product_update',
    entity_type: 'product',
    entity_id: item_id?.toString(),
    status: 'success',
    message: `Product ${item_id} updated on Shopee`,
    request_data: { shop_id: shopId, ...data },
  })

  // In production: Sync product data from Shopee
}

/**
 * Process stock update
 */
async function handleStockUpdate(
  shopId: number,
  data: ShopeeWebhookPayload['data']
): Promise<void> {
  const { item_id, model_id, stock } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'shopee',
    action: 'webhook_stock_update',
    entity_type: 'inventory',
    entity_id: item_id?.toString(),
    status: 'success',
    message: `Stock updated: item ${item_id}, model ${model_id}, new stock: ${stock}`,
    request_data: { shop_id: shopId, ...data },
  })

  // In production: Update local inventory
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('authorization') || ''
    const body = await request.text()

    // Verify signature in production
    const partnerKey = process.env.SHOPEE_PARTNER_KEY || ''
    if (partnerKey && !verifySignature(body, signature, partnerKey)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload: ShopeeWebhookPayload = JSON.parse(body)
    const { shop_id, code, data } = payload
    const eventType = getEventType(code)

    console.log(`[Shopee Webhook] Event: ${eventType}, Shop: ${shop_id}`)

    // Process based on event type
    switch (eventType) {
      case 'order_status_update':
        await handleOrderStatusUpdate(shop_id, data)
        break
      case 'tracking_no_update':
        await handleTrackingUpdate(shop_id, data)
        break
      case 'product_update':
        await handleProductUpdate(shop_id, data)
        break
      case 'stock_update':
        await handleStockUpdate(shop_id, data)
        break
      case 'shop_authorization':
        console.log(`[Shopee Webhook] Shop authorization event for shop ${shop_id}`)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Shopee Webhook] Error:', error)

    await createSyncLog(DEFAULT_ORG_ID, {
      platform: 'shopee',
      action: 'webhook_error',
      entity_type: 'webhook',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle webhook verification (GET request)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const challenge = searchParams.get('challenge')

  if (challenge) {
    return NextResponse.json({ challenge })
  }

  return NextResponse.json({ status: 'Shopee webhook endpoint active' })
}
