'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationList, ChatWindow, MessageComposer, ContextPanel } from '@/components/conversations';
import { ConversationActions } from '@/components/conversations/conversation-actions';
import type { Conversation, ConversationFilters, Message } from '@/components/conversations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PanelRightClose, PanelRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockConversations: Conversation[] = [
  {
    id: '1',
    customerId: 'c1',
    customerName: 'Maria Silva',
    customerPhone: '+55 11 99999-1111',
    status: 'OPEN',
    aiMode: true,
    assignedMode: 'AI',
    lastMessageAt: new Date().toISOString(),
    lastMessagePreview: 'Olá, gostaria de saber sobre os preços...',
    unreadCount: 2,
    tags: ['cliente', 'interessado'],
  },
  {
    id: '2',
    customerId: 'c2',
    customerName: 'João Santos',
    customerPhone: '+55 11 99999-2222',
    status: 'OPEN',
    aiMode: true,
    assignedMode: 'HUMAN',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    lastMessagePreview: 'Preciso de ajuda com meu pedido',
    unreadCount: 0,
    tags: ['suporte'],
  },
  {
    id: '3',
    customerId: 'c3',
    customerName: 'Ana Costa',
    customerPhone: '+55 11 99999-3333',
    status: 'PENDING',
    aiMode: true,
    assignedMode: 'AI',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    lastMessagePreview: 'Qual o horário de funcionamento?',
    unreadCount: 1,
    tags: [],
  },
  {
    id: '4',
    customerId: 'c4',
    customerName: 'Pedro Oliveira',
    customerPhone: '+55 11 99999-4444',
    status: 'HANDOFF',
    aiMode: true,
    assignedMode: 'HUMAN',
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    lastMessagePreview: 'Estou muito insatisfeito com o serviço!',
    unreadCount: 3,
    tags: ['urgente', 'reclamação'],
  },
];

const mockMessages: Message[] = [
  {
    id: 'm1',
    conversationId: '1',
    direction: 'INBOUND',
    contentType: 'TEXT',
    content: 'Olá! Vi o anúncio de vocês no Instagram',
    aiGenerated: false,
    status: 'READ',
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'm2',
    conversationId: '1',
    direction: 'OUTBOUND',
    contentType: 'TEXT',
    content: 'Olá! Seja muito bem-vindo(a)! 😊 Como posso ajudar você hoje?',
    aiGenerated: true,
    aiProvider: 'OPENAI',
    status: 'READ',
    createdAt: new Date(Date.now() - 580000).toISOString(),
  },
  {
    id: 'm3',
    conversationId: '1',
    direction: 'INBOUND',
    contentType: 'TEXT',
    content: 'Gostaria de saber os preços dos serviços de limpeza dental',
    aiGenerated: false,
    status: 'READ',
    createdAt: new Date(Date.now() - 560000).toISOString(),
  },
  {
    id: 'm4',
    conversationId: '1',
    direction: 'OUTBOUND',
    contentType: 'TEXT',
    content:
      'Temos opções de limpeza dental a partir de R$ 150,00. O valor pode variar de acordo com o tipo de procedimento:\n\n' +
      '• Limpeza simples: R$ 150,00\n' +
      '• Limpeza com polimento: R$ 200,00\n' +
      '• Limpeza completa (com flúor): R$ 250,00\n\n' +
      'Gostaria de agendar uma avaliação?',
    aiGenerated: true,
    aiProvider: 'OPENAI',
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 540000).toISOString(),
  },
];

export default function ConversasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(true);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedId) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMessages(mockMessages);
        setIsLoading(false);
      }, 500);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const handleFilter = useCallback((filters: ConversationFilters) => {
    console.log('Filtering:', filters);
    // In production, this would call the API
  }, []);

  const handleSendMessage = async (content: string, viaAI: boolean) => {
    if (!selectedId) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      conversationId: selectedId,
      direction: 'OUTBOUND',
      contentType: 'TEXT',
      content,
      aiGenerated: viaAI,
      aiProvider: viaAI ? 'OPENAI' : undefined,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Update conversation preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessagePreview: content.slice(0, 50),
              lastMessageAt: new Date().toISOString(),
            }
          : c
      )
    );

    toast({
      title: viaAI ? 'Mensagem enviada via IA' : 'Mensagem enviada',
      description: viaAI
        ? 'A IA processou e enviou sua resposta'
        : 'Mensagem enviada com sucesso',
    });
  };

  const handleTakeOver = () => {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, assignedMode: 'HUMAN' } : c
      )
    );
    toast({ title: 'Conversa assumida', description: 'Você agora está atendendo esta conversa' });
  };

  const handleReturnToAI = () => {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, assignedMode: 'AI' } : c
      )
    );
    toast({ title: 'Retornou para IA', description: 'A IA voltou a atender esta conversa' });
  };

  const handleClose = () => {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, status: 'CLOSED' } : c
      )
    );
    setSelectedId(null);
    toast({ title: 'Conversa encerrada' });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Left Column - Conversation List */}
      <div className="w-80 shrink-0">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onFilter={handleFilter}
        />
      </div>

      {/* Center Column - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-medium">{selectedConversation.customerName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.customerPhone}
                  </p>
                </div>
                <Badge
                  variant={selectedConversation.assignedMode === 'AI' ? 'default' : 'secondary'}
                >
                  {selectedConversation.assignedMode === 'AI' ? '🤖 IA' : '👤 Humano'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <ConversationActions
                  conversationId={selectedId!}
                  status={selectedConversation.status}
                  assignedMode={selectedConversation.assignedMode}
                  onTakeOver={handleTakeOver}
                  onReturnToAI={handleReturnToAI}
                  onClose={handleClose}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContext(!showContext)}
                >
                  {showContext ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ChatWindow
              messages={messages}
              customerName={selectedConversation.customerName}
              isLoading={isLoading}
            />

            {/* Message Composer */}
            <MessageComposer
              onSend={handleSendMessage}
              aiEnabled={true}
              quickReplies={['Sim, pode agendar!', 'Obrigado!', 'Um momento, por favor']}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha uma conversa na lista para começar</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Context */}
      {showContext && selectedConversation && (
        <ContextPanel
          customer={{
            id: selectedConversation.customerId,
            name: selectedConversation.customerName,
            phone: selectedConversation.customerPhone,
            tags: selectedConversation.tags,
            status: 'ACTIVE',
            totalOrders: 3,
            totalSpent: 750,
          }}
          lead={{
            id: 'l1',
            status: 'QUALIFIED',
            stage: 'Proposta',
            score: 75,
            isHot: false,
          }}
          orders={[
            { id: 'o1', total: 250, status: 'DELIVERED', createdAt: new Date().toISOString() },
            { id: 'o2', total: 300, status: 'DELIVERED', createdAt: new Date(Date.now() - 86400000).toISOString() },
          ]}
          appointments={[
            { id: 'a1', title: 'Limpeza Dental', startAt: new Date(Date.now() + 86400000).toISOString(), status: 'SCHEDULED' },
          ]}
        />
      )}
    </div>
  );
}
