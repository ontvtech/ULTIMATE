'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Phone, Search, Filter, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING' | 'HANDOFF';
  aiMode: boolean;
  assignedMode: 'AI' | 'HUMAN';
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  tags: string[];
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onFilter?: (filters: ConversationFilters) => void;
}

export interface ConversationFilters {
  status?: string;
  mode?: string;
  search?: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onFilter,
}: ConversationListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');

  useEffect(() => {
    if (onFilter) {
      onFilter({
        status: statusFilter === 'all' ? undefined : statusFilter,
        mode: modeFilter === 'all' ? undefined : modeFilter,
        search: search || undefined,
      });
    }
  }, [search, statusFilter, modeFilter, onFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-500';
      case 'CLOSED':
        return 'bg-gray-400';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'HANDOFF':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Aberto';
      case 'CLOSED':
        return 'Fechado';
      case 'PENDING':
        return 'Pendente';
      case 'HANDOFF':
        return 'Handoff';
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-background">
      {/* Search and Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="OPEN">Abertos</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
              <SelectItem value="HANDOFF">Handoff</SelectItem>
              <SelectItem value="CLOSED">Fechados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Modo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="AI">IA</SelectItem>
              <SelectItem value="HUMAN">Humano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  'p-4 cursor-pointer transition-colors hover:bg-muted/50',
                  selectedId === conv.id && 'bg-muted'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {conv.customerName?.charAt(0) || '?'}
                      </span>
                    </div>
                    {/* Status indicator */}
                    <div
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background',
                        getStatusColor(conv.status)
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium truncate">
                        {conv.customerName || 'Cliente'}
                      </h4>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {conv.customerPhone}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conv.lastMessagePreview}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {/* Mode Badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          conv.assignedMode === 'AI'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-green-500 text-green-500'
                        )}
                      >
                        {conv.assignedMode === 'AI' ? (
                          <>
                            <Bot className="h-3 w-3 mr-1" />
                            IA
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Humano
                          </>
                        )}
                      </Badge>
                      {/* Tags */}
                      {conv.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {/* Unread count */}
                      {conv.unreadCount > 0 && (
                        <Badge className="ml-auto bg-primary text-primary-foreground">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
