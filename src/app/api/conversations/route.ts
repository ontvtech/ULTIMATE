// ============================================
// SaaSWPP AI Platform - Conversations API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { Conversation } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PAGINATION, CONVERSATION_STATUS } from '@/lib/constants'
import { ApiResponse, PaginatedResponse } from '@/types'

// ============================================
// Validation Schemas
// ============================================

const listConversationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  status: z.enum(['OPEN', 'CLOSED', 'PENDING', 'HANDOFF']).optional(),
  search: z.string().optional(),
  assignedTo: z.string().optional(),
  sortBy: z.enum(['lastMessageAt', 'createdAt']).default('lastMessageAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  aiMode: z.coerce.boolean().optional(),
})

const createConversationSchema = z.object({
  customerId: z.string().cuid(),
  channel: z.enum(['WHATSAPP', 'WEB', 'INSTAGRAM', 'FACEBOOK']).default('WHATSAPP'),
})

// ============================================
// GET Handler - List Conversations
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.currentTenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Não autorizado',
          message: 'Você precisa estar logado para acessar esta recurso.',
        },
        { status: 401 }
      )
    }

    const tenantId = session.user.currentTenantId

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validationResult = listConversationsSchema.safeParse(params)

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

    const { page, limit, status, search, assignedTo, sortBy, sortOrder, aiMode } = validationResult.data

    // Build where clause
    const where: Record<string, unknown> = {
      tenantId,
    }

    if (status) {
      where.status = status
    }

    if (assignedTo !== undefined) {
      where.assignedUserId = assignedTo === 'unassigned' ? null : assignedTo
    }

    if (aiMode !== undefined) {
      where.aiMode = aiMode
    }

    if (search) {
      where.OR = [
        { customer: { name: { contains: search } } },
        { customer: { phoneE164: { contains: search } } },
        { lastMessagePreview: { contains: search } },
      ]
    }

    // Get total count
    const total = await db.conversation.count({ where })

    // Get conversations
    const conversations = await db.conversation.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneE164: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json<PaginatedResponse<Conversation>>(
      {
        success: true,
        data: conversations,
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
    console.error('[Conversations API] GET Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao buscar conversas.',
      },
      { status: 500 }
    )
  }
}

// ============================================
// POST Handler - Create Conversation
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createConversationSchema.safeParse(body)

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

    const { customerId, channel } = validationResult.data

    // Verify customer belongs to tenant
    const customer = await db.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
      },
    })

    if (!customer) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Cliente não encontrado',
          message: 'O cliente informado não foi encontrado.',
        },
        { status: 404 }
      )
    }

    // Check for existing open conversation
    const existingConversation = await db.conversation.findFirst({
      where: {
        tenantId,
        customerId,
        status: { in: [CONVERSATION_STATUS.OPEN, CONVERSATION_STATUS.PENDING] },
      },
    })

    if (existingConversation) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: existingConversation,
          message: 'Já existe uma conversa aberta para este cliente.',
        },
        { status: 200 }
      )
    }

    // Create conversation
    const conversation = await db.conversation.create({
      data: {
        tenantId,
        customerId,
        channel,
        status: CONVERSATION_STATUS.OPEN,
        aiMode: true,
        assignedMode: 'AI',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneE164: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse<typeof conversation>>(
      {
        success: true,
        data: conversation,
        message: 'Conversa criada com sucesso.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Conversations API] POST Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao criar a conversa.',
      },
      { status: 500 }
    )
  }
}
