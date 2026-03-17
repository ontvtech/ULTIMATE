// ============================================
// SaaSWPP AI Platform - Conversation Component Types
// ============================================

import { ConversationStatus, MessageDirection } from '@prisma/client'

// ============================================
// Conversation Types
// ============================================

export interface ConversationWithCustomer {
  id: string
  tenantId: string
  customerId: string
  channel: string
  status: ConversationStatus
  aiMode: boolean
  assignedMode: string
  assignedUserId: string | null
  lastMessageAt: Date
  lastMessagePreview: string | null
  unreadCount: number
  intentDetected: string | null
  sentimentScore: number | null
  confidenceScore: number | null
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string
    phoneE164: string
    email: string | null
    avatarUrl?: string | null
    status?: string
    totalOrders?: number
    totalSpent?: number
    lastOrderAt?: Date | null
    tags?: string
    createdAt?: Date
  }
}

export interface MessageWithMetadata {
  id: string
  conversationId: string
  direction: MessageDirection
  contentType: string
  content: string
  provider: string | null
  providerMessageId: string | null
  aiGenerated: boolean
  aiProvider: string | null
  status: string
  createdAt: Date
}

export interface ConversationFilters {
  status: ConversationStatus | 'ALL'
  aiMode: 'ALL' | 'AI' | 'HUMAN'
  tags: string[]
  dateRange: {
    from: Date | null
    to: Date | null
  }
  assignedTo: string | 'ALL' | 'UNASSIGNED'
  search: string
}

export interface ConversationSort {
  field: 'lastMessageAt' | 'createdAt' | 'unreadCount'
  direction: 'asc' | 'desc'
}

// ============================================
// Filter State Types
// ============================================

export type StatusFilter = 'ALL' | 'OPEN' | 'CLOSED' | 'PENDING' | 'HANDOFF'
export type ModeFilter = 'ALL' | 'AI' | 'HUMAN'

// ============================================
// Quick Reply Types
// ============================================

export interface QuickReply {
  id: string
  title: string
  content: string
  category?: string
  usageCount: number
}

// ============================================
// Context Panel Types
// ============================================

export interface CustomerContext {
  id: string
  name: string
  phoneE164: string
  email: string | null
  status: string
  totalOrders: number
  totalSpent: number
  lastOrderAt: Date | null
  tags: string[]
  createdAt: Date
  lead?: {
    id: string
    status: string
    score: number
    isHot: boolean
    chancePercent: number | null
    stageId: string | null
  } | null
  recentOrders: Array<{
    id: string
    total: number
    status: string
    createdAt: Date
  }>
  recentServiceOrders: Array<{
    id: string
    title: string
    status: string
    createdAt: Date
  }>
  upcomingAppointments: Array<{
    id: string
    title: string | null
    startAt: Date
    status: string
  }>
  notes: Array<{
    id: string
    content: string
    createdAt: Date
    createdBy: string | null
  }>
}

// ============================================
// Action Types
// ============================================

export interface ConversationAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: boolean
  loading?: boolean
}

// ============================================
// WebSocket Event Types
// ============================================

export interface ConversationWSMessage {
  type: 'NEW_MESSAGE' | 'STATUS_UPDATE' | 'CONVERSATION_UPDATE' | 'TYPING' | 'HANDOFF_REQUEST'
  payload: {
    conversationId: string
    data: unknown
  }
}

// ============================================
// Component Props Types
// ============================================

export interface ConversationListProps {
  conversations: ConversationWithCustomer[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  filters: ConversationFilters
  onFilterChange: (filters: Partial<ConversationFilters>) => void
}

export interface ChatWindowProps {
  conversation: ConversationWithCustomer | null
  messages: MessageWithMetadata[]
  loading?: boolean
  onLoadMore?: (before: string) => void
  hasMore?: boolean
}

export interface MessageComposerProps {
  conversationId: string
  onSend: (content: string, contentType: string) => Promise<void>
  disabled?: boolean
  aiMode: boolean
  onToggleAiMode: () => void
  maxLength?: number
}

export interface ContextPanelProps {
  customer: CustomerContext | null
  loading?: boolean
  onQuickAction?: (action: string) => void
}

export interface ConversationFiltersProps {
  filters: ConversationFilters
  onChange: (filters: Partial<ConversationFilters>) => void
  tags: string[]
  assignees: Array<{ id: string; name: string }>
  onReset: () => void
}

export interface ConversationActionsProps {
  conversation: ConversationWithCustomer | null
  onTakeOver: () => void
  onReturnToAI: () => void
  onTransfer: (userId: string) => void
  onClose: () => void
  onAddTag: (tag: string) => void
  onCreateFollowUp: () => void
  assignees: Array<{ id: string; name: string }>
  loading?: boolean
}

// ============================================
// Status Badge Colors
// ============================================

export const STATUS_COLORS: Record<ConversationStatus | 'ALL', string> = {
  ALL: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  OPEN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HANDOFF: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

export const STATUS_LABELS: Record<ConversationStatus | 'ALL', string> = {
  ALL: 'Todos',
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
  PENDING: 'Pendente',
  HANDOFF: 'Handoff',
}

export const MODE_COLORS: Record<ModeFilter, string> = {
  ALL: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  AI: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  HUMAN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

export const MODE_LABELS: Record<ModeFilter, string> = {
  ALL: 'Todos',
  AI: 'IA',
  HUMAN: 'Humano',
}

export const MESSAGE_STATUS_ICONS: Record<string, string> = {
  PENDING: '○',
  SENT: '✓',
  DELIVERED: '✓✓',
  READ: '✓✓',
  FAILED: '✗',
}
