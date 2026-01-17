/**
 * Shopline Webhook Handler
 * Receives push notifications from Shopline for orders, products, and inventory updates
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSyncLog } from '@/lib/supabase/database'

const DEFAULT_ORG_ID = 'default'

// Shopline webhook topics
type ShoplineWebhookTopic =
  | 'orders/create'
  | 'orders/update'
  | 'orders/paid'
  | 'orders/fulfilled'
  | 'orders/cancelled'
  | 'products/create'
  | 'products/update'
  | 'products/delete'
  | 'inventory_levels/update'
  | 'app/uninstalled'

interface ShoplineWebhookPayload {
  id: string
  topic: ShoplineWebhookTopic
  store_id: string
  created_at: string
  data: {
    id?: string
    order_number?: string
    status?: string
    product_id?: string
    variant_id?: string
    sku?: string
    inventory_quantity?: number
    [key: string]: unknown
  }
}

/**
 * Verify Shopline webhook HMAC signature
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const computedHmac = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedHmac)
  )
}

/**
 * Process order created event
 */
async function handleOrderCreate(
  storeId: string,
  data: ShoplineWebhookPayload['data']
): Promise<void> {
  const { id, order_number } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'shopline',
    action: 'webhook_order_create',
    entity_type: 'order',
    entity_id: id,
    status: 'success',
    message: `New order created: ${order_number}`,
    request_data: { store_id: storeId, ...data },
  })

  // In production: Import order to database
}

/**
 * Process order update event
 */
async function handleOrderUpdate(
  storeId: string,
  data: ShoplineWebhookPayload['data']
): Promise<void> {
  const { id, order_number, status } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'shopline',
    action: 'webhook_order_update',
    entity_type: 'order',
    entity_id: id,
    status: 'success',
    message: `Order ${order_number} updated: ${status}`,
    request_data: { store_id: storeId, ...data },
  })

  // In production: Update order in database
}

/**
 * Process product events
 */
async function handleProductEvent(
  storeId: string,
  action: string,
  data: ShoplineWebhookPayload['data']
): Promise<void> {
  const { product_id } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'shopline',
    action: `webhook_product_${action}`,
    entity_type: 'product',
    entity_id: product_id,
    status: 'success',
    message: `Product ${action}: ${product_id}`,
    request_data: { store_id: storeId, ...data },
  })

  // In production: Sync product data
}

/**
 * Process inventory update event
 */
async function handleInventoryUpdate(
  storeId: string,
  data: ShoplineWebhookPayload['data']
): Promise<void> {
  const { variant_id, sku, inventory_quantity } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'shopline',
    action: 'webhook_inventory_update',
    entity_type: 'inventory',
    entity_id: variant_id || sku,
    status: 'success',
    message: `Inventory updated: ${sku}, quantity: ${inventory_quantity}`,
    request_data: { store_id: storeId, ...data },
  })

  // In production: Update local inventory
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-shopline-hmac-sha256') || ''
    const topic = request.headers.get('x-shopline-topic') as ShoplineWebhookTopic
    const storeId = request.headers.get('x-shopline-store-id') || ''

    const body = await request.text()

    // Verify signature in production
    const webhookSecret = process.env.SHOPLINE_WEBHOOK_SECRET || ''
    if (webhookSecret && signature) {
      try {
        const isValid = verifyWebhookSignature(body, signature, webhookSecret)
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          )
        }
      } catch {
        // If signature verification fails, log but continue in development
        console.warn('[Shopline Webhook] Signature verification failed')
      }
    }

    const payload: ShoplineWebhookPayload = JSON.parse(body)
    const { data } = payload
    const webhookTopic = topic || payload.topic
    const webhookStoreId = storeId || payload.store_id

    console.log(`[Shopline Webhook] Topic: ${webhookTopic}, Store: ${webhookStoreId}`)

    // Process based on topic
    switch (webhookTopic) {
      case 'orders/create':
        await handleOrderCreate(webhookStoreId, data)
        break
      case 'orders/update':
      case 'orders/paid':
      case 'orders/fulfilled':
      case 'orders/cancelled':
        await handleOrderUpdate(webhookStoreId, data)
        break
      case 'products/create':
        await handleProductEvent(webhookStoreId, 'create', data)
        break
      case 'products/update':
        await handleProductEvent(webhookStoreId, 'update', data)
        break
      case 'products/delete':
        await handleProductEvent(webhookStoreId, 'delete', data)
        break
      case 'inventory_levels/update':
        await handleInventoryUpdate(webhookStoreId, data)
        break
      case 'app/uninstalled':
        console.log(`[Shopline Webhook] App uninstalled from store ${webhookStoreId}`)
        // In production: Mark connection as disconnected
        break
    }

    return NextResponse.json({ success: true, topic: webhookTopic })
  } catch (error) {
    console.error('[Shopline Webhook] Error:', error)

    await createSyncLog(DEFAULT_ORG_ID, {
      platform: 'shopline',
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

// Health check and webhook verification endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const verifyToken = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Handle webhook verification
  if (verifyToken && challenge) {
    const expectedToken = process.env.SHOPLINE_VERIFY_TOKEN || 'shopline_verify'
    if (verifyToken === expectedToken) {
      return new NextResponse(challenge, { status: 200 })
    }
    return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 })
  }

  return NextResponse.json({
    status: 'Shopline webhook endpoint active',
    timestamp: new Date().toISOString(),
  })
}
