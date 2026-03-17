// ============================================
// SaaSWPP AI Platform - Switch Tenant API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ApiResponse } from '@/types'

// ============================================
// Validation Schema
// ============================================

const switchTenantSchema = z.object({
  tenantId: z.string().cuid('ID do tenant inválido'),
})

// ============================================
// POST Handler - Switch Active Tenant
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Não autorizado',
          message: 'Você precisa estar logado para realizar esta ação.',
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = switchTenantSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Dados inválidos',
          message: 'ID do tenant inválido.',
        },
        { status: 400 }
      )
    }

    const { tenantId } = validationResult.data

    // Verify user has access to this tenant
    const userTenant = await db.userTenant.findFirst({
      where: {
        userId: session.user.id,
        tenantId,
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!userTenant) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Acesso negado',
          message: 'Você não tem acesso a este tenant.',
        },
        { status: 403 }
      )
    }

    // Check tenant status
    if (userTenant.tenant.status === 'SUSPENDED' || userTenant.tenant.status === 'CANCELED') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Tenant indisponível',
          message: 'Este tenant está suspenso ou cancelado.',
        },
        { status: 403 }
      )
    }

    // Return success with tenant info
    // Note: The actual session update is handled client-side via update() method
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          tenantId: userTenant.tenant.id,
          tenantName: userTenant.tenant.name,
          tenantSlug: userTenant.tenant.slug,
          tenantStatus: userTenant.tenant.status,
          roleId: userTenant.role.id,
          roleName: userTenant.role.name,
        },
        message: 'Tenant alterado com sucesso.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Switch Tenant API] Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao processar sua solicitação.',
      },
      { status: 500 }
    )
  }
}
