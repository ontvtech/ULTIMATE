// ============================================
// SaaSWPP AI Platform - Billing Webhook (Iugu)
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SUBSCRIPTION_STATUS, TENANT_STATUS } from '@/lib/constants'

// ============================================
// Types
// ============================================

interface IuguWebhookEvent {
  event: string
  data: {
    id: string
    status?: string
    subscription_id?: string
    customer_id?: string
    amount?: number
    currency?: string
    due_date?: string
    paid_at?: string
    secure_url?: string
    pdf?: string
    errors?: string
    plan_identifier?: string
    suspended?: boolean
    active?: boolean
  }
}

// ============================================
// POST Handler - Iugu Webhook Events
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify webhook signature if configured
    const signature = request.headers.get('x-iugu-signature')
    // TODO: Implement signature verification for production

    // Parse webhook payload
    const payload: IuguWebhookEvent = await request.json()
    const { event, data } = payload

    console.log('[Billing Webhook] Event received:', event, data.id)

    // Route to appropriate handler
    switch (event) {
      case 'invoice.created':
        await handleInvoiceCreated(data)
        break

      case 'invoice.status_changed':
        await handleInvoiceStatusChanged(data)
        break

      case 'invoice.paid':
        await handleInvoicePaid(data)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(data)
        break

      case 'invoice.refund':
        await handleInvoiceRefund(data)
        break

      case 'subscription.created':
        await handleSubscriptionCreated(data)
        break

      case 'subscription.suspended':
        await handleSubscriptionSuspended(data)
        break

      case 'subscription.activated':
        await handleSubscriptionActivated(data)
        break

      case 'subscription.renewed':
        await handleSubscriptionRenewed(data)
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled(data)
        break

      default:
        console.log('[Billing Webhook] Unhandled event:', event)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Billing Webhook] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// Invoice Event Handlers
// ============================================

/**
 * Handle invoice.created event
 */
async function handleInvoiceCreated(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    if (!data.subscription_id) return

    // Find subscription by provider ID
    const subscription = await db.subscription.findFirst({
      where: { providerSubscriptionId: data.subscription_id },
    })

    if (!subscription) return

    // Create invoice record
    await db.invoice.create({
      data: {
        subscriptionId: subscription.id,
        providerInvoiceId: data.id,
        status: 'PENDING',
        amount: (data.amount || 0) / 100, // Convert from cents
        currency: data.currency || 'BRL',
        dueDate: data.due_date ? new Date(data.due_date) : new Date(),
        paymentUrl: data.secure_url,
        pdfUrl: data.pdf,
      },
    })

    console.log('[Billing Webhook] Invoice created:', data.id)
  } catch (error) {
    console.error('[Invoice Created] Error:', error)
  }
}

/**
 * Handle invoice.status_changed event
 */
async function handleInvoiceStatusChanged(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    // Find invoice by provider ID
    const invoice = await db.invoice.findFirst({
      where: { providerInvoiceId: data.id },
    })

    if (!invoice) return

    // Update invoice status
    await db.invoice.update({
      where: { id: invoice.id },
      data: {
        status: mapInvoiceStatus(data.status),
      },
    })

    console.log('[Billing Webhook] Invoice status changed:', data.id, data.status)
  } catch (error) {
    console.error('[Invoice Status Changed] Error:', error)
  }
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    // Find invoice by provider ID
    const invoice = await db.invoice.findFirst({
      where: { providerInvoiceId: data.id },
      include: {
        subscription: {
          include: { tenant: true },
        },
      },
    })

    if (!invoice) return

    // Update invoice and subscription in transaction
    await db.$transaction(async (tx) => {
      // Update invoice
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PAID',
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        },
      })

      // Update subscription status
      await tx.subscription.update({
        where: { id: invoice.subscriptionId },
        data: {
          status: 'active',
          suspendedAt: null,
          reactivatedAt: new Date(),
        },
      })

      // Update tenant status
      await tx.tenant.update({
        where: { id: invoice.subscription.tenantId },
        data: {
          status: 'ACTIVE',
        },
      })
    })

    console.log('[Billing Webhook] Invoice paid:', data.id)
  } catch (error) {
    console.error('[Invoice Paid] Error:', error)
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    // Find invoice by provider ID
    const invoice = await db.invoice.findFirst({
      where: { providerInvoiceId: data.id },
      include: {
        subscription: {
          include: { tenant: true },
        },
      },
    })

    if (!invoice) return

    // Update invoice and subscription in transaction
    await db.$transaction(async (tx) => {
      // Update invoice
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'FAILED',
        },
      })

      // Update subscription status
      await tx.subscription.update({
        where: { id: invoice.subscriptionId },
        data: {
          status: 'past_due',
        },
      })

      // Calculate grace period end
      const graceEnd = new Date()
      graceEnd.setDate(graceEnd.getDate() + 5) // 5 days grace period

      // Update tenant to grace period
      await tx.tenant.update({
        where: { id: invoice.subscription.tenantId },
        data: {
          status: 'GRACE_PERIOD',
        },
      })

      // Create operational alert
      await tx.operationalAlert.create({
        data: {
          tenantId: invoice.subscription.tenantId,
          type: 'PAYMENT_FAILED',
          severity: 'HIGH',
          status: 'OPEN',
          title: 'Falha no Pagamento',
          description: `Falha no pagamento da fatura ${data.id}. Verifique o método de pagamento.`,
        },
      })
    })

    console.log('[Billing Webhook] Payment failed:', data.id)
  } catch (error) {
    console.error('[Payment Failed] Error:', error)
  }
}

/**
 * Handle invoice.refund event
 */
async function handleInvoiceRefund(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    // Find invoice by provider ID
    const invoice = await db.invoice.findFirst({
      where: { providerInvoiceId: data.id },
    })

    if (!invoice) return

    // Update invoice status
    await db.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'REFUNDED',
      },
    })

    console.log('[Billing Webhook] Invoice refunded:', data.id)
  } catch (error) {
    console.error('[Invoice Refund] Error:', error)
  }
}

// ============================================
// Subscription Event Handlers
// ============================================

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(data: IuguWebhookEvent['data']): Promise<void> {
  console.log('[Billing Webhook] Subscription created:', data.id)
  // Usually handled during registration, but could be used for manual subscriptions
}

/**
 * Handle subscription.suspended event
 */
async function handleSubscriptionSuspended(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    const subscription = await db.subscription.findFirst({
      where: { providerSubscriptionId: data.id },
      include: { tenant: true },
    })

    if (!subscription) return

    await db.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'suspended',
          suspendedAt: new Date(),
        },
      })

      await tx.tenant.update({
        where: { id: subscription.tenantId },
        data: {
          status: 'SUSPENDED',
        },
      })

      await tx.operationalAlert.create({
        data: {
          tenantId: subscription.tenantId,
          type: 'PAYMENT_FAILED',
          severity: 'CRITICAL',
          status: 'OPEN',
          title: 'Assinatura Suspensa',
          description: 'A assinatura foi suspensa por falta de pagamento.',
        },
      })
    })

    console.log('[Billing Webhook] Subscription suspended:', data.id)
  } catch (error) {
    console.error('[Subscription Suspended] Error:', error)
  }
}

/**
 * Handle subscription.activated event
 */
async function handleSubscriptionActivated(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    const subscription = await db.subscription.findFirst({
      where: { providerSubscriptionId: data.id },
      include: { tenant: true },
    })

    if (!subscription) return

    await db.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          suspendedAt: null,
          reactivatedAt: new Date(),
        },
      })

      await tx.tenant.update({
        where: { id: subscription.tenantId },
        data: {
          status: 'ACTIVE',
        },
      })
    })

    console.log('[Billing Webhook] Subscription activated:', data.id)
  } catch (error) {
    console.error('[Subscription Activated] Error:', error)
  }
}

/**
 * Handle subscription.renewed event
 */
async function handleSubscriptionRenewed(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    const subscription = await db.subscription.findFirst({
      where: { providerSubscriptionId: data.id },
    })

    if (!subscription) return

    // Update subscription period
    const now = new Date()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    })

    console.log('[Billing Webhook] Subscription renewed:', data.id)
  } catch (error) {
    console.error('[Subscription Renewed] Error:', error)
  }
}

/**
 * Handle subscription.canceled event
 */
async function handleSubscriptionCanceled(data: IuguWebhookEvent['data']): Promise<void> {
  try {
    const subscription = await db.subscription.findFirst({
      where: { providerSubscriptionId: data.id },
      include: { tenant: true },
    })

    if (!subscription) return

    await db.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'canceled',
          canceledAt: new Date(),
          cancelAtPeriodEnd: false,
        },
      })

      await tx.tenant.update({
        where: { id: subscription.tenantId },
        data: {
          status: 'CANCELED',
        },
      })
    })

    console.log('[Billing Webhook] Subscription canceled:', data.id)
  } catch (error) {
    console.error('[Subscription Canceled] Error:', error)
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Map Iugu invoice status to our status
 */
function mapInvoiceStatus(status?: string): string {
  const statusMap: Record<string, string> = {
    pending: 'PENDING',
    paid: 'PAID',
    canceled: 'CANCELED',
    refunded: 'REFUNDED',
    expired: 'EXPIRED',
    failed: 'FAILED',
  }

  return statusMap[status || 'pending'] || 'PENDING'
}
