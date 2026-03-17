// ============================================
// SaaSWPP AI Platform - Single Conversation API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { CONVERSATION_STATUS } from '@/lib/constants'
import { ApiResponse } from '@/types'

// ============================================
// Route Parameters Schema
// ============================================

const paramsSchema = z.object({
  id: z.string().cuid('ID da conversa inválido'),
})

// ============================================
// Validation Schemas
// ============================================

const updateConversationSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'PENDING', 'HANDOFF']).optional(),
  assignedUserId: z.string().nullable().optional(),
  aiMode: z.boolean().optional(),
  assignedMode: z.enum(['AI', 'HUMAN', 'HYBRID']).optional(),
})

// ============================================
// GET Handler - Get Conversation with Messages
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

    const { id } = paramsResult.data

    // Get conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneE164: true,
            email: true,
            status: true,
            totalOrders: true,
            totalSpent: true,
            lastOrderAt: true,
            tags: true,
            createdAt: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100, // Get last 100 messages
          select: {
            id: true,
            direction: true,
            contentType: true,
            content: true,
            aiGenerated: true,
            status: true,
            createdAt: true,
          },
        },
        handoffs: {
          where: {
            status: { in: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
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

    // Reset unread count
    await db.conversation.update({
      where: { id },
      data: { unreadCount: 0 },
    })

    return NextResponse.json<ApiResponse<typeof conversation>>(
      {
        success: true,
        data: conversation,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Conversation API] GET Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao buscar a conversa.',
      },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH Handler - Update Conversation
// ============================================

export async function PATCH(
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

    const { id } = paramsResult.data

    // Verify conversation exists and belongs to tenant
    const existingConversation = await db.conversation.findFirst({
      where: { id, tenantId },
    })

    if (!existingConversation) {
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
    const validationResult = updateConversationSchema.safeParse(body)

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

    const updateData = validationResult.data

    // If assigning to a user, verify they exist and belong to tenant
    if (updateData.assignedUserId) {
      const userTenant = await db.userTenant.findFirst({
        where: {
          userId: updateData.assignedUserId,
          tenantId,
          isActive: true,
        },
      })

      if (!userTenant) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Usuário inválido',
            message: 'O usuário informado não pertence a este tenant.',
          },
          { status: 400 }
        )
      }
    }

    // Handle status changes
    if (updateData.status === CONVERSATION_STATUS.HANDOFF && existingConversation.status !== CONVERSATION_STATUS.HANDOFF) {
      // Create handoff record
      await db.handoff.create({
        data: {
          tenantId,
          conversationId: id,
          reason: 'Manual handoff requested',
          status: 'REQUESTED',
          priority: 'NORMAL',
          requestedBy: session.user.id,
          assignedTo: updateData.assignedUserId,
        },
      })
    }

    // Update conversation
    const conversation = await db.conversation.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json<ApiResponse<typeof conversation>>(
      {
        success: true,
        data: conversation,
        message: 'Conversa atualizada com sucesso.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Conversation API] PATCH Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao atualizar a conversa.',
      },
      { status: 500 }
    )
  }
}
