'use client'

import * as React from 'react'
import { Search, X, Filter, Calendar, User, Tag, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  type ConversationFiltersProps,
  type ConversationFilters,
  STATUS_LABELS,
  STATUS_COLORS,
  MODE_LABELS,
  MODE_COLORS,
} from './types'

const defaultFilters: ConversationFilters = {
  status: 'ALL',
  aiMode: 'ALL',
  tags: [],
  dateRange: {
    from: null,
    to: null,
  },
  assignedTo: 'ALL',
  search: '',
}

export function ConversationFilters({
  filters,
  onChange,
  tags,
  assignees,
  onReset,
}: ConversationFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.status !== 'ALL') count++
    if (filters.aiMode !== 'ALL') count++
    if (filters.tags.length > 0) count++
    if (filters.assignedTo !== 'ALL') count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    return count
  }, [filters])

  const handleStatusChange = (value: string) => {
    onChange({ status: value as ConversationFilters['status'] })
  }

  const handleModeChange = (value: string) => {
    onChange({ aiMode: value as ConversationFilters['aiMode'] })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    onChange({ tags: newTags })
  }

  const handleAssigneeChange = (value: string) => {
    onChange({ assignedTo: value })
  }

  const handleDateChange = (field: 'from' | 'to', date: Date | null) => {
    onChange({
      dateRange: {
        ...filters.dateRange,
        [field]: date,
      },
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ search: e.target.value })
  }

  const handleClearSearch = () => {
    onChange({ search: '' })
  }

  return (
    <div className="space-y-3">
      {/* Search and Quick Filters */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9 pr-9"
          />
          {filters.search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-8 text-xs"
                  >
                    <RefreshCcw className="mr-1 h-3 w-3" />
                    Limpar
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              STATUS_COLORS[value as keyof typeof STATUS_COLORS].split(' ')[0]
                            }`}
                          />
                          {label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Modo
                </label>
                <Select value={filters.aiMode} onValueChange={handleModeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MODE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Atendente
                </label>
                <Select value={filters.assignedTo} onValueChange={handleAssigneeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o atendente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="UNASSIGNED">Não atribuído</SelectItem>
                    <Separator className="my-1" />
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Período
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        {filters.dateRange.from
                          ? format(filters.dateRange.from, 'dd/MM/yy', { locale: ptBR })
                          : 'De'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange.from || undefined}
                        onSelect={(date) => handleDateChange('from', date || null)}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        {filters.dateRange.to
                          ? format(filters.dateRange.to, 'dd/MM/yy', { locale: ptBR })
                          : 'Até'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange.to || undefined}
                        onSelect={(date) => handleDateChange('to', date || null)}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'ALL' && (
            <Badge variant="secondary" className="gap-1">
              Status: {STATUS_LABELS[filters.status]}
              <button
                onClick={() => onChange({ status: 'ALL' })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.aiMode !== 'ALL' && (
            <Badge variant="secondary" className="gap-1">
              Modo: {MODE_LABELS[filters.aiMode]}
              <button
                onClick={() => onChange({ aiMode: 'ALL' })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.assignedTo !== 'ALL' && (
            <Badge variant="secondary" className="gap-1">
              {filters.assignedTo === 'UNASSIGNED'
                ? 'Não atribuído'
                : assignees.find((a) => a.id === filters.assignedTo)?.name}
              <button
                onClick={() => onChange({ assignedTo: 'ALL' })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {filters.dateRange.from && filters.dateRange.to
                ? `${format(filters.dateRange.from, 'dd/MM', { locale: ptBR })} - ${format(filters.dateRange.to, 'dd/MM', { locale: ptBR })}`
                : filters.dateRange.from
                ? `A partir de ${format(filters.dateRange.from, 'dd/MM', { locale: ptBR })}`
                : `Até ${format(filters.dateRange.to!, 'dd/MM', { locale: ptBR })}`}
              <button
                onClick={() => onChange({ dateRange: { from: null, to: null } })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export { defaultFilters }
