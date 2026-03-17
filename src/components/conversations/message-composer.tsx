'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
  Smile,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  onSend: (content: string, viaAI: boolean) => Promise<void>;
  onAttach?: () => void;
  disabled?: boolean;
  aiEnabled?: boolean;
  placeholder?: string;
  quickReplies?: string[];
}

export function MessageComposer({
  onSend,
  onAttach,
  disabled = false,
  aiEnabled = true,
  placeholder = 'Digite sua mensagem...',
  quickReplies = [],
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = message.length;
  const maxChars = 4096; // WhatsApp message limit

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(message.trim(), useAI);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
    textareaRef.current?.focus();
  };

  const toggleRecording = () => {
    // Placeholder for voice recording functionality
    setIsRecording(!isRecording);
  };

  return (
    <div className="border-t p-4 bg-background">
      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}

      {/* AI Mode Toggle */}
      {aiEnabled && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            {useAI ? (
              <Bot className="h-4 w-4 text-blue-500" />
            ) : (
              <User className="h-4 w-4 text-green-500" />
            )}
            <Label htmlFor="ai-mode" className="text-sm cursor-pointer">
              {useAI ? 'Responder via IA' : 'Responder manualmente'}
            </Label>
          </div>
          <Switch
            id="ai-mode"
            checked={useAI}
            onCheckedChange={setUseAI}
            disabled={disabled}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAttach}
                disabled={disabled}
                className="shrink-0"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Anexar arquivo</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className={cn(
              'min-h-[44px] max-h-[150px] resize-none pr-12',
              useAI && 'border-blue-500 focus-visible:ring-blue-500'
            )}
            rows={1}
          />

          {/* Character count */}
          {charCount > maxChars * 0.8 && (
            <span
              className={cn(
                'absolute bottom-1 right-14 text-xs',
                charCount >= maxChars ? 'text-red-500' : 'text-muted-foreground'
              )}
            >
              {maxChars - charCount}
            </span>
          )}

          {/* Emoji picker placeholder */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0.5 right-1 h-8 w-8"
                disabled={disabled}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="grid grid-cols-8 gap-1 text-center">
                {['😊', '👍', '👋', '✅', '🙏', '❤️', '🎉', '⏰'].map((emoji) => (
                  <button
                    key={emoji}
                    className="p-1 hover:bg-muted rounded text-lg"
                    onClick={() => setMessage((m) => m + emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Voice or Send Button */}
        {message.trim() ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={disabled || isSending || charCount > maxChars}
                  size="icon"
                  className={cn('shrink-0', useAI && 'bg-blue-500 hover:bg-blue-600')}
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {useAI ? 'Enviar via IA' : 'Enviar mensagem'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecording}
                  disabled={disabled}
                  className={cn('shrink-0', isRecording && 'text-red-500')}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRecording ? 'Parar gravação' : 'Gravar áudio'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Status indicators */}
      {useAI && (
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
            <Bot className="h-3 w-3 mr-1" />
            IA processará a resposta
          </Badge>
        </div>
      )}
    </div>
  );
}
