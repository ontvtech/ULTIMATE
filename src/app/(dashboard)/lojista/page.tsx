'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Calendar,
  Cpu,
  Zap,
} from 'lucide-react'

// Mock data for charts
const conversationData = [
  { day: 'Seg', total: 45, ai: 42, human: 3 },
  { day: 'Ter', total: 52, ai: 48, human: 4 },
  { day: 'Qua', total: 38, ai: 35, human: 3 },
  { day: 'Qui', total: 65, ai: 60, human: 5 },
  { day: 'Sex', total: 48, ai: 45, human: 3 },
  { day: 'Sáb', total: 28, ai: 26, human: 2 },
  { day: 'Dom', total: 15, ai: 14, human: 1 },
]

const revenueData = [
  { month: 'Jan', revenue: 12500, orders: 45 },
  { month: 'Fev', revenue: 15800, orders: 52 },
  { month: 'Mar', revenue: 14200, orders: 48 },
  { month: 'Abr', revenue: 18900, orders: 65 },
  { month: 'Mai', revenue: 16500, orders: 58 },
  { month: 'Jun', revenue: 21200, orders: 72 },
]

const leadStatus = [
  { name: 'Novos', value: 12, color: 'hsl(var(--chart-1))' },
  { name: 'Em Contato', value: 8, color: 'hsl(var(--chart-2))' },
  { name: 'Qualificados', value: 5, color: 'hsl(var(--chart-3))' },
  { name: 'Proposta', value: 3, color: 'hsl(var(--chart-4))' },
]

const recentConversations = [
  { id: '1', customer: 'Maria Silva', phone: '+55 11 98765-4321', status: 'open', lastMessage: 'Quero saber sobre o produto X', time: '2 min', aiMode: true },
  { id: '2', customer: 'Pedro Santos', phone: '+55 11 91234-5678', status: 'handoff', lastMessage: 'Preciso falar com um atendente', time: '5 min', aiMode: false },
  { id: '3', customer: 'Ana Costa', phone: '+55 11 92345-6789', status: 'open', lastMessage: 'Qual o valor do frete?', time: '12 min', aiMode: true },
  { id: '4', customer: 'Carlos Lima', phone: '+55 11 93456-7890', status: 'closed', lastMessage: 'Obrigado pela ajuda!', time: '25 min', aiMode: true },
  { id: '5', customer: 'Lucia Ferreira', phone: '+55 11 94567-8901', status: 'open', lastMessage: 'Tenho uma dúvida sobre pagamento', time: '32 min', aiMode: true },
]

const pendingTasks = [
  { id: '1', type: 'handoff', message: '3 conversas aguardando atendimento humano', priority: 'high' },
  { id: '2', type: 'lead', message: '2 leads quentes sem contato há 24h', priority: 'medium' },
  { id: '3', type: 'order', message: '5 pedidos pendentes de confirmação', priority: 'medium' },
]

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
  ai: {
    label: 'AI',
    color: 'hsl(var(--chart-2))',
  },
  human: {
    label: 'Humano',
    color: 'hsl(var(--chart-3))',
  },
  revenue: {
    label: 'Receita',
    color: 'hsl(var(--chart-1))',
  },
  orders: {
    label: 'Pedidos',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  badge?: string
}

function StatCard({ title, value, description, icon, trend, badge }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {trend && (
            <span className={`inline-flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend.value}%
            </span>
          )}
          {' '}{description}
        </p>
      </CardContent>
    </Card>
  )
}

export default function LojistaDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Phone className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          <Button size="sm">
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Alerts Banner */}
      {pendingTasks.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Você tem {pendingTasks.length} tarefas pendentes
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {pendingTasks.map(t => t.message).join(' • ')}
              </p>
            </div>
            <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
              Ver Tarefas
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conversas Hoje"
          value="291"
          description="vs. ontem"
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 15, isPositive: true }}
          badge="AI: 95%"
        />
        <StatCard
          title="Pedidos do Mês"
          value="72"
          description="vs. mês anterior"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title="Receita do Mês"
          value="R$ 21.200"
          description="vs. mês anterior"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 28, isPositive: true }}
        />
        <StatCard
          title="Taxa de Conversão"
          value="12.5%"
          description="leads em clientes"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Conversations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversas</CardTitle>
            <CardDescription>
              Conversas por dia na última semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={conversationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="ai"
                  stackId="a"
                  fill="hsl(var(--chart-1))"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="human"
                  stackId="a"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                <span className="text-sm text-muted-foreground">AI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                <span className="text-sm text-muted-foreground">Humano</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita</CardTitle>
            <CardDescription>
              Evolução da receita nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `R$${value / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Lead Pipeline */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Funil de Leads</CardTitle>
            <CardDescription>
              Status atual dos leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <PieChart>
                <Pie
                  data={leadStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {leadStatus.map((status) => (
                <div key={status.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {status.name}: {status.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conversas Recentes</CardTitle>
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                {recentConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conversation.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="truncate font-medium">{conversation.customer}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{conversation.time}</p>
                        <div className="flex items-center gap-1">
                          {conversation.aiMode ? (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="mr-1 h-3 w-3" />
                              AI
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Users className="mr-1 h-3 w-3" />
                              Humano
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          conversation.status === 'open'
                            ? 'default'
                            : conversation.status === 'handoff'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {conversation.status === 'open'
                          ? 'Aberta'
                          : conversation.status === 'handoff'
                          ? 'Handoff'
                          : 'Fechada'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Performance */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Taxa de Resolução AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94.2%</div>
            <Progress value={94.2} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">
              274 de 291 conversas resolvidas automaticamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Médio de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2s</div>
            <p className="text-sm text-green-600 mt-1">
              <ArrowDownRight className="inline h-3 w-3" />
              15% mais rápido que a média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Satisfação do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8/5</div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : star === 5 ? 'text-yellow-400 fill-yellow-400/60' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Baseado em 156 avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Tarefas Pendentes
            </CardTitle>
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-500'
                        : task.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-sm">{task.message}</span>
                </div>
                <Button variant="outline" size="sm">
                  Resolver
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
