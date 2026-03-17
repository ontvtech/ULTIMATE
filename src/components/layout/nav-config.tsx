/**
 * Navigation Configuration for SaaSWPP AI Platform
 * 
 * This file defines the navigation structure for all user roles:
 * - ADMIN: Platform administrators
 * - REVENDEDOR: Resellers who manage multiple tenants
 * - LOJISTA: Merchants who use the platform for their business
 * - ATENDENTE: Attendants who handle human handoffs
 * - GESTOR: Managers who oversee operations
 * 
 * Each navigation item includes:
 * - title: Display label
 * - href: Route path
 * - icon: Lucide icon component
 * - badge: Optional badge count
 * - requiredPermission: Optional permission required to view the item
 */

import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Settings,
  BarChart3,
  MessageSquare,
  Package,
  Calendar,
  ShoppingCart,
  Wrench,
  BookOpen,
  Megaphone,
  Bell,
  Link2,
  Wallet,
  Percent,
  Globe,
  Shield,
  Database,
  Cpu,
  FileText,
  type LucideIcon,
} from 'lucide-react'

// ============================================
// Types
// ============================================

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string | number
  children?: NavItem[]
  requiredPermission?: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

// ============================================
// Admin Navigation Items
// ============================================

export const adminNavItems: NavGroup[] = [
  {
    title: 'Visão Geral',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        requiredPermission: 'reports:view',
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        title: 'Tenants',
        href: '/admin/tenants',
        icon: Building2,
        requiredPermission: 'tenant:read',
      },
      {
        title: 'Usuários',
        href: '/admin/users',
        icon: Users,
        requiredPermission: 'tenant:manage_users',
      },
      {
        title: 'Revendedores',
        href: '/admin/resellers',
        icon: Link2,
        requiredPermission: 'tenant:read',
      },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        title: 'Assinaturas',
        href: '/admin/subscriptions',
        icon: CreditCard,
        requiredPermission: 'billing:view',
      },
      {
        title: 'Faturas',
        href: '/admin/invoices',
        icon: FileText,
        requiredPermission: 'billing:view',
      },
      {
        title: 'Comissões',
        href: '/admin/commissions',
        icon: Percent,
        requiredPermission: 'billing:view',
      },
      {
        title: 'Carteiras Meta',
        href: '/admin/meta-wallets',
        icon: Wallet,
        requiredPermission: 'billing:manage',
      },
    ],
  },
  {
    title: 'Planos & Add-ons',
    items: [
      {
        title: 'Planos',
        href: '/admin/plans',
        icon: Package,
        requiredPermission: 'settings:write',
      },
      {
        title: 'Módulos',
        href: '/admin/modules',
        icon: Database,
        requiredPermission: 'settings:write',
      },
      {
        title: 'Add-ons',
        href: '/admin/addons',
        icon: ShoppingCart,
        requiredPermission: 'settings:write',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        title: 'Provedores AI',
        href: '/admin/ai-providers',
        icon: Cpu,
        requiredPermission: 'settings:write',
      },
      {
        title: 'Templates de Nicho',
        href: '/admin/niches',
        icon: Globe,
        requiredPermission: 'settings:write',
      },
      {
        title: 'Alertas',
        href: '/admin/alerts',
        icon: Bell,
        requiredPermission: 'alerts:view',
      },
      {
        title: 'Logs de Auditoria',
        href: '/admin/audit-logs',
        icon: FileText,
        requiredPermission: 'settings:view',
      },
    ],
  },
  {
    title: 'Configurações',
    items: [
      {
        title: 'Configurações',
        href: '/admin/settings',
        icon: Settings,
        requiredPermission: 'settings:view',
      },
      {
        title: 'Permissões',
        href: '/admin/permissions',
        icon: Shield,
        requiredPermission: 'settings:write',
      },
    ],
  },
]

// ============================================
// Revendedor (Reseller) Navigation Items
// ============================================

export const revendedorNavItems: NavGroup[] = [
  {
    title: 'Visão Geral',
    items: [
      {
        title: 'Dashboard',
        href: '/revendedor',
        icon: LayoutDashboard,
      },
      {
        title: 'Analytics',
        href: '/revendedor/analytics',
        icon: BarChart3,
        requiredPermission: 'reports:view',
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        title: 'Meus Clientes',
        href: '/revendedor/tenants',
        icon: Building2,
        requiredPermission: 'tenant:read',
      },
      {
        title: 'Novo Cliente',
        href: '/revendedor/tenants/new',
        icon: Users,
        requiredPermission: 'tenant:create',
      },
    ],
  },
  {
    title: 'Links',
    items: [
      {
        title: 'Links de Indicação',
        href: '/revendedor/links',
        icon: Link2,
      },
      {
        title: 'Campanhas',
        href: '/revendedor/campaigns',
        icon: Megaphone,
      },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        title: 'Comissões',
        href: '/revendedor/commissions',
        icon: Percent,
        requiredPermission: 'billing:view',
      },
      {
        title: 'Extrato',
        href: '/revendedor/statement',
        icon: FileText,
        requiredPermission: 'billing:view',
      },
    ],
  },
  {
    title: 'Suporte',
    items: [
      {
        title: 'Tickets',
        href: '/revendedor/tickets',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Configurações',
    items: [
      {
        title: 'Meu Perfil',
        href: '/revendedor/profile',
        icon: Settings,
      },
    ],
  },
]

// ============================================
// Lojista (Merchant) Navigation Items
// ============================================

export const lojistaNavItems: NavGroup[] = [
  {
    title: 'Visão Geral',
    items: [
      {
        title: 'Dashboard',
        href: '/lojista',
        icon: LayoutDashboard,
      },
      {
        title: 'Alertas',
        href: '/lojista/alerts',
        icon: Bell,
        badge: 3, // Dynamic badge count
        requiredPermission: 'alerts:view',
      },
    ],
  },
  {
    title: 'Conversas',
    items: [
      {
        title: 'Atendimentos',
        href: '/lojista/conversations',
        icon: MessageSquare,
        requiredPermission: 'conversation:read',
      },
      {
        title: 'Handoffs',
        href: '/lojista/handoffs',
        icon: Users,
        badge: 2, // Dynamic badge count
        requiredPermission: 'conversation:handoff',
      },
    ],
  },
  {
    title: 'CRM',
    items: [
      {
        title: 'Clientes',
        href: '/lojista/customers',
        icon: Users,
        requiredPermission: 'customer:read',
      },
      {
        title: 'Leads',
        href: '/lojista/leads',
        icon: BarChart3,
        requiredPermission: 'lead:read',
      },
    ],
  },
  {
    title: 'Vendas',
    items: [
      {
        title: 'Pedidos',
        href: '/lojista/orders',
        icon: ShoppingCart,
        requiredPermission: 'order:read',
      },
      {
        title: 'Catálogo',
        href: '/lojista/catalog',
        icon: Package,
        requiredPermission: 'catalog:read',
      },
    ],
  },
  {
    title: 'Agenda',
    items: [
      {
        title: 'Agendamentos',
        href: '/lojista/appointments',
        icon: Calendar,
      },
      {
        title: 'Ordens de Serviço',
        href: '/lojista/service-orders',
        icon: Wrench,
      },
    ],
  },
  {
    title: 'Marketing',
    items: [
      {
        title: 'Campanhas',
        href: '/lojista/campaigns',
        icon: Megaphone,
        requiredPermission: 'campaign:read',
      },
    ],
  },
  {
    title: 'Base de Conhecimento',
    items: [
      {
        title: 'Conteúdos',
        href: '/lojista/knowledge',
        icon: BookOpen,
        requiredPermission: 'knowledge:read',
      },
    ],
  },
  {
    title: 'Configurações AI',
    items: [
      {
        title: 'Perfil AI',
        href: '/lojista/ai-profile',
        icon: Cpu,
        requiredPermission: 'ai:read',
      },
      {
        title: 'WhatsApp',
        href: '/lojista/whatsapp',
        icon: MessageSquare,
        requiredPermission: 'whatsapp:connect',
      },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        title: 'Assinatura',
        href: '/lojista/subscription',
        icon: CreditCard,
        requiredPermission: 'billing:view',
      },
      {
        title: 'Carteira Meta',
        href: '/lojista/meta-wallet',
        icon: Wallet,
        requiredPermission: 'billing:view',
      },
    ],
  },
  {
    title: 'Configurações',
    items: [
      {
        title: 'Configurações',
        href: '/lojista/settings',
        icon: Settings,
        requiredPermission: 'settings:view',
      },
      {
        title: 'Equipe',
        href: '/lojista/team',
        icon: Users,
        requiredPermission: 'tenant:manage_users',
      },
    ],
  },
]

// ============================================
// Helper Functions
// ============================================

/**
 * Get navigation items based on user role
 */
export function getNavItemsByRole(role: string): NavGroup[] {
  switch (role) {
    case 'ADMIN':
      return adminNavItems
    case 'REVENDEDOR':
      return revendedorNavItems
    case 'LOJISTA':
      return lojistaNavItems
    case 'ATENDENTE':
    case 'GESTOR':
      // Atendente and Gestor use lojista navigation with filtered permissions
      return lojistaNavItems
    default:
      return lojistaNavItems
  }
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavItemsByPermissions(
  navGroups: NavGroup[],
  userPermissions: string[]
): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.requiredPermission) {
          return true
        }
        return userPermissions.includes(item.requiredPermission)
      }),
    }))
    .filter((group) => group.items.length > 0)
}

/**
 * Find a navigation item by its href
 */
export function findNavItemByHref(
  navGroups: NavGroup[],
  href: string
): NavItem | undefined {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === href) {
        return item
      }
      if (item.children) {
        const child = item.children.find((child) => child.href === href)
        if (child) {
          return child
        }
      }
    }
  }
  return undefined
}

/**
 * Get the parent navigation group for a given href
 */
export function getParentNavGroup(
  navGroups: NavGroup[],
  href: string
): NavGroup | undefined {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === href) {
        return group
      }
      if (item.children) {
        const child = item.children.find((child) => child.href === href)
        if (child) {
          return group
        }
      }
    }
  }
  return undefined
}

/**
 * Get breadcrumb path for a given href
 */
export function getBreadcrumbPath(
  navGroups: NavGroup[],
  href: string
): { group?: NavGroup; item?: NavItem } {
  const item = findNavItemByHref(navGroups, href)
  const group = item ? getParentNavGroup(navGroups, href) : undefined
  return { group, item }
}
