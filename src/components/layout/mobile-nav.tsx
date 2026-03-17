'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Menu,
  LogOut,
  Settings,
  User,
  Bell,
  LayoutDashboard,
} from 'lucide-react'
import { TenantSelector } from './tenant-selector'
import {
  type NavGroup,
  getNavItemsByRole,
  filterNavItemsByPermissions,
} from './nav-config'
import type { SessionUser } from '@/types'

interface MobileNavProps {
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

function MobileNavItem({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="space-y-1">
      <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {group.title}
      </div>
      {group.items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
            {item.badge !== undefined && (
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className="ml-auto h-5 min-w-5 px-1.5 text-xs"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function MobileNav({ user, className }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  // Get current tenant info
  const currentTenant = user.tenants.find(
    (t) => t.tenantId === user.currentTenantId
  )

  // Get navigation items based on role and permissions
  const roleKey = currentTenant?.roleKey || 'LOJISTA'
  const navGroups = getNavItemsByRole(roleKey)
  const filteredNavGroups = filterNavItemsByPermissions(navGroups, user.permissions)

  const handleNavigate = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('md:hidden', className)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <SheetTitle className="text-left text-base">SaaSWPP AI</SheetTitle>
              <span className="text-xs text-muted-foreground">
                {roleKey === 'ADMIN' ? 'Admin Platform' : roleKey === 'REVENDEDOR' ? 'Reseller Panel' : 'Merchant Panel'}
              </span>
            </div>
          </div>
        </SheetHeader>

        {/* User Info */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Tenant Selector (if multiple tenants) */}
        {user.tenants.length > 1 && (
          <div className="border-b p-4">
            <TenantSelector
              tenants={user.tenants}
              currentTenantId={user.currentTenantId}
              onTenantChange={() => setOpen(false)}
            />
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-4 p-4">
            {/* Dashboard Quick Link */}
            <Link
              href={`/${roleKey.toLowerCase()}`}
              onClick={handleNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname === `/${roleKey.toLowerCase()}` || pathname === `/${roleKey.toLowerCase()}/`
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Separator />

            {/* Navigation Groups */}
            {filteredNavGroups.map((group, index) => (
              <React.Fragment key={group.title}>
                <MobileNavItem
                  group={group}
                  pathname={pathname}
                  onNavigate={handleNavigate}
                />
                {index < filteredNavGroups.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start"
              asChild
            >
              <Link href={`/${roleKey.toLowerCase()}/profile`} onClick={handleNavigate}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start"
              asChild
            >
              <Link href={`/${roleKey.toLowerCase()}/settings`} onClick={handleNavigate}>
                <Settings className="mr-2 h-4 w-4" />
                Configs
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start text-destructive hover:text-destructive"
              asChild
            >
              <Link href="/api/auth/signout">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
