/**
 * Momo Webhook Handler
 * Receives push notifications from Momo for orders and inventory updates
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSyncLog } from '@/lib/supabase/database'

const DEFAULT_ORG_ID = 'default'

// Momo webhook event types
type MomoEventType =
  | 'ORDER_CREATED'
  | 'ORDER_PAID'
  | 'ORDER_CANCELLED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'INVENTORY_UPDATE'
  | 'PRODUCT_REVIEW'

interface MomoWebhookPayload {
  event_type: MomoEventType
  merchant_id: string
  timestamp: string
  data: {
    order_id?: string
    order_status?: string
    product_id?: string
    sku?: string
    quantity?: number
    [key: string]: unknown
  }
  signature: string
}

/**
 * Verify Momo webhook signature
 */
function verifySignature(
  payload: Omit<MomoWebhookPayload, 'signature'>,
  signature: string,
  secretKey: string
): boolean {
  const payloadString = JSON.stringify(payload)
  const computedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payloadString)
    .digest('hex')

  return computedSignature === signature
}

/**
 * Process order created event
 */
async function handleOrderCreated(
  merchantId: string,
  data: MomoWebhookPayload['data']
): Promise<void> {
  const { order_id } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'momo',
    action: 'webhook_order_created',
    entity_type: 'order',
    entity_id: order_id,
    status: 'success',
    message: `New order received: ${order_id}`,
    request_data: { merchant_id: merchantId, ...data },
  })

  // In production: Create order in database, reserve inventory
}

/**
 * Process order paid event
 */
async function handleOrderPaid(
  merchantId: string,
  data: MomoWebhookPayload['data']
): Promise<void> {
  const { order_id } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'momo',
    action: 'webhook_order_paid',
    entity_type: 'order',
    entity_id: order_id,
    status: 'success',
    message: `Order payment confirmed: ${order_id}`,
    request_data: { merchant_id: merchantId, ...data },
  })

  // In production: Update order payment status
}

/**
 * Process order status update
 */
async function handleOrderStatusUpdate(
  merchantId: string,
  eventType: string,
  data: MomoWebhookPayload['data']
): Promise<void> {
  const { order_id, order_status } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'momo',
    action: 'webhook_order_status',
    entity_type: 'order',
    entity_id: order_id,
    status: 'success',
    message: `Order ${order_id} status: ${eventType} (${order_status})`,
    request_data: { merchant_id: merchantId, ...data },
  })

  // In production: Update order status in database
}

/**
 * Process inventory update
 */
async function handleInventoryUpdate(
  merchantId: string,
  data: MomoWebhookPayload['data']
): Promise<void> {
  const { product_id, sku, quantity } = data

  await createSyncLog(DEFAULT_ORG_ID, {
    platform: 'momo',
    action: 'webhook_inventory_update',
    entity_type: 'inventory',
    entity_id: product_id || sku,
    status: 'success',
    message: `Inventory updated: ${sku}, quantity: ${quantity}`,
    request_data: { merchant_id: merchantId, ...data },
  })

  // In production: Sync inventory
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MomoWebhookPayload
    const { event_type, merchant_id, data, signature, ...payloadForVerification } = body

    // Verify signature in production
    const secretKey = process.env.MOMO_SECRET_KEY || ''
    if (secretKey) {
      const isValid = verifySignature(
        { event_type, merchant_id, data, ...payloadForVerification },
        signature,
        secretKey
      )
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    console.log(`[Momo Webhook] Event: ${event_type}, Merchant: ${merchant_id}`)

    // Process based on event type
    switch (event_type) {
      case 'ORDER_CREATED':
        await handleOrderCreated(merchant_id, data)
        break
      case 'ORDER_PAID':
        await handleOrderPaid(merchant_id, data)
        break
      case 'ORDER_CANCELLED':
      case 'ORDER_SHIPPED':
      case 'ORDER_DELIVERED':
        await handleOrderStatusUpdate(merchant_id, event_type, data)
        break
      case 'INVENTORY_UPDATE':
        await handleInventoryUpdate(merchant_id, data)
        break
      case 'PRODUCT_REVIEW':
        console.log(`[Momo Webhook] Product review event for merchant ${merchant_id}`)
        break
    }

    return NextResponse.json({ success: true, received: event_type })
  } catch (error) {
    console.error('[Momo Webhook] Error:', error)

    await createSyncLog(DEFAULT_ORG_ID, {
      platform: 'momo',
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

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'Momo webhook endpoint active',
    timestamp: new Date().toISOString(),
  })
}
