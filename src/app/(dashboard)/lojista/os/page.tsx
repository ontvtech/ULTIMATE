'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Calendar,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock service orders data
const mockServiceOrders = [
  {
    id: '1',
    title: 'Manutenção de Ar Condicionado',
    customerName: 'Maria Silva',
    customerPhone: '+55 11 99999-1111',
    status: 'OPEN',
    priority: 'HIGH',
    description: 'Ar condicionado não está gelando adequadamente',
    assignedTo: 'Técnico João',
    estimatedCost: 350,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  },
  {
    id: '2',
    title: 'Instalação Elétrica',
    customerName: 'João Santos',
    customerPhone: '+55 11 99999-2222',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    description: 'Instalação de novos pontos de luz na sala',
    assignedTo: 'Técnico Pedro',
    estimatedCost: 500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    title: 'Reparo de Encanamento',
    customerName: 'Ana Costa',
    customerPhone: '+55 11 99999-3333',
    status: 'WAITING_PARTS',
    priority: 'HIGH',
    description: 'Vazamento na cozinha, aguardando peça de reposição',
    assignedTo: 'Técnico Carlos',
    estimatedCost: 280,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
  },
  {
    id: '4',
    title: 'Limpeza de Caixa D\'água',
    customerName: 'Pedro Oliveira',
    customerPhone: '+55 11 99999-4444',
    status: 'COMPLETED',
    priority: 'LOW',
    description: 'Limpeza e desinfecção da caixa d\'água',
    assignedTo: 'Técnico Marcos',
    estimatedCost: 200,
    finalCost: 180,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '5',
    title: 'Pintura Residencial',
    customerName: 'Carla Mendes',
    customerPhone: '+55 11 99999-5555',
    status: 'OPEN',
    priority: 'NORMAL',
    description: 'Pintura do quarto principal',
    estimatedCost: 800,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: '6',
    title: 'Montagem de Móveis',
    customerName: 'Roberto Lima',
    customerPhone: '+55 11 99999-6666',
    status: 'CANCELED',
    priority: 'LOW',
    description: 'Montagem de guarda-roupa',
    estimatedCost: 150,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
    canceledAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: 'Aberto', color: 'bg-blue-500', icon: <Wrench className="h-4 w-4" /> },
  IN_PROGRESS: { label: 'Em Andamento', color: 'bg-purple-500', icon: <Clock className="h-4 w-4" /> },
  WAITING_PARTS: { label: 'Aguardando Peças', color: 'bg-orange-500', icon: <Package className="h-4 w-4" /> },
  COMPLETED: { label: 'Concluído', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  CANCELED: { label: 'Cancelado', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  HIGH: { label: 'Alta', color: 'bg-red-100 text-red-800' },
  URGENT: { label: 'Urgente', color: 'bg-red-500 text-white' },
}

export default function OSPage() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [isNewOSOpen, setIsNewOSOpen] = React.useState(false)
  const [selectedOS, setSelectedOS] = React.useState<typeof mockServiceOrders[0] | null>(null)

  // Filter orders
  const filteredOrders = mockServiceOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const openOrders = mockServiceOrders.filter((o) => o.status === 'OPEN').length
  const inProgressOrders = mockServiceOrders.filter((o) => o.status === 'IN_PROGRESS').length
  const waitingPartsOrders = mockServiceOrders.filter((o) => o.status === 'WAITING_PARTS').length
  const highPriorityOrders = mockServiceOrders.filter((o) => o.priority === 'HIGH' || o.priority === 'URGENT').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Gerencie as ordens de serviço da sua empresa"
        actions={
          <Dialog open={isNewOSOpen} onOpenChange={setIsNewOSOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nova Ordem de Serviço</DialogTitle>
                <DialogDescription>
                  Crie uma nova ordem de serviço
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Ex: Manutenção de ar condicionado" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Input id="customer" placeholder="Nome ou telefone do cliente" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Baixa</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="URGENT">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Data Prevista</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" placeholder="Detalhes do serviço..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Valor Estimado</Label>
                  <Input id="cost" type="number" placeholder="R$ 0,00" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewOSOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewOSOpen(false)}>Criar OS</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertas</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOrders}</div>
            <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressOrders}</div>
            <p className="text-xs text-muted-foreground">Sendo executados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Peças</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitingPartsOrders}</div>
            <p className="text-xs text-muted-foreground">Peças pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityOrders}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar ordens de serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(statusConfig).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">OS</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Est.</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <p className="font-medium">{order.title}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {order.customerName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerPhone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityConfig[order.priority]?.color}>
                      {priorityConfig[order.priority]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-white', statusConfig[order.status]?.color)}>
                      {statusConfig[order.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {order.estimatedCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '-'}
                  </TableCell>
                  <TableCell>
                    {order.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(order.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedOS(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Agendar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Atualizar status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar OS
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* OS Details Dialog */}
      <Dialog open={!!selectedOS} onOpenChange={() => setSelectedOS(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>OS #{selectedOS?.id}</DialogTitle>
            <DialogDescription>
              {selectedOS?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedOS && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedOS.customerName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedOS.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOS.customerPhone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={cn('text-white', statusConfig[selectedOS.status]?.color)}>
                    {statusConfig[selectedOS.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prioridade</p>
                  <Badge variant="outline" className={priorityConfig[selectedOS.priority]?.color}>
                    {priorityConfig[selectedOS.priority]?.label}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="text-sm">{selectedOS.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="text-sm font-medium">{selectedOS.assignedTo || 'Não atribuído'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Estimado</p>
                  <p className="text-sm font-medium">
                    R$ {selectedOS.estimatedCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {selectedOS.scheduledAt && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Agendado para {format(selectedOS.scheduledAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
