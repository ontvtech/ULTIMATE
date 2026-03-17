'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  Moon,
  Search,
  Sun,
  User,
  Settings,
  LogOut,
  Check,
} from 'lucide-react'
import type { SessionUser } from '@/types'
import { findNavItemByHref, getParentNavGroup } from './nav-config'
import { useTheme } from 'next-themes'

interface HeaderProps {
  user: SessionUser
  className?: string
}

interface Notification {
  id: string
  title: string
  description: string
  type: 'info' | 'warning' | 'error' | 'success'
  createdAt: Date
  read: boolean
}

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Novo lead qualificado',
    description: 'Um novo lead foi qualificado automaticamente.',
    type: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: '2',
    title: 'Handoff pendente',
    description: 'Cliente aguardando atendimento humano.',
    type: 'warning',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
  },
  {
    id: '3',
    title: 'Alerta de pagamento',
    description: 'Falha no processamento do pagamento.',
    type: 'error',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    read: true,
  },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Agora mesmo'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} min atrás`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h atrás`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d atrás`
  }
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}

function NotificationsDropdown() {
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex flex-col items-start gap-1 p-3',
                  !notification.read && 'bg-muted/50'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium">{notification.title}</span>
                  {!notification.read && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'h-2 w-2 rounded-full p-0',
                        notification.type === 'success' && 'bg-green-500',
                        notification.type === 'warning' && 'bg-yellow-500',
                        notification.type === 'error' && 'bg-red-500',
                        notification.type === 'info' && 'bg-blue-500'
                      )}
                    />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {notification.description}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatTimeAgo(notification.createdAt)}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full text-center">
            Ver todas as notificações
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header({ user, className }: HeaderProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = React.useState(false)
  
  // Get current tenant info
  const currentTenant = user.tenants.find(
    (t) => t.tenantId === user.currentTenantId
  )
  const roleKey = currentTenant?.roleKey || 'LOJISTA'

  // Build breadcrumbs from pathname
  const buildBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: { href: string; label: string }[] = []

    // Find matching nav item
    const navItem = findNavItemByHref([], pathname)
    const navGroup = getParentNavGroup([], pathname)

    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      let label = segment

      // Try to get label from nav items
      if (index === segments.length - 1 && navItem) {
        label = navItem.title
      } else {
        // Capitalize and format
        label = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
      }

      breadcrumbs.push({ href, label })
    })

    return breadcrumbs
  }

  const breadcrumbs = buildBreadcrumbs()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4',
        className
      )}
    >
      {/* Sidebar Toggle */}
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />

      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Search (optional - expandable) */}
        {searchOpen ? (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="h-8 w-64 pl-8"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Separator */}
        <Separator orientation="vertical" className="h-6" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden font-medium md:inline-block">
                {user.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
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
      </div>
    </header>
  )
}
