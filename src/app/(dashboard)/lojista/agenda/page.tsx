'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock appointments data
const mockAppointments = [
  {
    id: '1',
    title: 'Consulta - Maria Silva',
    customerName: 'Maria Silva',
    customerPhone: '+55 11 99999-1111',
    startAt: new Date(new Date().setHours(9, 0, 0, 0)),
    endAt: new Date(new Date().setHours(10, 0, 0, 0)),
    status: 'CONFIRMED',
    description: 'Consulta de rotina',
  },
  {
    id: '2',
    title: 'Retorno - João Santos',
    customerName: 'João Santos',
    customerPhone: '+55 11 99999-2222',
    startAt: new Date(new Date().setHours(10, 30, 0, 0)),
    endAt: new Date(new Date().setHours(11, 0, 0, 0)),
    status: 'SCHEDULED',
    description: 'Retorno de avaliação',
  },
  {
    id: '3',
    title: 'Procedimento - Ana Costa',
    customerName: 'Ana Costa',
    customerPhone: '+55 11 99999-3333',
    startAt: new Date(new Date().setHours(14, 0, 0, 0)),
    endAt: new Date(new Date().setHours(15, 30, 0, 0)),
    status: 'SCHEDULED',
    description: 'Procedimento estético',
  },
  {
    id: '4',
    title: 'Consulta - Pedro Oliveira',
    customerName: 'Pedro Oliveira',
    customerPhone: '+55 11 99999-4444',
    startAt: new Date(addDays(new Date(), 1).setHours(9, 0, 0, 0)),
    endAt: new Date(addDays(new Date(), 1).setHours(10, 0, 0, 0)),
    status: 'CONFIRMED',
    description: 'Primeira consulta',
  },
  {
    id: '5',
    title: 'Retorno - Carla Mendes',
    customerName: 'Carla Mendes',
    customerPhone: '+55 11 99999-5555',
    startAt: new Date(addDays(new Date(), 2).setHours(11, 0, 0, 0)),
    endAt: new Date(addDays(new Date(), 2).setHours(12, 0, 0, 0)),
    status: 'SCHEDULED',
    description: 'Retorno pós-procedimento',
  },
  {
    id: '6',
    title: 'Cancelado - Roberto Lima',
    customerName: 'Roberto Lima',
    customerPhone: '+55 11 99999-6666',
    startAt: new Date(addDays(new Date(), 3).setHours(15, 0, 0, 0)),
    endAt: new Date(addDays(new Date(), 3).setHours(16, 0, 0, 0)),
    status: 'CANCELLED',
    description: 'Consulta cancelada pelo cliente',
  },
]

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-500',
  CONFIRMED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  COMPLETED: 'bg-gray-500',
  NO_SHOW: 'bg-orange-500',
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
  NO_SHOW: 'Não compareceu',
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [view, setView] = React.useState<'day' | 'week'>('week')
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = React.useState(false)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  // Get appointments for selected date
  const selectedDateAppointments = mockAppointments.filter((apt) =>
    selectedDate && isSameDay(apt.startAt, selectedDate)
  )

  // Get appointments for the week
  const weekAppointments = mockAppointments.filter((apt) => {
    return apt.startAt >= weekStart && apt.startAt <= weekEnd
  })

  // Stats
  const todayAppointments = mockAppointments.filter((apt) =>
    isToday(apt.startAt)
  )
  const confirmedToday = todayAppointments.filter(
    (apt) => apt.status === 'CONFIRMED'
  ).length
  const pendingToday = todayAppointments.filter(
    (apt) => apt.status === 'SCHEDULED'
  ).length

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) =>
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    )
  }

  // Generate hours for the day view
  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 8 PM

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Gerencie seus agendamentos e compromissos"
        actions={
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Agende um novo compromisso com seu cliente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Ex: Consulta de rotina" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Horário</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Input id="customer" placeholder="Nome do cliente" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" placeholder="Notas adicionais..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewAppointmentOpen(false)}>
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
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Agendamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedToday}</div>
            <p className="text-xs text-muted-foreground">Para hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingToday}</div>
            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Total de agendamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Schedule */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Calendar Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={ptBR}
            />

            {/* Selected Date Appointments */}
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">
                {selectedDate
                  ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                  : 'Selecione uma data'}
              </h4>
              <div className="space-y-2">
                {selectedDateAppointments.length > 0 ? (
                  selectedDateAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                    >
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          statusColors[apt.status]
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{apt.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(apt.startAt, 'HH:mm')} - {format(apt.endAt, 'HH:mm')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {statusLabels[apt.status]}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(weekStart, 'dd MMM', { locale: ptBR })} -{' '}
                {format(weekEnd, 'dd MMM yyyy', { locale: ptBR })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={view}
                onValueChange={(v) => setView(v as 'day' | 'week')}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="day">Dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week Days Header */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-center text-sm text-muted-foreground">
                Hora
              </div>
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(weekStart, i)
                return (
                  <div
                    key={i}
                    className={cn(
                      'p-2 text-center',
                      isToday(day) && 'bg-emerald-50 dark:bg-emerald-950 rounded-lg'
                    )}
                  >
                    <p className="text-sm font-medium">
                      {format(day, 'EEE', { locale: ptBR })}
                    </p>
                    <p
                      className={cn(
                        'text-lg font-bold',
                        isToday(day) && 'text-emerald-600'
                      )}
                    >
                      {format(day, 'd')}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Hours Grid */}
            <div className="max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-8 gap-1">
                {hours.map((hour) => (
                  <React.Fragment key={hour}>
                    {/* Hour Label */}
                    <div className="h-12 flex items-center justify-center text-sm text-muted-foreground border-t">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {/* Day Columns */}
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = addDays(weekStart, dayIndex)
                      const dayAppointments = mockAppointments.filter((apt) => {
                        const aptHour = apt.startAt.getHours()
                        return isSameDay(apt.startAt, day) && aptHour === hour
                      })

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            'h-12 border-t border-l p-1',
                            isToday(day) && 'bg-emerald-50/50 dark:bg-emerald-950/50'
                          )}
                        >
                          {dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={cn(
                                'h-full rounded text-xs p-1 truncate cursor-pointer hover:opacity-80',
                                statusColors[apt.status],
                                'text-white'
                              )}
                              title={`${apt.title} - ${apt.customerName}`}
                            >
                              {apt.title}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
              {Object.entries(statusColors).map(([, color], index) => {
                const status = Object.keys(statusColors)[index]
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={cn('h-3 w-3 rounded', color)} />
                    <span className="text-sm text-muted-foreground">
                      {statusLabels[status]}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
