// ============================================
// SaaSWPP AI Platform - Customer API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { Customer } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PAGINATION } from '@/lib/constants'
import { ApiResponse, PaginatedResponse } from '@/types'

// ============================================
// Validation Schemas
// ============================================

const listCustomersSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().optional(),
  status: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  sortBy: z.enum(['name', 'createdAt', 'totalSpent', 'lastOrderAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minSpent: z.coerce.number().optional(),
  maxSpent: z.coerce.number().optional(),
})

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phoneE164: z.string().min(10, 'Telefone inválido').max(20),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).default('ACTIVE'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// ============================================
// GET Handler - List Customers
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
          message: 'Você precisa estar logado para acessar este recurso.',
        },
        { status: 401 }
      )
    }

    const tenantId = session.user.currentTenantId

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validationResult = listCustomersSchema.safeParse(params)

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

    const { page, limit, search, status, tags, sortBy, sortOrder, minSpent, maxSpent } =
      validationResult.data

    // Build where clause
    const where: Record<string, unknown> = {
      tenantId,
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phoneE164: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (minSpent !== undefined || maxSpent !== undefined) {
      where.totalSpent = {}
      if (minSpent !== undefined) {
        (where.totalSpent as Record<string, number>).gte = minSpent
      }
      if (maxSpent !== undefined) {
        (where.totalSpent as Record<string, number>).lte = maxSpent
      }
    }

    // Get total count
    const total = await db.customer.count({ where })

    // Get customers
    const customers = await db.customer.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
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
        _count: {
          select: {
            conversations: true,
            orders: true,
            leads: true,
          },
        },
      },
    })

    // Parse tags and format response
    const formattedCustomers = customers.map((customer) => ({
      ...customer,
      tags: JSON.parse(customer.tags || '[]'),
      conversationCount: customer._count.conversations,
      orderCount: customer._count.orders,
      leadCount: customer._count.leads,
      _count: undefined,
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json<PaginatedResponse<Customer>>(
      {
        success: true,
        data: formattedCustomers,
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
    console.error('[Customers API] GET Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao buscar clientes.',
      },
      { status: 500 }
    )
  }
}

// ============================================
// POST Handler - Create Customer
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
    const validationResult = createCustomerSchema.safeParse(body)

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

    const { name, phoneE164, email, status, tags, metadata } = validationResult.data

    // Check if customer with same phone already exists
    const existingCustomer = await db.customer.findUnique({
      where: {
        tenantId_phoneE164: {
          tenantId,
          phoneE164,
        },
      },
    })

    if (existingCustomer) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: existingCustomer,
          message: 'Cliente já existe com este telefone.',
        },
        { status: 200 }
      )
    }

    // Create customer
    const customer = await db.customer.create({
      data: {
        tenantId,
        name,
        phoneE164,
        email: email || null,
        status,
        tags: JSON.stringify(tags || []),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json<ApiResponse<typeof customer>>(
      {
        success: true,
        data: {
          ...customer,
          tags: JSON.parse(customer.tags || '[]'),
          metadata: customer.metadata ? JSON.parse(customer.metadata) : null,
        },
        message: 'Cliente criado com sucesso.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Customers API] POST Error:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao criar o cliente.',
      },
      { status: 500 }
    )
  }
}
