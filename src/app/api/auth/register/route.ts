// ============================================
// SaaSWPP AI Platform - User Registration API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { getRateLimiter, rateLimitResponse, getIpFromRequest } from '@/lib/rate-limit'
import { RATE_LIMITS, ROLES } from '@/lib/constants'
import { ApiResponse } from '@/types'

// ============================================
// Validation Schema
// ============================================

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Telefone inválido').max(20),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

// ============================================
// Rate Limiter
// ============================================

const rateLimiter = getRateLimiter()

// ============================================
// POST Handler - User Registration
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const ip = getIpFromRequest(request) || 'unknown'
    const rateLimitResult = rateLimiter.check(ip, {
      windowMs: RATE_LIMITS.API_AUTH.windowMs,
      maxRequests: RATE_LIMITS.API_AUTH.maxRequests,
      keyPrefix: 'register',
    })

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult)
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      const errors: Record<string, string[]> = {}
      validationResult.error.issues.forEach((err) => {
        const field = err.path.join('.')
        if (!errors[field]) {
          errors[field] = []
        }
        errors[field].push(err.message)
      })

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Dados inválidos',
          message: 'Por favor, corrija os erros no formulário',
        },
        { status: 400 }
      )
    }

    const { name, email, password, companyName, phone } = validationResult.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Email já cadastrado',
          message: 'Este email já está em uso. Por favor, faça login ou use outro email.',
        },
        { status: 409 }
      )
    }

    // Generate unique slug for tenant
    const baseSlug = companyName
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

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

    // Get default plan (trialing)
    const defaultPlan = await db.plan.findFirst({
      where: { slug: 'starter' },
      orderBy: { sortOrder: 'asc' },
    })

    // Create user, tenant, and subscription in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone,
          status: 'ACTIVE',
        },
      })

      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          slug,
          phone,
          email,
          status: 'TRIALING',
          tenantType: 'MERCHANT',
        },
      })

      // Create user-tenant association
      await tx.userTenant.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          roleId: lojistaRole.id,
          isActive: true,
        },
      })

      // Create subscription if default plan exists
      if (defaultPlan) {
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + (defaultPlan.trialDays || 7))

        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: defaultPlan.id,
            status: 'trialing',
            startedAt: new Date(),
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEnd,
          },
        })
      }

      // Create AI Profile with defaults
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

      return { user, tenant }
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          userId: result.user.id,
          tenantId: result.tenant.id,
          tenantSlug: result.tenant.slug,
        },
        message: 'Conta criada com sucesso! Você pode fazer login agora.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Register API] Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
      },
      { status: 500 }
    )
  }
}
