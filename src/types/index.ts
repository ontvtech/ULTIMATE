// ============================================
// SaaSWPP AI Platform - TypeScript Types
// ============================================

import { UserRole, TenantStatus, SubscriptionStatus, AlertType, AlertSeverity, AIExecutionStatus } from '@prisma/client'

// ============================================
// Session & Auth Types
// ============================================

export interface SessionUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  status: string
  currentTenantId?: string
  tenants: UserTenantInfo[]
  permissions: string[]
}

export interface UserTenantInfo {
  tenantId: string
  tenantName: string
  tenantSlug: string
  tenantStatus: TenantStatus
  roleId: string
  roleName: string
  roleKey: UserRole
  isActive: boolean
}

export interface AuthSession {
  user: SessionUser
  expires: string
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// Form Types
// ============================================

export interface FormFieldError {
  field: string
  message: string
}

export interface FormState {
  success: boolean
  message?: string
  errors?: FormFieldError[]
}

export interface LoginForm {
  email: string
  password: string
  tenantSlug?: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
  phone: string
}

export interface ForgotPasswordForm {
  email: string
}

export interface ResetPasswordForm {
  token: string
  password: string
  confirmPassword: string
}

// ============================================
// WhatsApp Message Types
// ============================================

export interface WhatsAppMessage {
  id: string
  conversationId: string
  direction: 'INBOUND' | 'OUTBOUND'
  contentType: WhatsAppContentType
  content: string
  status: WhatsAppMessageStatus
  providerMessageId?: string
  aiGenerated: boolean
  createdAt: Date
}

export type WhatsAppContentType = 
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'DOCUMENT'
  | 'STICKER'
  | 'LOCATION'
  | 'CONTACTS'
  | 'INTERACTIVE'
  | 'TEMPLATE'

export type WhatsAppMessageStatus = 
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'

export interface WhatsAppWebhookPayload {
  entry: WhatsAppWebhookEntry[]
}

export interface WhatsAppWebhookEntry {
  id: string
  changes: WhatsAppWebhookChange[]
}

export interface WhatsAppWebhookChange {
  value: {
    messaging_product: string
    metadata: {
      display_phone_number: string
      phone_number_id: string
    }
    contacts?: WhatsAppContact[]
    messages?: WhatsAppIncomingMessage[]
    statuses?: WhatsAppMessageStatusUpdate[]
  }
  field: string
}

export interface WhatsAppContact {
  profile: {
    name?: string
  }
  wa_id: string
}

export interface WhatsAppIncomingMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: { body: string }
  image?: { id: string; mime_type: string; caption?: string }
  video?: { id: string; mime_type: string; caption?: string }
  audio?: { id: string; mime_type: string }
  document?: { id: string; mime_type: string; filename: string; caption?: string }
  location?: { latitude: number; longitude: number; name?: string; address?: string }
  contacts?: Array<{
    name: { formatted_name: string; first_name?: string }
    phones: Array<{ phone: string; type?: string }>
  }>
}

export interface WhatsAppMessageStatusUpdate {
  id: string
  status: string
  timestamp: string
  recipient_id: string
  conversation?: {
    id: string
    origin: { type: string }
  }
  pricing?: {
    billable: boolean
    pricing_model: string
    category: string
  }
  errors?: Array<{ code: number; title: string; message?: string }>
}

export interface SendMessagePayload {
  to: string
  type: WhatsAppContentType
  text?: { body: string }
  image?: { id: string; caption?: string } | { link: string; caption?: string }
  video?: { id: string; caption?: string } | { link: string; caption?: string }
  document?: { id: string; filename?: string; caption?: string } | { link: string; filename?: string; caption?: string }
  audio?: { id: string }
}

// ============================================
// AI Execution Types
// ============================================

export interface AIExecutionRequest {
  tenantId: string
  conversationId: string
  message: string
  context?: AIExecutionContext
}

export interface AIExecutionContext {
  customerName?: string
  customerPhone?: string
  conversationHistory: AIConversationMessage[]
  knowledgeItems?: AIKnowledgeReference[]
  catalogItems?: AICatalogReference[]
  businessRules?: string[]
}

export interface AIConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AIKnowledgeReference {
  id: string
  title: string
  content: string
  relevanceScore?: number
}

export interface AICatalogReference {
  id: string
  name: string
  description?: string
  price?: number
  availabilityStatus: string
}

export interface AIExecutionResult {
  success: boolean
  status: AIExecutionStatus
  response?: string
  error?: string
  provider?: string
  model?: string
  tokensIn?: number
  tokensOut?: number
  latencyMs?: number
  cost?: number
  handoffRequested?: boolean
  handoffReason?: string
}

export interface AIProviderConfig {
  id: string
  provider: string
  displayName: string
  status: string
  models: AIModelConfig[]
}

export interface AIModelConfig {
  modelKey: string
  displayName: string
  maxTokens?: number
  costPer1kTokensIn?: number
  costPer1kTokensOut?: number
}

// ============================================
// Rate Limit Types
// ============================================

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
  skipFailedRequests?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
  retryAfter?: number
}

export type RateLimitIdentifierType = 'IP' | 'USER' | 'TENANT'

// ============================================
// Tenant & Subscription Types
// ============================================

export interface TenantWithSubscription {
  id: string
  name: string
  slug: string
  tradeName?: string | null
  document?: string | null
  phone?: string | null
  email?: string | null
  logoUrl?: string | null
  timezone: string
  status: TenantStatus
  tenantType: string
  subscription?: SubscriptionInfo
}

export interface SubscriptionInfo {
  id: string
  planId: string
  planName: string
  status: SubscriptionStatus
  startedAt: Date
  currentPeriodEnd?: Date | null
  cancelAtPeriodEnd: boolean
}

export interface PlanLimits {
  maxConversations: number
  maxMessages: number
  maxAIExecutions: number
  maxUsers: number
  maxCatalogItems: number
  maxKnowledgeItems: number
  maxCampaigns: number
  retentionDays: number
}

// ============================================
// Alert Types
// ============================================

export interface OperationalAlertInfo {
  id: string
  tenantId: string
  type: AlertType
  severity: AlertSeverity
  status: string
  title: string
  description?: string | null
  conversationId?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  assignedTo?: string | null
  resolvedAt?: Date | null
  createdAt: Date
}

// ============================================
// Customer & CRM Types
// ============================================

export interface CustomerInfo {
  id: string
  tenantId: string
  name: string
  phoneE164: string
  email?: string | null
  status: string
  totalOrders: number
  totalSpent: number
  lastOrderAt?: Date | null
  tags: string[]
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface LeadInfo {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  status: string
  source?: string | null
  score: number
  chancePercent?: number | null
  isHot: boolean
  notes?: string | null
  lastInteractionAt?: Date | null
  createdAt: Date
}

// ============================================
// Conversation Types
// ============================================

export interface ConversationInfo {
  id: string
  tenantId: string
  customerId: string
  customerName: string
  customerPhone: string
  channel: string
  status: string
  aiMode: boolean
  assignedMode: string
  assignedUserId?: string | null
  lastMessageAt: Date
  lastMessagePreview?: string | null
  unreadCount: number
  intentDetected?: string | null
  sentimentScore?: number | null
  createdAt: Date
}

// ============================================
// Audit Log Types
// ============================================

export interface AuditLogEntry {
  id: string
  tenantId: string
  actorType: 'USER' | 'SYSTEM' | 'AI'
  actorUserId?: string | null
  actorName?: string
  action: string
  entityType: string
  entityId?: string | null
  beforeJson?: Record<string, unknown>
  afterJson?: Record<string, unknown>
  ipAddress?: string | null
  requestId?: string | null
  createdAt: Date
}

// ============================================
// Pagination & Filtering Types
// ============================================

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRangeFilter {
  startDate?: Date
  endDate?: Date
}

export interface SearchParams extends PaginationParams {
  query?: string
  filters?: Record<string, string | string[] | number | boolean>
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface DashboardStats {
  conversations: {
    total: number
    active: number
    pendingHandoff: number
    aiHandled: number
  }
  messages: {
    total: number
    inbound: number
    outbound: number
    aiGenerated: number
  }
  leads: {
    total: number
    new: number
    hot: number
    converted: number
  }
  orders: {
    total: number
    pending: number
    completed: number
    revenue: number
  }
  alerts: {
    critical: number
    high: number
    medium: number
    low: number
  }
}
