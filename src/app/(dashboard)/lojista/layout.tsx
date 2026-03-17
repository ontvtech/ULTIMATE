'use client'

import * as React from 'react'
import { redirect } from 'next/navigation'
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Skeleton } from '@/components/ui/skeleton'

// Mock user for demo (will be replaced with actual session)
const mockUser = {
  id: '3',
  name: 'João Silva',
  email: 'joao@lojaexemplo.com',
  avatarUrl: null,
  status: 'ACTIVE',
  currentTenantId: 'tenant-merchant',
  tenants: [
    {
      tenantId: 'tenant-merchant',
      tenantName: 'Loja Exemplo',
      tenantSlug: 'loja-exemplo',
      tenantStatus: 'ACTIVE' as const,
      roleId: 'role-merchant',
      roleName: 'Lojista',
      roleKey: 'LOJISTA' as const,
      isActive: true,
    },
  ],
  permissions: [
    'tenant:read',
    'tenant:update',
    'tenant:manage_users',
    'conversation:read',
    'conversation:write',
    'conversation:assign',
    'conversation:handoff',
    'customer:read',
    'customer:write',
    'lead:read',
    'lead:write',
    'order:read',
    'order:write',
    'catalog:read',
    'catalog:write',
    'knowledge:read',
    'knowledge:write',
    'ai:read',
    'ai:write',
    'campaign:read',
    'campaign:write',
    'campaign:send',
    'reports:view',
    'billing:view',
    'settings:view',
    'settings:write',
    'whatsapp:connect',
    'whatsapp:disconnect',
    'alerts:view',
    'alerts:manage',
  ],
}

export default function LojistaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For demo purposes, use mock user
  // In production, uncomment the session check below
  /*
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <DashboardSkeleton />
  }

  if (!session?.user) {
    redirect('/login')
  }

  // Check if user has LOJISTA role
  const currentTenant = session.user.tenants.find(
    (t) => t.tenantId === session.user.currentTenantId
  )

  if (currentTenant?.roleKey !== 'LOJISTA' && currentTenant?.roleKey !== 'GESTOR' && currentTenant?.roleKey !== 'ATENDENTE') {
    redirect('/unauthorized')
  }
  */

  const user = mockUser

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="flex items-center md:hidden">
          <MobileNav user={user} />
        </div>
        <Header user={user} className="hidden md:flex" />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="hidden w-64 border-r bg-muted/30 md:block">
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </div>
      <div className="flex-1">
        <div className="h-14 border-b px-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-6">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    </div>
  )
}
