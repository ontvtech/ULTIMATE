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
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Link2,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  ExternalLink,
  Percent,
  Calendar,
} from 'lucide-react'

// Mock data for charts
const commissionData = [
  { month: 'Jan', commission: 3200, clients: 8 },
  { month: 'Fev', commission: 4100, clients: 10 },
  { month: 'Mar', commission: 3800, clients: 12 },
  { month: 'Abr', commission: 5200, clients: 15 },
  { month: 'Mai', commission: 4800, clients: 18 },
  { month: 'Jun', commission: 6100, clients: 22 },
]

const clientGrowthData = [
  { month: 'Jan', total: 8, new: 2, churn: 0 },
  { month: 'Fev', total: 10, new: 3, churn: 1 },
  { month: 'Mar', total: 12, new: 2, churn: 0 },
  { month: 'Abr', total: 15, new: 4, churn: 1 },
  { month: 'Mai', total: 18, new: 4, churn: 1 },
  { month: 'Jun', total: 22, new: 5, churn: 1 },
]

const clientStatus = [
  { name: 'Ativos', value: 18, color: 'hsl(var(--chart-1))' },
  { name: 'Trial', value: 3, color: 'hsl(var(--chart-2))' },
  { name: 'Atrasados', value: 1, color: 'hsl(var(--destructive))' },
]

const recentClients = [
  { id: '1', name: 'Loja Fashion', plan: 'Professional', status: 'active', commission: 89.90, createdAt: '2024-01-15' },
  { id: '2', name: 'Mecânica Auto', plan: 'Starter', status: 'trialing', commission: 49.90, createdAt: '2024-01-14' },
  { id: '3', name: 'Café Gourmet', plan: 'Professional', status: 'active', commission: 89.90, createdAt: '2024-01-12' },
  { id: '4', name: 'Pet Shop Friends', plan: 'Starter', status: 'active', commission: 49.90, createdAt: '2024-01-10' },
  { id: '5', name: 'Clínica Saúde', plan: 'Enterprise', commission: 199.90, status: 'active', createdAt: '2024-01-08' },
]

const referralLinks = [
  { id: '1', name: 'Link Principal', code: 'REV-PREMIUM', clicks: 234, conversions: 12 },
  { id: '2', name: 'Campanha Google', code: 'REV-GOOGLE', clicks: 156, conversions: 8 },
  { id: '3', name: 'Instagram', code: 'REV-INSTA', clicks: 89, conversions: 5 },
]

const chartConfig = {
  commission: {
    label: 'Comissão',
    color: 'hsl(var(--chart-1))',
  },
  clients: {
    label: 'Clientes',
    color: 'hsl(var(--chart-2))',
  },
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
  new: {
    label: 'Novos',
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
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
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

export default function RevendedorDashboard() {
  const [copiedLink, setCopiedLink] = React.useState<string | null>(null)

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`https://app.saaswpp.ai/r/${code}`)
    setCopiedLink(code)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Revendedor</h1>
          <p className="text-muted-foreground">
            Acompanhe seus clientes e comissões
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Link2 className="mr-2 h-4 w-4" />
            Criar Link
          </Button>
          <Button size="sm">
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clientes Ativos"
          value="22"
          description="vs. mês anterior"
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 22, isPositive: true }}
        />
        <StatCard
          title="Comissão Mensal"
          value="R$ 6.100"
          description="vs. mês anterior"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 27, isPositive: true }}
        />
        <StatCard
          title="Taxa de Conversão"
          value="8.5%"
          description="de visitantes para clientes"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="MRR dos Clientes"
          value="R$ 2.847"
          description="receita recorrente"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Commission Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Comissões</CardTitle>
            <CardDescription>
              Evolução das comissões nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart data={commissionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `R$${value / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="commission"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Client Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Clientes</CardTitle>
            <CardDescription>
              Total de clientes e novos cadastros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={clientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="new"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Client Status */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Status dos Clientes</CardTitle>
            <CardDescription>
              Distribuição por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <PieChart>
                <Pie
                  data={clientStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {clientStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {clientStatus.map((status) => (
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

        {/* Referral Links */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Links de Indicação</CardTitle>
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{link.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {link.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p>{link.clicks} cliques</p>
                      <p className="text-muted-foreground">
                        {link.conversions} conversões
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(link.code)}
                    >
                      {copiedLink === link.code ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Clientes Recentes</CardTitle>
            <Button variant="ghost" size="sm">
              Ver todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px]">
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.plan} • {client.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        R$ {client.commission.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">comissão/mês</p>
                    </div>
                    <Badge
                      variant={
                        client.status === 'active'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {client.status === 'active' ? 'Ativo' : 'Trial'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Commission Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Sua Taxa de Comissão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">20%</div>
            <p className="text-sm text-muted-foreground mt-1">
              Nível: Bronze (próximo: Prata a 25%)
            </p>
            <Progress value={60} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Faltam 8 clientes para o próximo nível
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Comissão Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 1.234</div>
            <p className="text-sm text-muted-foreground mt-1">
              Disponível para saque
            </p>
            <Button size="sm" className="mt-3 w-full">
              Solicitar Saque
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximo Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15 Jan</div>
            <p className="text-sm text-muted-foreground mt-1">
              R$ 6.100 em comissões
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
