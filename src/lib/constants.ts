// ============================================
// SaaSWPP AI Platform - Application Constants
// ============================================

// ============================================
// Plan Limits Keys & Defaults
// ============================================

export const PLAN_LIMIT_KEYS = {
  MAX_CONVERSATIONS: 'max_conversations',
  MAX_MESSAGES_MONTHLY: 'max_messages_monthly',
  MAX_AI_EXECUTIONS_MONTHLY: 'max_ai_executions_monthly',
  MAX_USERS: 'max_users',
  MAX_CATALOG_ITEMS: 'max_catalog_items',
  MAX_KNOWLEDGE_ITEMS: 'max_knowledge_items',
  MAX_CAMPAIGNS_MONTHLY: 'max_campaigns_monthly',
  RETENTION_DAYS: 'retention_days',
  MAX_WHATSAPP_NUMBERS: 'max_whatsapp_numbers',
  API_RATE_LIMIT: 'api_rate_limit',
} as const

export const DEFAULT_PLAN_LIMITS = {
  FREE: {
    [PLAN_LIMIT_KEYS.MAX_CONVERSATIONS]: 100,
    [PLAN_LIMIT_KEYS.MAX_MESSAGES_MONTHLY]: 500,
    [PLAN_LIMIT_KEYS.MAX_AI_EXECUTIONS_MONTHLY]: 100,
    [PLAN_LIMIT_KEYS.MAX_USERS]: 2,
    [PLAN_LIMIT_KEYS.MAX_CATALOG_ITEMS]: 50,
    [PLAN_LIMIT_KEYS.MAX_KNOWLEDGE_ITEMS]: 20,
    [PLAN_LIMIT_KEYS.MAX_CAMPAIGNS_MONTHLY]: 5,
    [PLAN_LIMIT_KEYS.RETENTION_DAYS]: 30,
    [PLAN_LIMIT_KEYS.MAX_WHATSAPP_NUMBERS]: 1,
    [PLAN_LIMIT_KEYS.API_RATE_LIMIT]: 100,
  },
  STARTER: {
    [PLAN_LIMIT_KEYS.MAX_CONVERSATIONS]: 500,
    [PLAN_LIMIT_KEYS.MAX_MESSAGES_MONTHLY]: 2000,
    [PLAN_LIMIT_KEYS.MAX_AI_EXECUTIONS_MONTHLY]: 500,
    [PLAN_LIMIT_KEYS.MAX_USERS]: 5,
    [PLAN_LIMIT_KEYS.MAX_CATALOG_ITEMS]: 200,
    [PLAN_LIMIT_KEYS.MAX_KNOWLEDGE_ITEMS]: 50,
    [PLAN_LIMIT_KEYS.MAX_CAMPAIGNS_MONTHLY]: 20,
    [PLAN_LIMIT_KEYS.RETENTION_DAYS]: 90,
    [PLAN_LIMIT_KEYS.MAX_WHATSAPP_NUMBERS]: 2,
    [PLAN_LIMIT_KEYS.API_RATE_LIMIT]: 500,
  },
  PROFESSIONAL: {
    [PLAN_LIMIT_KEYS.MAX_CONVERSATIONS]: 2000,
    [PLAN_LIMIT_KEYS.MAX_MESSAGES_MONTHLY]: 10000,
    [PLAN_LIMIT_KEYS.MAX_AI_EXECUTIONS_MONTHLY]: 2000,
    [PLAN_LIMIT_KEYS.MAX_USERS]: 15,
    [PLAN_LIMIT_KEYS.MAX_CATALOG_ITEMS]: 1000,
    [PLAN_LIMIT_KEYS.MAX_KNOWLEDGE_ITEMS]: 200,
    [PLAN_LIMIT_KEYS.MAX_CAMPAIGNS_MONTHLY]: 100,
    [PLAN_LIMIT_KEYS.RETENTION_DAYS]: 180,
    [PLAN_LIMIT_KEYS.MAX_WHATSAPP_NUMBERS]: 5,
    [PLAN_LIMIT_KEYS.API_RATE_LIMIT]: 1000,
  },
  ENTERPRISE: {
    [PLAN_LIMIT_KEYS.MAX_CONVERSATIONS]: -1, // Unlimited
    [PLAN_LIMIT_KEYS.MAX_MESSAGES_MONTHLY]: -1,
    [PLAN_LIMIT_KEYS.MAX_AI_EXECUTIONS_MONTHLY]: -1,
    [PLAN_LIMIT_KEYS.MAX_USERS]: -1,
    [PLAN_LIMIT_KEYS.MAX_CATALOG_ITEMS]: -1,
    [PLAN_LIMIT_KEYS.MAX_KNOWLEDGE_ITEMS]: -1,
    [PLAN_LIMIT_KEYS.MAX_CAMPAIGNS_MONTHLY]: -1,
    [PLAN_LIMIT_KEYS.RETENTION_DAYS]: 365,
    [PLAN_LIMIT_KEYS.MAX_WHATSAPP_NUMBERS]: -1,
    [PLAN_LIMIT_KEYS.API_RATE_LIMIT]: 5000,
  },
} as const

// ============================================
// Subscription Statuses
// ============================================

export const SUBSCRIPTION_STATUS = {
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  GRACE_PERIOD: 'grace_period',
  SUSPENDED: 'suspended',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
} as const

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  [SUBSCRIPTION_STATUS.TRIALING]: 'Período de Teste',
  [SUBSCRIPTION_STATUS.ACTIVE]: 'Ativo',
  [SUBSCRIPTION_STATUS.PAST_DUE]: 'Pagamento Pendente',
  [SUBSCRIPTION_STATUS.GRACE_PERIOD]: 'Período de Carência',
  [SUBSCRIPTION_STATUS.SUSPENDED]: 'Suspenso',
  [SUBSCRIPTION_STATUS.CANCELED]: 'Cancelado',
  [SUBSCRIPTION_STATUS.EXPIRED]: 'Expirado',
}

export const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  [SUBSCRIPTION_STATUS.TRIALING]: 'bg-blue-500',
  [SUBSCRIPTION_STATUS.ACTIVE]: 'bg-green-500',
  [SUBSCRIPTION_STATUS.PAST_DUE]: 'bg-yellow-500',
  [SUBSCRIPTION_STATUS.GRACE_PERIOD]: 'bg-orange-500',
  [SUBSCRIPTION_STATUS.SUSPENDED]: 'bg-red-500',
  [SUBSCRIPTION_STATUS.CANCELED]: 'bg-gray-500',
  [SUBSCRIPTION_STATUS.EXPIRED]: 'bg-gray-400',
}

// ============================================
// Role Definitions
// ============================================

export const ROLES = {
  ADMIN: 'ADMIN',
  REVENDEDOR: 'REVENDEDOR',
  LOJISTA: 'LOJISTA',
  ATENDENTE: 'ATENDENTE',
  GESTOR: 'GESTOR',
} as const

export const ROLE_LABELS: Record<string, string> = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.REVENDEDOR]: 'Revendedor',
  [ROLES.LOJISTA]: 'Lojista',
  [ROLES.ATENDENTE]: 'Atendente',
  [ROLES.GESTOR]: 'Gestor',
}

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  [ROLES.ADMIN]: 'Administrador da plataforma com acesso total',
  [ROLES.REVENDEDOR]: 'Revendedor que pode criar e gerenciar tenants',
  [ROLES.LOJISTA]: 'Proprietário do tenant com acesso completo ao seu negócio',
  [ROLES.ATENDENTE]: 'Atendente para atendimento humano via handoff',
  [ROLES.GESTOR]: 'Gestor com acesso a relatórios e configurações',
}

// ============================================
// Permission Keys
// ============================================

export const PERMISSION_KEYS = {
  // Tenant Management
  TENANT_CREATE: 'tenant:create',
  TENANT_READ: 'tenant:read',
  TENANT_UPDATE: 'tenant:update',
  TENANT_DELETE: 'tenant:delete',
  TENANT_MANAGE_USERS: 'tenant:manage_users',
  
  // Conversation Management
  CONVERSATION_READ: 'conversation:read',
  CONVERSATION_WRITE: 'conversation:write',
  CONVERSATION_ASSIGN: 'conversation:assign',
  CONVERSATION_HANDOFF: 'conversation:handoff',
  
  // Customer Management
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_WRITE: 'customer:write',
  CUSTOMER_DELETE: 'customer:delete',
  
  // Lead Management
  LEAD_READ: 'lead:read',
  LEAD_WRITE: 'lead:write',
  LEAD_DELETE: 'lead:delete',
  
  // Order Management
  ORDER_READ: 'order:read',
  ORDER_WRITE: 'order:write',
  ORDER_CANCEL: 'order:cancel',
  
  // Catalog Management
  CATALOG_READ: 'catalog:read',
  CATALOG_WRITE: 'catalog:write',
  CATALOG_DELETE: 'catalog:delete',
  
  // Knowledge Base
  KNOWLEDGE_READ: 'knowledge:read',
  KNOWLEDGE_WRITE: 'knowledge:write',
  KNOWLEDGE_DELETE: 'knowledge:delete',
  KNOWLEDGE_APPROVE: 'knowledge:approve',
  
  // AI Configuration
  AI_READ: 'ai:read',
  AI_WRITE: 'ai:write',
  AI_EXECUTIONS_VIEW: 'ai:executions_view',
  
  // Campaigns
  CAMPAIGN_READ: 'campaign:read',
  CAMPAIGN_WRITE: 'campaign:write',
  CAMPAIGN_DELETE: 'campaign:delete',
  CAMPAIGN_SEND: 'campaign:send',
  
  // Reports & Analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // Billing
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_WRITE: 'settings:write',
  
  // WhatsApp
  WHATSAPP_CONNECT: 'whatsapp:connect',
  WHATSAPP_DISCONNECT: 'whatsapp:disconnect',
  
  // Alerts
  ALERTS_VIEW: 'alerts:view',
  ALERTS_MANAGE: 'alerts:manage',
} as const

// Default permissions per role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    PERMISSION_KEYS.TENANT_CREATE,
    PERMISSION_KEYS.TENANT_READ,
    PERMISSION_KEYS.TENANT_UPDATE,
    PERMISSION_KEYS.TENANT_DELETE,
    PERMISSION_KEYS.TENANT_MANAGE_USERS,
    PERMISSION_KEYS.BILLING_VIEW,
    PERMISSION_KEYS.BILLING_MANAGE,
    PERMISSION_KEYS.SETTINGS_VIEW,
    PERMISSION_KEYS.SETTINGS_WRITE,
    PERMISSION_KEYS.REPORTS_VIEW,
    PERMISSION_KEYS.REPORTS_EXPORT,
  ],
  [ROLES.REVENDEDOR]: [
    PERMISSION_KEYS.TENANT_CREATE,
    PERMISSION_KEYS.TENANT_READ,
    PERMISSION_KEYS.BILLING_VIEW,
    PERMISSION_KEYS.REPORTS_VIEW,
  ],
  [ROLES.LOJISTA]: [
    PERMISSION_KEYS.TENANT_READ,
    PERMISSION_KEYS.TENANT_UPDATE,
    PERMISSION_KEYS.TENANT_MANAGE_USERS,
    PERMISSION_KEYS.CONVERSATION_READ,
    PERMISSION_KEYS.CONVERSATION_WRITE,
    PERMISSION_KEYS.CONVERSATION_ASSIGN,
    PERMISSION_KEYS.CONVERSATION_HANDOFF,
    PERMISSION_KEYS.CUSTOMER_READ,
    PERMISSION_KEYS.CUSTOMER_WRITE,
    PERMISSION_KEYS.LEAD_READ,
    PERMISSION_KEYS.LEAD_WRITE,
    PERMISSION_KEYS.ORDER_READ,
    PERMISSION_KEYS.ORDER_WRITE,
    PERMISSION_KEYS.CATALOG_READ,
    PERMISSION_KEYS.CATALOG_WRITE,
    PERMISSION_KEYS.KNOWLEDGE_READ,
    PERMISSION_KEYS.KNOWLEDGE_WRITE,
    PERMISSION_KEYS.AI_READ,
    PERMISSION_KEYS.AI_WRITE,
    PERMISSION_KEYS.CAMPAIGN_READ,
    PERMISSION_KEYS.CAMPAIGN_WRITE,
    PERMISSION_KEYS.CAMPAIGN_SEND,
    PERMISSION_KEYS.REPORTS_VIEW,
    PERMISSION_KEYS.BILLING_VIEW,
    PERMISSION_KEYS.SETTINGS_VIEW,
    PERMISSION_KEYS.SETTINGS_WRITE,
    PERMISSION_KEYS.WHATSAPP_CONNECT,
    PERMISSION_KEYS.WHATSAPP_DISCONNECT,
    PERMISSION_KEYS.ALERTS_VIEW,
    PERMISSION_KEYS.ALERTS_MANAGE,
  ],
  [ROLES.ATENDENTE]: [
    PERMISSION_KEYS.CONVERSATION_READ,
    PERMISSION_KEYS.CONVERSATION_WRITE,
    PERMISSION_KEYS.CONVERSATION_HANDOFF,
    PERMISSION_KEYS.CUSTOMER_READ,
    PERMISSION_KEYS.CUSTOMER_WRITE,
    PERMISSION_KEYS.ORDER_READ,
    PERMISSION_KEYS.ORDER_WRITE,
    PERMISSION_KEYS.CATALOG_READ,
    PERMISSION_KEYS.KNOWLEDGE_READ,
    PERMISSION_KEYS.ALERTS_VIEW,
  ],
  [ROLES.GESTOR]: [
    PERMISSION_KEYS.CONVERSATION_READ,
    PERMISSION_KEYS.CONVERSATION_ASSIGN,
    PERMISSION_KEYS.CUSTOMER_READ,
    PERMISSION_KEYS.LEAD_READ,
    PERMISSION_KEYS.LEAD_WRITE,
    PERMISSION_KEYS.ORDER_READ,
    PERMISSION_KEYS.CATALOG_READ,
    PERMISSION_KEYS.REPORTS_VIEW,
    PERMISSION_KEYS.REPORTS_EXPORT,
    PERMISSION_KEYS.ALERTS_VIEW,
    PERMISSION_KEYS.ALERTS_MANAGE,
    PERMISSION_KEYS.AI_READ,
    PERMISSION_KEYS.AI_EXECUTIONS_VIEW,
  ],
}

// ============================================
// Alert Types & Severities
// ============================================

export const ALERT_TYPES = {
  CUSTOMER_ANGRY: 'CUSTOMER_ANGRY',
  HOT_LEAD: 'HOT_LEAD',
  HANDOFF_PENDING: 'HANDOFF_PENDING',
  ORDER_STUCK: 'ORDER_STUCK',
  OS_STUCK: 'OS_STUCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
} as const

export const ALERT_TYPE_LABELS: Record<string, string> = {
  [ALERT_TYPES.CUSTOMER_ANGRY]: 'Cliente Insatisfeito',
  [ALERT_TYPES.HOT_LEAD]: 'Lead Quente',
  [ALERT_TYPES.HANDOFF_PENDING]: 'Handoff Pendente',
  [ALERT_TYPES.ORDER_STUCK]: 'Pedido Parado',
  [ALERT_TYPES.OS_STUCK]: 'OS Parada',
  [ALERT_TYPES.PAYMENT_FAILED]: 'Falha no Pagamento',
  [ALERT_TYPES.INTEGRATION_ERROR]: 'Erro de Integração',
}

export const ALERT_SEVERITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export const ALERT_SEVERITY_LABELS: Record<string, string> = {
  [ALERT_SEVERITIES.LOW]: 'Baixa',
  [ALERT_SEVERITIES.MEDIUM]: 'Média',
  [ALERT_SEVERITIES.HIGH]: 'Alta',
  [ALERT_SEVERITIES.CRITICAL]: 'Crítica',
}

export const ALERT_SEVERITY_COLORS: Record<string, string> = {
  [ALERT_SEVERITIES.LOW]: 'bg-blue-500',
  [ALERT_SEVERITIES.MEDIUM]: 'bg-yellow-500',
  [ALERT_SEVERITIES.HIGH]: 'bg-orange-500',
  [ALERT_SEVERITIES.CRITICAL]: 'bg-red-500',
}

export const ALERT_SEVERITY_PRIORITY: Record<string, number> = {
  [ALERT_SEVERITIES.LOW]: 1,
  [ALERT_SEVERITIES.MEDIUM]: 2,
  [ALERT_SEVERITIES.HIGH]: 3,
  [ALERT_SEVERITIES.CRITICAL]: 4,
}

// ============================================
// Conversation Status
// ============================================

export const CONVERSATION_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  PENDING: 'PENDING',
  HANDOFF: 'HANDOFF',
} as const

export const CONVERSATION_STATUS_LABELS: Record<string, string> = {
  [CONVERSATION_STATUS.OPEN]: 'Aberta',
  [CONVERSATION_STATUS.CLOSED]: 'Fechada',
  [CONVERSATION_STATUS.PENDING]: 'Pendente',
  [CONVERSATION_STATUS.HANDOFF]: 'Handoff',
}

// ============================================
// Message Status
// ============================================

export const MESSAGE_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
} as const

export const MESSAGE_STATUS_LABELS: Record<string, string> = {
  [MESSAGE_STATUS.PENDING]: 'Pendente',
  [MESSAGE_STATUS.SENT]: 'Enviada',
  [MESSAGE_STATUS.DELIVERED]: 'Entregue',
  [MESSAGE_STATUS.READ]: 'Lida',
  [MESSAGE_STATUS.FAILED]: 'Falhou',
}

// ============================================
// Lead Status
// ============================================

export const LEAD_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  PROPOSAL: 'PROPOSAL',
  NEGOTIATION: 'NEGOTIATION',
  WON: 'WON',
  LOST: 'LOST',
} as const

export const LEAD_STATUS_LABELS: Record<string, string> = {
  [LEAD_STATUS.NEW]: 'Novo',
  [LEAD_STATUS.CONTACTED]: 'Contatado',
  [LEAD_STATUS.QUALIFIED]: 'Qualificado',
  [LEAD_STATUS.PROPOSAL]: 'Proposta',
  [LEAD_STATUS.NEGOTIATION]: 'Negociação',
  [LEAD_STATUS.WON]: 'Ganho',
  [LEAD_STATUS.LOST]: 'Perdido',
}

// ============================================
// Order Status
// ============================================

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELED: 'CANCELED',
} as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Pendente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmado',
  [ORDER_STATUS.PROCESSING]: 'Processando',
  [ORDER_STATUS.SHIPPED]: 'Enviado',
  [ORDER_STATUS.DELIVERED]: 'Entregue',
  [ORDER_STATUS.CANCELED]: 'Cancelado',
}

// ============================================
// Tenant Status
// ============================================

export const TENANT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELED: 'CANCELED',
  TRIALING: 'TRIALING',
  GRACE_PERIOD: 'GRACE_PERIOD',
} as const

export const TENANT_STATUS_LABELS: Record<string, string> = {
  [TENANT_STATUS.ACTIVE]: 'Ativo',
  [TENANT_STATUS.SUSPENDED]: 'Suspenso',
  [TENANT_STATUS.CANCELED]: 'Cancelado',
  [TENANT_STATUS.TRIALING]: 'Em Teste',
  [TENANT_STATUS.GRACE_PERIOD]: 'Carência',
}

export const TENANT_STATUS_COLORS: Record<string, string> = {
  [TENANT_STATUS.ACTIVE]: 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400',
  [TENANT_STATUS.SUSPENDED]: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
  [TENANT_STATUS.CANCELED]: 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400',
  [TENANT_STATUS.TRIALING]: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
  [TENANT_STATUS.GRACE_PERIOD]: 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400',
}

// ============================================
// Timezone Options
// ============================================

export const BRAZIL_TIMEZONES = [
  'America/Sao_Paulo',
  'America/Brasilia',
  'America/Manaus',
  'America/Fortaleza',
  'America/Recife',
  'America/Salvador',
  'America/Belem',
  'America/Porto_Velho',
  'America/Cuiaba',
  'America/Noronha',
] as const

// ============================================
// AI Provider Types
// ============================================

export const AI_PROVIDERS = {
  OPENAI: 'OPENAI',
  ANTHROPIC: 'ANTHROPIC',
  GOOGLE: 'GOOGLE',
  OPENROUTER: 'OPENROUTER',
  CUSTOM: 'CUSTOM',
} as const

export const AI_PROVIDER_LABELS: Record<string, string> = {
  [AI_PROVIDERS.OPENAI]: 'OpenAI',
  [AI_PROVIDERS.ANTHROPIC]: 'Anthropic',
  [AI_PROVIDERS.GOOGLE]: 'Google AI',
  [AI_PROVIDERS.OPENROUTER]: 'OpenRouter',
  [AI_PROVIDERS.CUSTOM]: 'Custom API',
}

// ============================================
// Rate Limit Defaults
// ============================================

export const RATE_LIMITS = {
  // API endpoints
  API_DEFAULT: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 req/min
  API_AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 req/15min
  API_PASSWORD_RESET: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 req/hour
  
  // WhatsApp messaging
  WHATSAPP_SEND: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 msg/min
  
  // AI executions
  AI_EXECUTION: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 req/min
  
  // Webhooks
  WEBHOOK_WHATSAPP: { windowMs: 1000, maxRequests: 50 }, // 50 req/sec
} as const

// ============================================
// Pagination Defaults
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// ============================================
// Session & Auth Constants
// ============================================

export const AUTH = {
  SESSION_MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
  SESSION_UPDATE_AGE: 60 * 60, // 1 hour in seconds
  JWT_MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  TOKEN_EXPIRY_HOURS: 24,
  RESET_TOKEN_EXPIRY_HOURS: 1,
} as const

// ============================================
// WhatsApp Constants
// ============================================

export const WHATSAPP = {
  MAX_MESSAGE_LENGTH: 4096,
  MAX_MEDIA_SIZE_MB: 64,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4'],
  SUPPORTED_AUDIO_TYPES: ['audio/ogg', 'audio/mp3', 'audio/aac'],
  SUPPORTED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const

// ============================================
// File Upload Constants
// ============================================

export const FILE_UPLOAD = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  UPLOAD_DIR: 'uploads',
} as const

// ============================================
// Notification Constants
// ============================================

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const
