'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronsUpDown, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { UserTenantInfo } from '@/types'
import { TENANT_STATUS_LABELS, TENANT_STATUS_COLORS } from '@/lib/constants'

interface TenantSelectorProps {
  tenants: UserTenantInfo[]
  currentTenantId?: string
  onTenantChange?: (tenantId: string) => void
  className?: string
  compact?: boolean
}

const tenantTypeLabels: Record<string, string> = {
  ADMIN_PLATFORM: 'Admin',
  ADMIN: 'Admin',
  MERCHANT: 'Lojista',
  REVENDEDOR: 'Revendedor',
  RESELLER: 'Revendedor',
  INTERNAL: 'Interno',
  LOJISTA: 'Lojista',
  ATENDENTE: 'Atendente',
  GESTOR: 'Gestor',
}

export function TenantSelector({
  tenants,
  currentTenantId,
  onTenantChange,
  className,
  compact = false,
}: TenantSelectorProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [switching, setSwitching] = React.useState(false)

  const currentTenant = tenants.find((t) => t.tenantId === currentTenantId)

  const handleSelect = async (tenantId: string) => {
    if (tenantId === currentTenantId || switching) {
      setOpen(false)
      return
    }

    setSwitching(true)

    try {
      // Call the API to switch tenant
      const response = await fetch('/api/auth/switch-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Falha ao trocar de tenant')
      }

      // Show success toast
      const newTenant = tenants.find((t) => t.tenantId === tenantId)
      toast.success(`Tenant alterado para "${newTenant?.tenantName}"`)

      // Call optional callback
      onTenantChange?.(tenantId)
      setOpen(false)

      // Refresh the page to update the session
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao trocar de tenant')
    } finally {
      setSwitching(false)
    }
  }

  if (tenants.length === 0) {
    return null
  }

  if (tenants.length === 1) {
    const tenant = tenants[0]
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        {!compact && (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{tenant.tenantName}</span>
            <span className="text-xs text-muted-foreground">
              {tenantTypeLabels[tenant.roleKey] || tenant.roleName}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar tenant"
          disabled={switching}
          className={cn(
            'w-full justify-between',
            compact ? 'h-9 px-2' : 'h-auto py-2',
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {switching ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
            )}
            {!compact && currentTenant && (
              <div className="flex flex-col items-start overflow-hidden">
                <span className="truncate text-sm font-medium">
                  {currentTenant.tenantName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tenantTypeLabels[currentTenant.roleKey] || currentTenant.roleName}
                </span>
              </div>
            )}
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar tenant..." />
          <CommandList>
            <CommandEmpty>Nenhum tenant encontrado.</CommandEmpty>
            
            {/* Group by role */}
            {['ADMIN', 'REVENDEDOR', 'LOJISTA', 'ATENDENTE', 'GESTOR'].map((role) => {
              const roleTenants = tenants.filter((t) => t.roleKey === role)
              if (roleTenants.length === 0) return null

              return (
                <CommandGroup key={role} heading={tenantTypeLabels[role] || role}>
                  {roleTenants.map((tenant) => (
                    <CommandItem
                      key={tenant.tenantId}
                      value={`${tenant.tenantName} ${tenant.tenantSlug}`}
                      onSelect={() => handleSelect(tenant.tenantId)}
                      disabled={switching}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                          <Building2 className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">{tenant.tenantName}</span>
                          <span className="text-xs text-muted-foreground">
                            {tenant.tenantSlug}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1.5 py-0',
                            TENANT_STATUS_COLORS[tenant.tenantStatus]
                          )}
                        >
                          {TENANT_STATUS_LABELS[tenant.tenantStatus] || tenant.tenantStatus}
                        </Badge>
                        {currentTenantId === tenant.tenantId && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}

            <CommandSeparator />
            
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  // Could navigate to tenant creation page
                  setOpen(false)
                }}
                disabled={switching}
                className="justify-center text-muted-foreground"
              >
                <span className="text-sm">Gerenciar Tenants</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
