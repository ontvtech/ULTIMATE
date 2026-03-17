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
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock orders data
const mockOrders = [
  {
    id: '1',
    customerName: 'Maria Silva',
    customerPhone: '+55 11 99999-1111',
    total: 350.0,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    items: [{ name: 'Produto A', quantity: 2, unitPrice: 150 }, { name: 'Produto B', quantity: 1, unitPrice: 50 }],
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    notes: 'Cliente pediu para embalar para presente',
  },
  {
    id: '2',
    customerName: 'João Santos',
    customerPhone: '+55 11 99999-2222',
    total: 890.0,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    items: [{ name: 'Produto C', quantity: 1, unitPrice: 890 }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    notes: '',
  },
  {
    id: '3',
    customerName: 'Ana Costa',
    customerPhone: '+55 11 99999-3333',
    total: 1250.0,
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    items: [{ name: 'Produto D', quantity: 1, unitPrice: 1000 }, { name: 'Produto E', quantity: 5, unitPrice: 50 }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    notes: 'Entrega expressa solicitada',
  },
  {
    id: '4',
    customerName: 'Pedro Oliveira',
    customerPhone: '+55 11 99999-4444',
    total: 420.0,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    items: [{ name: 'Produto F', quantity: 2, unitPrice: 210 }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    trackingCode: 'BR123456789BR',
    notes: '',
  },
  {
    id: '5',
    customerName: 'Carla Mendes',
    customerPhone: '+55 11 99999-5555',
    total: 680.0,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    items: [{ name: 'Produto G', quantity: 1, unitPrice: 680 }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    notes: '',
  },
  {
    id: '6',
    customerName: 'Roberto Lima',
    customerPhone: '+55 11 99999-6666',
    total: 290.0,
    status: 'CANCELED',
    paymentStatus: 'REFUNDED',
    items: [{ name: 'Produto H', quantity: 1, unitPrice: 290 }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    notes: 'Cancelado a pedido do cliente',
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-500', icon: <Clock className="h-4 w-4" /> },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500', icon: <CheckCircle className="h-4 w-4" /> },
  PROCESSING: { label: 'Processando', color: 'bg-purple-500', icon: <Loader2 className="h-4 w-4" /> },
  SHIPPED: { label: 'Enviado', color: 'bg-indigo-500', icon: <Truck className="h-4 w-4" /> },
  DELIVERED: { label: 'Entregue', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  CANCELED: { label: 'Cancelado', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Falhou', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Estornado', color: 'bg-gray-100 text-gray-800' },
}

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [isNewOrderOpen, setIsNewOrderOpen] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<typeof mockOrders[0] | null>(null)

  // Filter orders
  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.id.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const totalRevenue = mockOrders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = mockOrders.filter((o) => o.status === 'PENDING').length
  const processingOrders = mockOrders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length
  const deliveredToday = mockOrders.filter(
    (o) => o.status === 'DELIVERED' && o.deliveredAt && format(o.deliveredAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Gerencie os pedidos da sua loja"
        actions={
          <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Novo Pedido</DialogTitle>
                <DialogDescription>
                  Crie um novo pedido manualmente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Input id="customer" placeholder="Nome ou telefone do cliente" />
                </div>
                <div className="grid gap-2">
                  <Label>Itens do Pedido</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Produto" className="col-span-1" />
                    <Input placeholder="Qtd" type="number" className="col-span-1" />
                    <Input placeholder="Valor" type="number" className="col-span-1" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" placeholder="Notas do pedido..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewOrderOpen(false)}>Criar Pedido</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Pedidos pagos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingOrders}</div>
            <p className="text-xs text-muted-foreground">Sendo preparados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredToday}</div>
            <p className="text-xs text-muted-foreground">Concluídos hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pedidos..."
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

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
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
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerPhone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'text-white',
                        statusConfig[order.status]?.color
                      )}
                    >
                      {statusConfig[order.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={paymentStatusConfig[order.paymentStatus]?.color}>
                      {paymentStatusConfig[order.paymentStatus]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
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
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Truck className="mr-2 h-4 w-4" />
                          Atualizar status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancelar pedido
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

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Detalhes do pedido
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedOrder.customerName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.customerPhone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={cn('text-white', statusConfig[selectedOrder.status]?.color)}>
                    {statusConfig[selectedOrder.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagamento</p>
                  <Badge variant="outline" className={paymentStatusConfig[selectedOrder.paymentStatus]?.color}>
                    {paymentStatusConfig[selectedOrder.paymentStatus]?.label}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Itens do Pedido</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        R$ {(item.unitPrice * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <p className="font-medium">Total</p>
                <p className="text-xl font-bold">
                  R$ {selectedOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
