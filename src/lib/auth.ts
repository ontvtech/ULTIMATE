// ============================================
// SaaSWPP AI Platform - Authentication
// ============================================

import NextAuth, { type NextAuthOptions, type Session, type User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { ROLES, ROLE_PERMISSIONS } from './constants'
import type { SessionUser, UserTenantInfo } from '@/types'

// ============================================
// TypeScript Declarations
// ============================================

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }
  
  interface User {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
    status: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
    status: string
    currentTenantId?: string
    tenants: UserTenantInfo[]
    permissions: string[]
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Load user with tenant associations
 */
async function loadUserWithTenants(userId: string): Promise<{
  tenants: UserTenantInfo[]
  permissions: string[]
}> {
  const userTenants = await db.userTenant.findMany({
    where: {
      userId,
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

  const tenants: UserTenantInfo[] = userTenants.map((ut) => ({
    tenantId: ut.tenant.id,
    tenantName: ut.tenant.name,
    tenantSlug: ut.tenant.slug,
    tenantStatus: ut.tenant.status,
    roleId: ut.roleId,
    roleName: ut.role.name,
    roleKey: ut.role.name as keyof typeof ROLES,
    isActive: ut.isActive,
  }))

  // Collect unique permissions from all roles
  const permissionSet = new Set<string>()
  
  for (const ut of userTenants) {
    const roleKey = ut.role.name as keyof typeof ROLE_PERMISSIONS
    const rolePermissions = ROLE_PERMISSIONS[roleKey] || []
    rolePermissions.forEach((p) => permissionSet.add(p))
  }

  // Also load custom permissions from the database
  const customPermissions = await db.rolePermission.findMany({
    where: {
      roleId: { in: userTenants.map((ut) => ut.roleId) },
    },
    include: {
      permission: {
        select: {
          key: true,
        },
      },
    },
  })

  customPermissions.forEach((rp) => {
    permissionSet.add(rp.permission.key)
  })

  return {
    tenants,
    permissions: Array.from(permissionSet),
  }
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })
}

// ============================================
// NextAuth Configuration
// ============================================

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email e Senha',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'seu@email.com',
        },
        password: {
          label: 'Senha',
          type: 'password',
        },
        tenantSlug: {
          label: 'Tenant',
          type: 'text',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        const email = credentials.email.toLowerCase().trim()

        // Find user by email
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            avatarUrl: true,
            status: true,
          },
        })

        if (!user) {
          throw new Error('Credenciais inválidas')
        }

        // Check if user is active
        if (user.status !== 'ACTIVE') {
          throw new Error('Conta desativada. Entre em contato com o suporte.')
        }

        // Verify password
        const isValidPassword = await verifyPassword(
          credentials.password,
          user.passwordHash
        )

        if (!isValidPassword) {
          throw new Error('Credenciais inválidas')
        }

        // If tenantSlug is provided, verify user has access
        if (credentials.tenantSlug) {
          const tenantAccess = await db.userTenant.findFirst({
            where: {
              userId: user.id,
              tenant: {
                slug: credentials.tenantSlug,
              },
              isActive: true,
            },
          })

          if (!tenantAccess) {
            throw new Error('Acesso negado a este tenant')
          }
        }

        // Update last login
        await updateLastLogin(user.id)

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          status: user.status,
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.avatarUrl = user.avatarUrl
        token.status = user.status

        // Load tenant associations and permissions
        const { tenants, permissions } = await loadUserWithTenants(user.id)
        token.tenants = tenants
        token.permissions = permissions

        // Set default tenant (first active tenant)
        if (tenants.length > 0) {
          token.currentTenantId = tenants[0].tenantId
        }
      }

      // Handle session update (e.g., switching tenant)
      if (trigger === 'update' && session) {
        if (session.currentTenantId !== undefined) {
          // Verify user has access to this tenant
          const hasAccess = token.tenants?.some(
            (t) => t.tenantId === session.currentTenantId && t.isActive
          )
          
          if (hasAccess) {
            token.currentTenantId = session.currentTenantId
          }
        }
      }

      return token
    },
    
    async session({ session, token }) {
      // Pass token data to session
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        avatarUrl: token.avatarUrl,
        status: token.status,
        currentTenantId: token.currentTenantId,
        tenants: token.tenants || [],
        permissions: token.permissions || [],
      }
      
      return session
    },
    
    async signIn({ user }) {
      // Only allow sign in for active users
      return user.status === 'ACTIVE'
    },
  },
  
  events: {
    async signIn({ user }) {
      console.log(`[Auth] User signed in: ${user.email} (${user.id})`)
    },
    async signOut({ token }) {
      console.log(`[Auth] User signed out: ${token.email} (${token.id})`)
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
}

// ============================================
// Auth Helper Functions
// ============================================

/**
 * Get the current session on the server side
 */
export async function getServerSession(): Promise<Session | null> {
  const { getServerSession: getNextAuthSession } = await import('next-auth/next')
  return getNextAuthSession(authOptions)
}

/**
 * Require authentication, throws if not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED')
  }
  
  return session
}

/**
 * Require specific permission
 */
export async function requirePermission(
  permission: string,
  tenantId?: string
): Promise<Session> {
  const session = await requireAuth()
  
  // Check if user has the permission
  if (!session.user.permissions.includes(permission)) {
    throw new Error('FORBIDDEN')
  }
  
  // If tenantId is provided, verify user has access to it
  if (tenantId) {
    const hasTenantAccess = session.user.tenants.some(
      (t) => t.tenantId === tenantId && t.isActive
    )
    
    if (!hasTenantAccess) {
      throw new Error('TENANT_ACCESS_DENIED')
    }
  }
  
  return session
}

/**
 * Require one of multiple permissions
 */
export async function requireAnyPermission(
  permissions: string[],
  tenantId?: string
): Promise<Session> {
  const session = await requireAuth()
  
  const hasPermission = permissions.some((p) =>
    session.user.permissions.includes(p)
  )
  
  if (!hasPermission) {
    throw new Error('FORBIDDEN')
  }
  
  if (tenantId) {
    const hasTenantAccess = session.user.tenants.some(
      (t) => t.tenantId === tenantId && t.isActive
    )
    
    if (!hasTenantAccess) {
      throw new Error('TENANT_ACCESS_DENIED')
    }
  }
  
  return session
}

/**
 * Check if user has a specific role
 */
export async function requireRole(
  role: keyof typeof ROLES,
  tenantId?: string
): Promise<Session> {
  const session = await requireAuth()
  
  const hasRole = session.user.tenants.some(
    (t) => t.roleKey === role && (tenantId ? t.tenantId === tenantId : true)
  )
  
  if (!hasRole) {
    throw new Error('FORBIDDEN')
  }
  
  return session
}

/**
 * Switch user's current tenant
 */
export async function switchTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  // Verify user has access to this tenant
  const userTenant = await db.userTenant.findFirst({
    where: {
      userId,
      tenantId,
      isActive: true,
    },
  })
  
  if (!userTenant) {
    return false
  }
  
  return true
}

/**
 * Create a new user
 */
export async function createUser({
  name,
  email,
  password,
  phone,
}: {
  name: string
  email: string
  password: string
  phone?: string
}): Promise<{ id: string; name: string; email: string }> {
  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  
  if (existingUser) {
    throw new Error('USER_ALREADY_EXISTS')
  }
  
  // Hash password
  const passwordHash = await hashPassword(password)
  
  // Create user
  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      status: 'ACTIVE',
    },
  })
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

/**
 * Create a user with tenant association
 */
export async function createUserWithTenant({
  name,
  email,
  password,
  phone,
  tenantId,
  roleKey,
}: {
  name: string
  email: string
  password: string
  phone?: string
  tenantId: string
  roleKey: keyof typeof ROLES
}): Promise<{ userId: string; tenantId: string }> {
  // Get the role
  const role = await db.role.findFirst({
    where: { name: roleKey },
  })
  
  if (!role) {
    throw new Error('ROLE_NOT_FOUND')
  }
  
  // Create user
  const user = await createUser({ name, email, password, phone })
  
  // Create user-tenant association
  await db.userTenant.create({
    data: {
      userId: user.id,
      tenantId,
      roleId: role.id,
      isActive: true,
    },
  })
  
  return {
    userId: user.id,
    tenantId,
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })
  
  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }
  
  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.passwordHash)
  
  if (!isValid) {
    throw new Error('INVALID_CURRENT_PASSWORD')
  }
  
  // Hash and update new password
  const newPasswordHash = await hashPassword(newPassword)
  
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  })
  
  return true
}

// Export the NextAuth handler
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
