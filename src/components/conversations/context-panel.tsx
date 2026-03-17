'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  User,
  Phone,
  Mail,
  Tag,
  Calendar,
  ShoppingCart,
  Wrench,
  FileText,
  ChevronRight,
  Plus,
  Star,
  Clock,
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CustomerContext {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  status: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
}

interface LeadContext {
  id: string;
  status: string;
  stage: string;
  score: number;
  isHot: boolean;
  lastInteractionAt?: string;
}

interface OrderSummary {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

interface ServiceOrderSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface AppointmentSummary {
  id: string;
  title?: string;
  startAt: string;
  status: string;
}

interface ContextPanelProps {
  customer?: CustomerContext;
  lead?: LeadContext;
  orders?: OrderSummary[];
  serviceOrders?: ServiceOrderSummary[];
  appointments?: AppointmentSummary[];
  notes?: string;
  isLoading?: boolean;
  onAddNote?: (note: string) => void;
  onCreateOrder?: () => void;
  onCreateServiceOrder?: () => void;
  onCreateAppointment?: () => void;
}

export function ContextPanel({
  customer,
  lead,
  orders = [],
  serviceOrders = [],
  appointments = [],
  notes,
  isLoading,
  onAddNote,
  onCreateOrder,
  onCreateServiceOrder,
  onCreateAppointment,
}: ContextPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim() || !onAddNote) return;
    setIsAddingNote(true);
    await onAddNote(newNote.trim());
    setNewNote('');
    setIsAddingNote(false);
  };

  if (isLoading) {
    return (
      <div className="w-80 border-l bg-background p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-80 border-l bg-background p-4">
        <div className="text-center text-muted-foreground py-8">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Selecione uma conversa para ver o contexto</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="w-80 border-l bg-background flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{customer.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Phone className="h-3 w-3" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3" />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-center p-2 bg-muted rounded">
                  <p className="text-lg font-bold">{customer.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="text-lg font-bold">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Info */}
          {lead && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Lead
                  {lead.isHot && (
                    <Badge className="bg-orange-500 text-xs">Quente</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estágio</span>
                    <Badge variant="outline">{lead.stage}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <div className="flex items-center gap-1">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{lead.score}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge>{lead.status}</Badge>
                  </div>
                  {lead.lastInteractionAt && (
                    <p className="text-xs text-muted-foreground pt-2">
                      Última interação:{' '}
                      {formatDistanceToNow(new Date(lead.lastInteractionAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onCreateOrder}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Criar Pedido
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onCreateServiceOrder}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Criar OS
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onCreateAppointment}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>

          <Separator />

          {/* Recent Orders */}
          {orders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Pedidos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Service Orders */}
          {serviceOrders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  OS Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {serviceOrders.slice(0, 3).map((so) => (
                  <div
                    key={so.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{so.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(so.createdAt), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={so.priority === 'HIGH' ? 'destructive' : 'outline'}
                    >
                      {so.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Appointments */}
          {appointments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {appointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {apt.title || 'Agendamento'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.startAt), "dd/MM 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">{apt.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {notes}
                </p>
              )}
              <div className="space-y-2">
                <Textarea
                  placeholder="Adicionar nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  className="w-full"
                >
                  {isAddingNote ? 'Salvando...' : 'Salvar Nota'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
