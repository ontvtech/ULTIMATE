'use client';

import { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Check,
  CheckCheck,
  Clock,
  Bot,
  User,
  FileText,
  Image as ImageIcon,
  Mic,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export interface Message {
  id: string;
  conversationId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  contentType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO';
  content: string;
  aiGenerated: boolean;
  aiProvider?: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
}

interface ChatWindowProps {
  messages: Message[];
  customerName: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ChatWindow({
  messages,
  customerName,
  isLoading,
  onLoadMore,
  hasMore,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  useEffect(() => {
    if (isNearBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isNearBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setIsNearBottom(isBottom);

    // Load more when scrolled to top
    if (target.scrollTop < 100 && hasMore && onLoadMore) {
      onLoadMore();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'DELIVERED':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'READ':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'FAILED':
        return <Check className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="h-4 w-4" />;
      case 'DOCUMENT':
        return <FileText className="h-4 w-4" />;
      case 'AUDIO':
        return <Mic className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.createdAt), 'yyyy-MM-dd');
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({
          date: format(new Date(msg.createdAt), "d 'de' MMMM", { locale: ptBR }),
          messages: [msg],
        });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}
            >
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="font-medium">Nenhuma mensagem ainda</h3>
          <p className="text-sm">
            As mensagens aparecerão aqui quando a conversa começar
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <ScrollArea className="flex-1 p-4" onScroll={handleScroll} ref={scrollRef}>
      <div className="space-y-6">
        {messageGroups.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <Badge variant="outline" className="text-xs">
                {group.date}
              </Badge>
            </div>

            {/* Messages */}
            <div className="space-y-2">
              {group.messages.map((message) => {
                const isInbound = message.direction === 'INBOUND';

                return (
                  <div
                    key={message.id}
                    className={cn('flex', isInbound ? 'justify-start' : 'justify-end')}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-lg p-3 relative group',
                        isInbound
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      )}
                    >
                      {/* Content type indicator */}
                      {message.contentType !== 'TEXT' && (
                        <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                          {getContentTypeIcon(message.contentType)}
                          <span>{message.contentType.toLowerCase()}</span>
                        </div>
                      )}

                      {/* Message content */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* Footer with time and status */}
                      <div
                        className={cn(
                          'flex items-center justify-end gap-1 mt-1',
                          isInbound ? 'text-muted-foreground' : 'text-primary-foreground/70'
                        )}
                      >
                        <span className="text-xs">
                          {format(new Date(message.createdAt), 'HH:mm')}
                        </span>
                        {!isInbound && getStatusIcon(message.status)}
                      </div>

                      {/* AI indicator */}
                      {message.aiGenerated && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                          <Bot className="h-3 w-3" />
                        </div>
                      )}

                      {/* Message actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Copiar</DropdownMenuItem>
                          <DropdownMenuItem>Encaminhar</DropdownMenuItem>
                          {message.aiGenerated && (
                            <DropdownMenuItem>Ver prompt</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
