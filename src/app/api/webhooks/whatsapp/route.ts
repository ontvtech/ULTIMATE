// ============================================
// SaaSWPP AI Platform - WhatsApp Webhook
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getRateLimiter, rateLimitResponse, getIpFromRequest } from '@/lib/rate-limit'
import { RATE_LIMITS, CONVERSATION_STATUS } from '@/lib/constants'
import { WhatsAppWebhookPayload, WhatsAppIncomingMessage, WhatsAppMessageStatusUpdate } from '@/types'

// ============================================
// Configuration
// ============================================

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'swpp_webhook_token'
const rateLimiter = getRateLimiter()

// ============================================
// GET Handler - Webhook Verification (Meta Challenge)
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    // Verify the webhook
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook] Verification successful')
      return new NextResponse(challenge, { status: 200 })
    }

    console.warn('[WhatsApp Webhook] Verification failed', { mode, token })
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 403 }
    )
  } catch (error) {
    console.error('[WhatsApp Webhook GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// POST Handler - Incoming Messages & Status Updates
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const ip = getIpFromRequest(request) || 'unknown'
    const rateLimitResult = rateLimiter.check(ip, {
      windowMs: RATE_LIMITS.WEBHOOK_WHATSAPP.windowMs,
      maxRequests: RATE_LIMITS.WEBHOOK_WHATSAPP.maxRequests,
      keyPrefix: 'wh_whatsapp',
    })

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult)
    }

    // Parse webhook payload
    const payload: WhatsAppWebhookPayload = await request.json()

    // Validate payload structure
    if (!payload.entry || payload.entry.length === 0) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Process each entry
    for (const entry of payload.entry) {
      if (!entry.changes || entry.changes.length === 0) continue

      for (const change of entry.changes) {
        const { value, field } = change

        // Get phone number ID to identify tenant
        const phoneNumberId = value.metadata?.phone_number_id
        if (!phoneNumberId) continue

        // Find tenant by WhatsApp instance
        const whatsappNumber = await db.whatsAppNumber.findFirst({
          where: { id: phoneNumberId },
          include: {
            instance: {
              include: {
                tenant: true,
              },
            },
          },
        })

        if (!whatsappNumber) {
          console.warn('[WhatsApp Webhook] Unknown phone number:', phoneNumberId)
          continue
        }

        const tenantId = whatsappNumber.instance.tenantId

        // Handle different webhook fields
        if (field === 'messages') {
          // Process incoming messages
          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              await processIncomingMessage(tenantId, message, value.contacts)
            }
          }

          // Process status updates
          if (value.statuses && value.statuses.length > 0) {
            for (const status of value.statuses) {
              await processMessageStatus(tenantId, status)
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[WhatsApp Webhook POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Process an incoming WhatsApp message
 */
async function processIncomingMessage(
  tenantId: string,
  message: WhatsAppIncomingMessage,
  contacts?: { profile?: { name?: string }; wa_id: string }[]
): Promise<void> {
  try {
    const customerPhone = message.from
    const customerName = contacts?.[0]?.profile?.name || 'Cliente'

    // Find or create customer
    let customer = await db.customer.findUnique({
      where: {
        tenantId_phoneE164: {
          tenantId,
          phoneE164: customerPhone,
        },
      },
    })

    if (!customer) {
      customer = await db.customer.create({
        data: {
          tenantId,
          name: customerName,
          phoneE164: customerPhone,
          status: 'ACTIVE',
          tags: '[]',
        },
      })
    }

    // Find or create conversation
    let conversation = await db.conversation.findFirst({
      where: {
        tenantId,
        customerId: customer.id,
        status: { in: [CONVERSATION_STATUS.OPEN, CONVERSATION_STATUS.PENDING] },
      },
    })

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          tenantId,
          customerId: customer.id,
          channel: 'WHATSAPP',
          status: CONVERSATION_STATUS.OPEN,
          aiMode: true,
          assignedMode: 'AI',
        },
      })
    }

    // Extract message content based on type
    let content = ''
    let contentType = 'TEXT'

    switch (message.type) {
      case 'text':
        content = message.text?.body || ''
        contentType = 'TEXT'
        break
      case 'image':
        content = message.image?.caption || '[Imagem]'
        contentType = 'IMAGE'
        break
      case 'video':
        content = message.video?.caption || '[Vídeo]'
        contentType = 'VIDEO'
        break
      case 'audio':
        content = '[Áudio]'
        contentType = 'AUDIO'
        break
      case 'document':
        content = message.document?.filename || '[Documento]'
        contentType = 'DOCUMENT'
        break
      case 'location':
        content = message.location?.name || message.location?.address || '[Localização]'
        contentType = 'LOCATION'
        break
      case 'contacts':
        content = message.contacts?.map(c => c.name.formatted_name).join(', ') || '[Contatos]'
        contentType = 'CONTACTS'
        break
      default:
        content = `[${message.type}]`
        contentType = 'UNKNOWN'
    }

    // Store message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        direction: 'INBOUND',
        contentType,
        content,
        provider: 'WHATSAPP',
        providerMessageId: message.id,
        aiGenerated: false,
        status: 'RECEIVED',
      },
    })

    // Update conversation last message
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
        unreadCount: { increment: 1 },
      },
    })

    // Trigger AI response if in AI mode
    if (conversation.aiMode && contentType === 'TEXT') {
      // Queue AI processing (in a real app, this would be a background job)
      queueAIResponse(tenantId, conversation.id, content, customer.name, customerPhone)
    }
  } catch (error) {
    console.error('[Process Message] Error:', error)
  }
}

/**
 * Process a message status update
 */
async function processMessageStatus(
  tenantId: string,
  statusUpdate: WhatsAppMessageStatusUpdate
): Promise<void> {
  try {
    const { id, status, recipient_id } = statusUpdate

    // Update message status
    await db.message.updateMany({
      where: {
        providerMessageId: id,
        conversation: { tenantId },
      },
      data: {
        status: status.toUpperCase(),
      },
    })
  } catch (error) {
    console.error('[Process Status] Error:', error)
  }
}

/**
 * Queue AI response processing
 * In production, this should use a proper job queue (BullMQ, etc.)
 */
function queueAIResponse(
  tenantId: string,
  conversationId: string,
  message: string,
  customerName: string,
  customerPhone: string
): void {
  // Log for now - in production, this would queue a background job
  console.log('[AI Queue]', {
    tenantId,
    conversationId,
    messagePreview: message.substring(0, 50),
    customerName,
    customerPhone,
  })

  // TODO: Implement actual AI processing
  // This would typically:
  // 1. Load AI profile for tenant
  // 2. Load conversation history
  // 3. Load relevant knowledge items
  // 4. Generate AI response using the AI Pool
  // 5. Send response via WhatsApp
  // 6. Store AI response message
}
