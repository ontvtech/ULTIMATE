'use client';

import { useState } from 'react';
import {
  Bot,
  User,
  XCircle,
  ArrowRightLeft,
  Tag,
  MoreHorizontal,
  MessageSquarePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ConversationActionsProps {
  conversationId: string;
  status: string;
  assignedMode: 'AI' | 'HUMAN';
  onTakeOver: () => void;
  onReturnToAI: () => void;
  onClose: () => void;
  onTransfer?: (userId: string) => void;
  onAddTag?: (tag: string) => void;
}

export function ConversationActions({
  conversationId,
  status,
  assignedMode,
  onTakeOver,
  onReturnToAI,
  onClose,
  onTransfer,
  onAddTag,
}: ConversationActionsProps) {
  const { toast } = useToast();
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleTransfer = (userId: string) => {
    onTransfer?.(userId);
    setShowTransferDialog(false);
    toast({
      title: 'Conversa transferida',
      description: 'A conversa foi transferida com sucesso',
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && onAddTag) {
      onAddTag(newTag.trim());
      setNewTag('');
      setShowTagDialog(false);
      toast({
        title: 'Tag adicionada',
        description: `Tag "${newTag}" adicionada à conversa`,
      });
    }
  };

  const isClosed = status === 'CLOSED';

  return (
    <>
      <div className="flex items-center gap-2">
        {assignedMode === 'AI' ? (
          <Button size="sm" variant="default" onClick={onTakeOver} disabled={isClosed}>
            <User className="h-4 w-4 mr-1" />
            Assumir
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onReturnToAI} disabled={isClosed}>
            <Bot className="h-4 w-4 mr-1" />
            Devolver à IA
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowTransferDialog(true)} disabled={isClosed}>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transferir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowTagDialog(true)}>
              <Tag className="h-4 w-4 mr-2" />
              Adicionar Tag
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onClose}
              disabled={isClosed}
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Encerrar Conversa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir Conversa</DialogTitle>
            <DialogDescription>
              Selecione um atendente para transferir esta conversa
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {['Maria', 'João', 'Pedro'].map((name) => (
              <Button
                key={name}
                variant="outline"
                className="justify-start"
                onClick={() => handleTransfer(name.toLowerCase())}
              >
                <User className="h-4 w-4 mr-2" />
                {name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Tag</DialogTitle>
            <DialogDescription>
              Adicione uma tag para categorizar esta conversa
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex gap-2 flex-wrap">
              {['urgente', 'vip', 'reclamação', 'elogio', 'dúvida'].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    setNewTag(tag);
                    handleAddTag();
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nova tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
