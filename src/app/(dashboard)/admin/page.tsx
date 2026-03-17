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
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from 'lucide-react'

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, growth: 12 },
  { month: 'Fev', revenue: 52000, growth: 15 },
  { month: 'Mar', revenue: 48000, growth: -8 },
  { month: 'Abr', revenue: 61000, growth: 27 },
  { month: 'Mai', revenue: 55000, growth: -10 },
  { month: 'Jun', revenue: 67000, growth: 22 },
]

const tenantGrowthData = [
  { month: 'Jan', tenants: 120, new: 15 },
  { month: 'Fev', tenants: 138, new: 18 },
  { month: 'Mar', tenants: 152, new: 14 },
  { month: 'Abr', tenants: 171, new: 19 },
  { month: 'Mai', tenants: 193, new: 22 },
  { month: 'Jun', tenants: 215, new: 22 },
]

const planDistribution = [
  { name: 'Free', value: 45, color: 'hsl(var(--muted-foreground))' },
  { name: 'Starter', value: 89, color: 'hsl(var(--chart-1))' },
  { name: 'Professional', value: 56, color: 'hsl(var(--chart-2))' },
  { name: 'Enterprise', value: 25, color: 'hsl(var(--chart-3))' },
]

const recentTenants = [
  { id: '1', name: 'Loja ABC', plan: 'Professional', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Mercado XYZ', plan: 'Starter', status: 'trialing', createdAt: '2024-01-14' },
  { id: '3', name: 'Restaurante 123', plan: 'Enterprise', status: 'active', createdAt: '2024-01-13' },
  { id: '4', name: 'Farmácia Saúde', plan: 'Professional', status: 'active', createdAt: '2024-01-12' },
  { id: '5', name: 'Pet Shop Amigo', plan: 'Starter', status: 'past_due', createdAt: '2024-01-11' },
]

const alerts = [
  { id: '1', type: 'critical', message: '3 tenants com pagamento vencido há mais de 7 dias', count: 3 },
  { id: '2', type: 'warning', message: 'Integração Meta API com latência elevada', count: 1 },
  { id: '3', type: 'info', message: '15 novos leads de revendedores esta semana', count: 15 },
]

const chartConfig = {
  revenue: {
    label: 'Receita',
    color: 'hsl(var(--chart-1))',
  },
  growth: {
    label: 'Crescimento',
    color: 'hsl(var(--chart-2))',
  },
  tenants: {
    label: 'Tenants',
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

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma SaaSWPP AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Exportar Relatório
          </Button>
          <Button size="sm">
            Novo Tenant
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value="215"
          description="vs. mês anterior"
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Receita Mensal"
          value="R$ 67.450"
          description="vs. mês anterior"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 22, isPositive: true }}
        />
        <StatCard
          title="Usuários Ativos"
          value="1.234"
          description="vs. mês anterior"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Taxa de Conversão"
          value="24.5%"
          description="vs. mês anterior"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
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

        {/* Tenant Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Tenants</CardTitle>
            <CardDescription>
              Total de tenants e novos cadastros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={tenantGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="tenants"
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
        {/* Plan Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
            <CardDescription>
              Tenants ativos por tipo de plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {plan.name}: {plan.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tenants */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tenants Recentes</CardTitle>
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-4">
                {recentTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tenant.plan}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          tenant.status === 'active'
                            ? 'default'
                            : tenant.status === 'trialing'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {tenant.status === 'active'
                          ? 'Ativo'
                          : tenant.status === 'trialing'
                          ? 'Trial'
                          : 'Atrasado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      alert.type === 'critical'
                        ? 'bg-red-500'
                        : alert.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-sm">{alert.message}</span>
                </div>
                <Badge variant="outline">{alert.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
