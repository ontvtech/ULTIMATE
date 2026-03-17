// ============================================
// SaaSWPP AI Platform - Messages API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PAGINATION, MESSAGE_STATUS } from '@/lib/constants'
import { ApiResponse, PaginatedResponse } from '@/types'

// ============================================
// Route Parameters Schema
// ============================================

const paramsSchema = z.object({
  id: z.string().cuid('ID da conversa inválido'),
})

// ============================================
// Validation Schemas
// ============================================

const listMessagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  before: z.string().cuid().optional(), // Message ID to get messages before
  after: z.string().cuid().optional(), // Message ID to get messages after
})

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(4096, 'Mensagem muito longa'),
  contentType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT']).default('TEXT'),
  mediaId: z.string().optional(), // For media messages, the uploaded media ID
})

// ============================================
// GET Handler - Get Paginated Messages
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.currentTenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Não autorizado',
          message: 'Você precisa estar logado para acessar este recurso.',
        },
        { status: 401 }
      )
    }

    const tenantId = session.user.currentTenantId

    // Validate params
    const paramsResult = paramsSchema.safeParse(await params)
    if (!paramsResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'ID inválido',
          message: 'ID da conversa inválido.',
        },
        { status: 400 }
      )
    }

    const { id: conversationId } = paramsResult.data

    // Verify conversation exists and belongs to tenant
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, tenantId },
      select: { id: true },
    })

    if (!conversation) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Conversa não encontrada',
          message: 'A conversa solicitada não foi encontrada.',
        },
        { status: 404 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validationResult = listMessagesSchema.safeParse(params)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Parâmetros inválidos',
          message: 'Por favor, verifique os parâmetros da requisição.',
        },
        { status: 400 }
      )
    }

    const { page, limit, before, after } = validationResult.data

    // Build where clause
    const where: Record<string, unknown> = {
      conversationId,
    }

    // Handle cursor-based pagination
    if (before) {
      const beforeMessage = await db.message.findUnique({
        where: { id: before },
        select: { createdAt: true },
      })
      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt }
      }
    } else if (after) {
      const afterMessage = await db.message.findUnique({
        where: { id: after },
        select: { createdAt: true },
      })
      if (afterMessage) {
        where.createdAt = { gt: afterMessage.createdAt }
      }
    }

    // Get total count
    const total = await db.message.count({ where: { conversationId } })

    // Get messages
    const messages = await db.message.findMany({
      where,
      orderBy: { createdAt: after ? 'asc' : 'desc' },
      skip: before || after ? 0 : (page - 1) * limit,
      take: limit,
    })

    // Reverse if using after cursor (to maintain order)
    const orderedMessages = after ? messages : messages.reverse()

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json<PaginatedResponse<typeof orderedMessages>>(
      {
        success: true,
        data: orderedMessages,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Messages API] GET Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao buscar mensagens.',
      },
      { status: 500 }
    )
  }
}

// ============================================
// POST Handler - Send New Message
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.currentTenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Não autorizado',
          message: 'Você precisa estar logado para realizar esta ação.',
        },
        { status: 401 }
      )
    }

    const tenantId = session.user.currentTenantId

    // Validate params
    const paramsResult = paramsSchema.safeParse(await params)
    if (!paramsResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'ID inválido',
          message: 'ID da conversa inválido.',
        },
        { status: 400 }
      )
    }

    const { id: conversationId } = paramsResult.data

    // Get conversation with customer info
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneE164: true,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Conversa não encontrada',
          message: 'A conversa solicitada não foi encontrada.',
        },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = sendMessageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Dados inválidos',
          message: 'Por favor, verifique os dados informados.',
        },
        { status: 400 }
      )
    }

    const { content, contentType, mediaId } = validationResult.data

    // Create message in database
    const message = await db.message.create({
      data: {
        conversationId,
        direction: 'OUTBOUND',
        contentType,
        content,
        provider: 'WHATSAPP',
        aiGenerated: false,
        status: MESSAGE_STATUS.PENDING,
      },
    })

    // Update conversation last message
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
      },
    })

    // Queue message for sending via WhatsApp
    // In production, this would be a background job
    queueWhatsAppMessage(tenantId, conversation.customer.phoneE164, {
      type: contentType,
      content,
      mediaId,
    })

    // Update message status to sent (would be updated by webhook in production)
    await db.message.update({
      where: { id: message.id },
      data: { status: MESSAGE_STATUS.SENT },
    })

    return NextResponse.json<ApiResponse<typeof message>>(
      {
        success: true,
        data: { ...message, status: MESSAGE_STATUS.SENT },
        message: 'Mensagem enviada com sucesso.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Messages API] POST Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao enviar a mensagem.',
      },
      { status: 500 }
    )
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Queue message for sending via WhatsApp
 * In production, this would use a job queue like BullMQ
 */
function queueWhatsAppMessage(
  tenantId: string,
  to: string,
  message: { type: string; content: string; mediaId?: string }
): void {
  console.log('[WhatsApp Queue] Message queued:', {
    tenantId,
    to,
    type: message.type,
    preview: message.content.substring(0, 50),
  })

  // TODO: Implement actual WhatsApp sending
  // This would typically:
  // 1. Get the WhatsApp instance for the tenant
  // 2. Use the appropriate provider (Meta Cloud API or Evolution API)
  // 3. Send the message
  // 4. Handle the response and update message status
}
