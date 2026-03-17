'use client'

import * as React from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
  id: '1',
  name: 'Admin User',
  email: 'admin@saaswpp.ai',
  avatarUrl: null,
  status: 'ACTIVE',
  currentTenantId: 'tenant-admin',
  tenants: [
    {
      tenantId: 'tenant-admin',
      tenantName: 'Admin Platform',
      tenantSlug: 'admin',
      tenantStatus: 'ACTIVE' as const,
      roleId: 'role-admin',
      roleName: 'Administrador',
      roleKey: 'ADMIN' as const,
      isActive: true,
    },
  ],
  permissions: [
    'tenant:create',
    'tenant:read',
    'tenant:update',
    'tenant:delete',
    'tenant:manage_users',
    'billing:view',
    'billing:manage',
    'settings:view',
    'settings:write',
    'reports:view',
    'reports:export',
  ],
}

export default function AdminLayout({
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

  // Check if user has ADMIN role
  const currentTenant = session.user.tenants.find(
    (t) => t.tenantId === session.user.currentTenantId
  )

  if (currentTenant?.roleKey !== 'ADMIN') {
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
