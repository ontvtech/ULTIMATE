'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock financial data
const mockFinancialSummary = {
  currentBalance: 15420.5,
  monthlyRevenue: 28500.0,
  monthlyExpenses: 18200.0,
  pendingReceivables: 5200.0,
  overduePayments: 850.0,
}

const mockTransactions = [
  {
    id: '1',
    type: 'INCOME',
    description: 'Venda #1234 - Maria Silva',
    amount: 350.0,
    category: 'Vendas',
    date: new Date(),
    status: 'COMPLETED',
  },
  {
    id: '2',
    type: 'INCOME',
    description: 'Venda #1235 - João Santos',
    amount: 890.0,
    category: 'Vendas',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'COMPLETED',
  },
  {
    id: '3',
    type: 'EXPENSE',
    description: 'Fornecedor - Produtos',
    amount: -1500.0,
    category: 'Fornecedores',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: 'COMPLETED',
  },
  {
    id: '4',
    type: 'INCOME',
    description: 'Serviço - Ana Costa',
    amount: 520.0,
    category: 'Serviços',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'COMPLETED',
  },
  {
    id: '5',
    type: 'EXPENSE',
    description: 'Aluguel - Mensal',
    amount: -2500.0,
    category: 'Despesas Fixas',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: 'COMPLETED',
  },
  {
    id: '6',
    type: 'INCOME',
    description: 'Venda #1236 - Pedro Oliveira',
    amount: 1280.0,
    category: 'Vendas',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    status: 'PENDING',
  },
  {
    id: '7',
    type: 'EXPENSE',
    description: 'Marketing - Anúncios',
    amount: -800.0,
    category: 'Marketing',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96),
    status: 'COMPLETED',
  },
]

const mockMonthlyData = [
  { month: 'Jan', revenue: 22000, expenses: 15000 },
  { month: 'Fev', revenue: 25000, expenses: 16500 },
  { month: 'Mar', revenue: 28000, expenses: 18000 },
  { month: 'Abr', revenue: 26000, expenses: 17500 },
  { month: 'Mai', revenue: 31000, expenses: 19000 },
  { month: 'Jun', revenue: 28500, expenses: 18200 },
]

const expenseCategories = [
  { name: 'Fornecedores', value: 4500, color: '#3B82F6' },
  { name: 'Despesas Fixas', value: 3200, color: '#8B5CF6' },
  { name: 'Marketing', value: 1800, color: '#EC4899' },
  { name: 'Pessoal', value: 6500, color: '#F59E0B' },
  { name: 'Outros', value: 2200, color: '#6B7280' },
]

export default function FinanceiroPage() {
  const [period, setPeriod] = React.useState<string>('this_month')

  // Calculate totals
  const totalIncome = mockTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = mockTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const netProfit = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Acompanhe a saúde financeira do seu negócio"
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">Esta semana</SelectItem>
              <SelectItem value="this_month">Este mês</SelectItem>
              <SelectItem value="last_month">Mês anterior</SelectItem>
              <SelectItem value="this_quarter">Este trimestre</SelectItem>
              <SelectItem value="this_year">Este ano</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {mockFinancialSummary.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Em contas bancárias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {mockFinancialSummary.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12%
              </span>{' '}
              vs mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {mockFinancialSummary.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5%
              </span>{' '}
              vs mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <PiggyBank className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {mockFinancialSummary.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockFinancialSummary.overduePayments > 0 && (
                <span className="text-red-600">
                  R$ {mockFinancialSummary.overduePayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em atraso
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMonthlyData.map((data) => (
                <div key={data.month} className="flex items-center gap-4">
                  <span className="w-10 text-sm text-muted-foreground">{data.month}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 w-16">Rec</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(data.revenue / 35000) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs w-16 text-right">
                        R$ {(data.revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 w-16">Desp</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(data.expenses / 35000) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs w-16 text-right">
                        R$ {(data.expenses / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map((category) => {
                const totalExpenses = expenseCategories.reduce((sum, c) => sum + c.value, 0)
                const percentage = ((category.value / totalExpenses) * 100).toFixed(1)
                return (
                  <div key={category.name} className="flex items-center gap-4">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 text-sm">{category.name}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: category.color,
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      R$ {(category.value / 1000).toFixed(1)}k
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center',
                      transaction.type === 'INCOME'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    )}
                  >
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{format(transaction.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'font-medium',
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={transaction.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                    {transaction.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
