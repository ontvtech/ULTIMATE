// ============================================
// SaaSWPP AI Platform - Tenant Management API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROLES, PERMISSION_KEYS } from '@/lib/constants'
import { ApiResponse, TenantWithSubscription } from '@/types'

// ============================================
// Validation Schemas
// ============================================

const createTenantSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  tradeName: z.string().max(100).optional(),
  document: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email inválido').optional(),
  timezone: z.string().default('America/Sao_Paulo'),
  planId: z.string().cuid().optional(),
  nicheTemplateId: z.string().cuid().optional(),
  resellerLinkId: z.string().cuid().optional(),
})

// ============================================
// GET Handler - List Tenants for Current User
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Não autorizado',
          message: 'Você precisa estar logado para acessar este recurso.',
        },
        { status: 401 }
      )
    }

    // Get user's tenants from session
    const userTenants = session.user.tenants

    // Get detailed tenant information
    const tenants = await db.tenant.findMany({
      where: {
        id: { in: userTenants.map((ut) => ut.tenantId) },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        tradeName: true,
        document: true,
        phone: true,
        email: true,
        logoUrl: true,
        timezone: true,
        status: true,
        tenantType: true,
        subscriptions: {
          where: {
            status: { in: ['trialing', 'active', 'past_due', 'grace_period'] },
          },
          include: {
            plan: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    // Format response
    const formattedTenants: TenantWithSubscription[] = tenants.map((tenant) => {
      const subscription = tenant.subscriptions[0]
      const userTenant = userTenants.find((ut) => ut.tenantId === tenant.id)

      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        tradeName: tenant.tradeName,
        document: tenant.document,
        phone: tenant.phone,
        email: tenant.email,
        logoUrl: tenant.logoUrl,
        timezone: tenant.timezone,
        status: tenant.status,
        tenantType: tenant.tenantType,
        subscription: subscription
          ? {
              id: subscription.id,
              planId: subscription.planId,
              planName: subscription.plan.name,
              status: subscription.status,
              startedAt: subscription.startedAt,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : undefined,
        userRole: userTenant?.roleName,
      }
    })

    return NextResponse.json<ApiResponse<typeof formattedTenants>>(
      {
        success: true,
        data: formattedTenants,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Tenants API] GET Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao buscar tenants.',
      },
      { status: 500 }
    )
  }
}

// ============================================
// POST Handler - Create New Tenant (Onboarding)
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
    const validationResult = createTenantSchema.safeParse(body)

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

    const { name, tradeName, document, phone, email, timezone, planId, nicheTemplateId, resellerLinkId } =
      validationResult.data

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)

    let slug = baseSlug
    let slugCounter = 1

    while (await db.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${slugCounter}`
      slugCounter++
    }

    // Get plan
    const plan = planId
      ? await db.plan.findUnique({ where: { id: planId } })
      : await db.plan.findFirst({
          where: { slug: 'starter', status: 'ACTIVE' },
          orderBy: { sortOrder: 'asc' },
        })

    // Get LOJISTA role
    const lojistaRole = await db.role.findFirst({
      where: { name: ROLES.LOJISTA },
    })

    if (!lojistaRole) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Erro de configuração',
          message: 'Role não encontrado. Entre em contato com o suporte.',
        },
        { status: 500 }
      )
    }

    // Create tenant and associations in transaction
    const result = await db.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          tradeName,
          document,
          phone,
          email,
          timezone,
          status: 'TRIALING',
          tenantType: 'MERCHANT',
          nicheTemplateId,
        },
      })

      // Create user-tenant association
      await tx.userTenant.create({
        data: {
          userId: session.user.id,
          tenantId: tenant.id,
          roleId: lojistaRole.id,
          isActive: true,
        },
      })

      // Create subscription if plan exists
      if (plan) {
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + (plan.trialDays || 7))

        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            status: 'trialing',
            startedAt: new Date(),
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEnd,
          },
        })
      }

      // Create AI Profile
      await tx.aiProfile.create({
        data: {
          tenantId: tenant.id,
          tone: 'PROFESSIONAL',
          formalityLevel: 50,
          autonomyLevel: 70,
          scopeMode: 'FULL',
          restrictedTopics: '[]',
          handoffPolicy: 'CONFIDENCE',
          handoffKeywords: '[]',
          confidenceThreshold: 0.7,
          workingDays: 'MON,TUE,WED,THU,FRI',
        },
      })

      // Create Meta Wallet
      await tx.metaWallet.create({
        data: {
          tenantId: tenant.id,
          balance: 0,
          currency: 'BRL',
        },
      })

      // Handle reseller attribution if provided
      if (resellerLinkId) {
        const resellerLink = await tx.resellerLink.findUnique({
          where: { id: resellerLinkId },
          include: { reseller: true },
        })

        if (resellerLink) {
          await tx.resellerLeadAttribution.create({
            data: {
              resellerId: resellerLink.resellerId,
              tenantId: tenant.id,
              linkId: resellerLinkId,
            },
          })
        }
      }

      return tenant
    })

    return NextResponse.json<ApiResponse<typeof result>>(
      {
        success: true,
        data: result,
        message: 'Tenant criado com sucesso.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Tenants API] POST Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao criar o tenant.',
      },
      { status: 500 }
    )
  }
}
