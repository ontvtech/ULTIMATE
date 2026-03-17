'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Flame,
  DollarSign,
  TrendingUp,
  Users,
  MoreHorizontal,
  GripVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Mock data for CRM pipeline
const mockStages = [
  { id: 'new', name: 'Novo', color: '#3B82F6', order: 0 },
  { id: 'contacted', name: 'Contatado', color: '#8B5CF6', order: 1 },
  { id: 'qualified', name: 'Qualificado', color: '#F59E0B', order: 2 },
  { id: 'proposal', name: 'Proposta', color: '#EC4899', order: 3 },
  { id: 'negotiation', name: 'Negociação', color: '#EF4444', order: 4 },
  { id: 'won', name: 'Ganho', color: '#10B981', order: 5 },
  { id: 'lost', name: 'Perdido', color: '#6B7280', order: 6 },
]

const mockLeads = [
  {
    id: '1',
    customerName: 'Maria Silva',
    customerPhone: '+55 11 99999-1111',
    customerEmail: 'maria@email.com',
    status: 'NEW',
    stageId: 'new',
    score: 85,
    isHot: true,
    estimatedValue: 2500,
    notes: 'Interessada no pacote premium',
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '2',
    customerName: 'João Santos',
    customerPhone: '+55 11 99999-2222',
    customerEmail: 'joao@email.com',
    status: 'CONTACTED',
    stageId: 'contacted',
    score: 72,
    isHot: false,
    estimatedValue: 1800,
    notes: 'Aguardando retorno sobre orçamento',
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: '3',
    customerName: 'Ana Costa',
    customerPhone: '+55 11 99999-3333',
    customerEmail: 'ana@email.com',
    status: 'QUALIFIED',
    stageId: 'qualified',
    score: 91,
    isHot: true,
    estimatedValue: 5200,
    notes: 'Cliente corporativo, alto potencial',
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: '4',
    customerName: 'Pedro Oliveira',
    customerPhone: '+55 11 99999-4444',
    customerEmail: 'pedro@email.com',
    status: 'PROPOSAL',
    stageId: 'proposal',
    score: 78,
    isHot: false,
    estimatedValue: 3200,
    notes: 'Proposta enviada, aguardando aprovação',
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
  },
  {
    id: '5',
    customerName: 'Carla Mendes',
    customerPhone: '+55 11 99999-5555',
    customerEmail: 'carla@email.com',
    status: 'NEGOTIATION',
    stageId: 'negotiation',
    score: 88,
    isHot: true,
    estimatedValue: 4500,
    notes: 'Negociando desconto de 10%',
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
  },
  {
    id: '6',
    customerName: 'Roberto Lima',
    customerPhone: '+55 11 99999-6666',
    customerEmail: 'roberto@email.com',
    status: 'WON',
    stageId: 'won',
    score: 95,
    isHot: false,
    estimatedValue: 6000,
    notes: 'Fechado! Cliente satisfeito',
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144),
  },
  {
    id: '7',
    customerName: 'Fernanda Rocha',
    customerPhone: '+55 11 99999-7777',
    customerEmail: 'fernanda@email.com',
    status: 'LOST',
    stageId: 'lost',
    score: 45,
    isHot: false,
    estimatedValue: 1200,
    notes: 'Escolheu concorrente (preço)',
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168),
  },
]

export default function CRMPage() {
  const [leads, setLeads] = React.useState(mockLeads)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStage, setFilterStage] = React.useState<string>('all')
  const [isNewLeadOpen, setIsNewLeadOpen] = React.useState(false)
  const [draggedLead, setDraggedLead] = React.useState<string | null>(null)

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customerPhone.includes(searchTerm) ||
      lead.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = filterStage === 'all' || lead.stageId === filterStage
    return matchesSearch && matchesStage
  })

  // Group leads by stage
  const leadsByStage = mockStages.reduce((acc, stage) => {
    acc[stage.id] = filteredLeads.filter((lead) => lead.stageId === stage.id)
    return acc
  }, {} as Record<string, typeof leads>)

  // Calculate totals
  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0)
  const hotLeadsCount = leads.filter((lead) => lead.isHot).length
  const wonLeadsValue = leads
    .filter((lead) => lead.stageId === 'won')
    .reduce((sum, lead) => sum + lead.estimatedValue, 0)

  // Handle drag and drop
  const handleDragStart = (leadId: string) => {
    setDraggedLead(leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (stageId: string) => {
    if (draggedLead) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === draggedLead ? { ...lead, stageId, status: stageId.toUpperCase() } : lead
        )
      )
      setDraggedLead(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Gerencie seus leads e oportunidades de venda"
        actions={
          <Dialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Lead</DialogTitle>
                <DialogDescription>
                  Adicione um novo lead ao pipeline de vendas
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Cliente</Label>
                  <Input id="name" placeholder="Nome completo" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input id="phone" placeholder="(11) 99999-9999" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Valor Estimado</Label>
                  <Input id="value" type="number" placeholder="R$ 0,00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" placeholder="Anotações sobre o lead..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewLeadOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewLeadOpen(false)}>Salvar Lead</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              {hotLeadsCount} leads quentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalValue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Em pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {wonLeadsValue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {leads.filter((l) => l.stageId === 'won').length} vendas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0
                ? Math.round(
                    (leads.filter((l) => l.stageId === 'won').length / leads.length) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Do total de leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar estágio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estágios</SelectItem>
              {mockStages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {mockStages.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="font-medium text-sm">{stage.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {leadsByStage[stage.id]?.length || 0}
              </Badge>
            </div>

            {/* Leads List */}
            <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
              {leadsByStage[stage.id]?.map((lead) => (
                <Card
                  key={lead.id}
                  className="cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(lead.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {lead.customerName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex items-center gap-1">
                        {lead.isHot && (
                          <Flame className="h-4 w-4 text-orange-500" />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Enviar mensagem</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="font-medium text-sm">{lead.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {lead.estimatedValue.toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{lead.customerPhone}</span>
                    </div>

                    {lead.notes && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {lead.notes}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          lead.score >= 80
                            ? 'border-green-500 text-green-600'
                            : lead.score >= 50
                              ? 'border-yellow-500 text-yellow-600'
                              : 'border-gray-500 text-gray-600'
                        )}
                      >
                        Score: {lead.score}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {leadsByStage[stage.id]?.length === 0 && (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                  Nenhum lead
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
