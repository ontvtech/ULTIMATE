'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
} from 'lucide-react'
import { TenantSelector } from './tenant-selector'
import {
  type NavGroup,
  getNavItemsByRole,
  filterNavItemsByPermissions,
} from './nav-config'
import type { SessionUser, UserTenantInfo } from '@/types'

interface AppSidebarProps {
  user: SessionUser
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function NavGroupItem({ group, pathname }: { group: NavGroup; pathname: string }) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarGroup>
      {!isCollapsed && (
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {group.title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge !== undefined && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 min-w-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({ user, className }: AppSidebarProps) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  // Get current tenant info
  const currentTenant = user.tenants.find(
    (t) => t.tenantId === user.currentTenantId
  )

  // Get navigation items based on role and permissions
  const roleKey = currentTenant?.roleKey || 'LOJISTA'
  const navGroups = getNavItemsByRole(roleKey)
  const filteredNavGroups = filterNavItemsByPermissions(navGroups, user.permissions)

  return (
    <Sidebar className={className} collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">SaaSWPP AI</span>
                <span className="text-[10px] text-muted-foreground">
                  {roleKey === 'ADMIN' ? 'Admin Platform' : roleKey === 'REVENDEDOR' ? 'Reseller Panel' : 'Merchant Panel'}
                </span>
              </div>
            )}
          </Link>
        </div>
      </SidebarHeader>

      {/* Tenant Selector (if user has multiple tenants) */}
      {user.tenants.length > 1 && !isCollapsed && (
        <div className="px-2 pt-2">
          <TenantSelector
            tenants={user.tenants}
            currentTenantId={user.currentTenantId}
            compact
          />
        </div>
      )}

      <SidebarSeparator />

      {/* Navigation Content */}
      <SidebarContent className="overflow-y-auto">
        {filteredNavGroups.map((group, index) => (
          <React.Fragment key={group.title}>
            <NavGroupItem group={group} pathname={pathname} />
            {index < filteredNavGroups.length - 1 && <SidebarSeparator />}
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-1 flex-col items-start overflow-hidden">
                      <span className="truncate text-sm font-medium">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  )}
                  {!isCollapsed && <ChevronsUpDown className="ml-auto size-4" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${roleKey.toLowerCase()}/profile`}>
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${roleKey.toLowerCase()}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
