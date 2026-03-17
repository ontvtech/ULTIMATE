'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Play,
  Pause,
  Copy,
  Megaphone,
  Users,
  Mail,
  Send,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock campaigns data
const mockCampaigns = [
  {
    id: '1',
    name: 'Promoção de Verão',
    type: 'PROMOTIONAL',
    status: 'ACTIVE',
    segment: 'Clientes ativos',
    templateText: 'Olá {nome}! Aproveite nossa promoção de verão com 20% de desconto!',
    totalRecipients: 450,
    sentCount: 320,
    deliveredCount: 298,
    readCount: 187,
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: '2',
    name: 'Aniversariantes do Mês',
    type: 'ANNIVERSARY',
    status: 'SCHEDULED',
    segment: 'Aniversariantes de Junho',
    templateText: 'Feliz aniversário, {nome}! 🎂 Tenha um dia especial!',
    totalRecipients: 85,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: '3',
    name: 'Reativação de Clientes',
    type: 'REACTIVATION',
    status: 'DRAFT',
    segment: 'Inativos há 30+ dias',
    templateText: 'Sentimos sua falta, {nome}! Volte e ganhe 15% de desconto!',
    totalRecipients: 120,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: '4',
    name: 'Black Friday 2024',
    type: 'PROMOTIONAL',
    status: 'COMPLETED',
    segment: 'Todos os clientes',
    templateText: 'Black Friday é aqui! Descontos de até 50%!',
    totalRecipients: 1200,
    sentCount: 1200,
    deliveredCount: 1150,
    readCount: 890,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
  },
  {
    id: '5',
    name: 'Novos Produtos',
    type: 'NEWS',
    status: 'PAUSED',
    segment: 'Clientes VIP',
    templateText: '{nome}, confira nossos novos produtos exclusivos!',
    totalRecipients: 150,
    sentCount: 50,
    deliveredCount: 48,
    readCount: 32,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500', icon: <Edit className="h-4 w-4" /> },
  SCHEDULED: { label: 'Agendada', color: 'bg-blue-500', icon: <Clock className="h-4 w-4" /> },
  ACTIVE: { label: 'Ativa', color: 'bg-green-500', icon: <Play className="h-4 w-4" /> },
  PAUSED: { label: 'Pausada', color: 'bg-yellow-500', icon: <Pause className="h-4 w-4" /> },
  COMPLETED: { label: 'Concluída', color: 'bg-purple-500', icon: <CheckCircle className="h-4 w-4" /> },
  CANCELED: { label: 'Cancelada', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
}

const typeConfig: Record<string, string> = {
  PROMOTIONAL: 'Promocional',
  ANNIVERSARY: 'Aniversário',
  REACTIVATION: 'Reativação',
  NEWS: 'Novidades',
  TRANSACTIONAL: 'Transacional',
}

export default function CampanhasPage() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [isNewCampaignOpen, setIsNewCampaignOpen] = React.useState(false)
  const [selectedCampaign, setSelectedCampaign] = React.useState<typeof mockCampaigns[0] | null>(null)

  // Filter campaigns
  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const activeCampaigns = mockCampaigns.filter((c) => c.status === 'ACTIVE').length
  const totalMessagesSent = mockCampaigns.reduce((sum, c) => sum + c.sentCount, 0)
  const avgDeliveryRate = mockCampaigns
    .filter((c) => c.sentCount > 0)
    .reduce((sum, c) => sum + (c.deliveredCount / c.sentCount) * 100, 0) / mockCampaigns.filter((c) => c.sentCount > 0).length
  const avgReadRate = mockCampaigns
    .filter((c) => c.deliveredCount > 0)
    .reduce((sum, c) => sum + (c.readCount / c.deliveredCount) * 100, 0) / mockCampaigns.filter((c) => c.deliveredCount > 0).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campanhas"
        description="Gerencie suas campanhas de marketing via WhatsApp"
        actions={
          <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nova Campanha</DialogTitle>
                <DialogDescription>
                  Crie uma nova campanha de marketing
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Campanha</Label>
                  <Input id="name" placeholder="Ex: Promoção de Verão" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROMOTIONAL">Promocional</SelectItem>
                        <SelectItem value="ANNIVERSARY">Aniversário</SelectItem>
                        <SelectItem value="REACTIVATION">Reativação</SelectItem>
                        <SelectItem value="NEWS">Novidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Segmento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os clientes</SelectItem>
                        <SelectItem value="active">Clientes ativos</SelectItem>
                        <SelectItem value="vip">Clientes VIP</SelectItem>
                        <SelectItem value="inactive">Clientes inativos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template">Mensagem</Label>
                  <Textarea
                    id="template"
                    placeholder="Olá {nome}! Sua mensagem aqui..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {'{nome}'} para personalizar com o nome do cliente
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data de Envio</Label>
                    <Input type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Horário</Label>
                    <Input type="time" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="secondary" onClick={() => setIsNewCampaignOpen(false)}>
                  Salvar Rascunho
                </Button>
                <Button onClick={() => setIsNewCampaignOpen(false)}>
                  Agendar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Em execução</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessagesSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de envios</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDeliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média das campanhas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Leitura</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgReadRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média das campanhas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
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

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Destinatários</TableHead>
                <TableHead className="text-center">Entregues</TableHead>
                <TableHead className="text-center">Lidos</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <p className="font-medium">{campaign.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeConfig[campaign.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{campaign.segment}</TableCell>
                  <TableCell>
                    <Badge className={cn('text-white', statusConfig[campaign.status]?.color)}>
                      {statusConfig[campaign.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{campaign.totalRecipients}</TableCell>
                  <TableCell className="text-center">
                    {campaign.sentCount > 0 ? (
                      <span className="text-green-600">
                        {campaign.deliveredCount} ({Math.round((campaign.deliveredCount / campaign.sentCount) * 100)}%)
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.deliveredCount > 0 ? (
                      <span className="text-blue-600">
                        {campaign.readCount} ({Math.round((campaign.readCount / campaign.deliveredCount) * 100)}%)
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {campaign.scheduledAt
                      ? format(campaign.scheduledAt, "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : format(campaign.createdAt, "dd/MM/yyyy", { locale: ptBR })}
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
                        <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        {campaign.status === 'ACTIVE' && (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        {campaign.status === 'PAUSED' && (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Retomar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
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
    </div>
  )
}
