/**
 * WhatsApp Integration Module - Types
 * SaaSWPP AI Platform - Multi-provider WhatsApp support
 */

// ============================================
// PROVIDER TYPES
// ============================================

export type WhatsAppProviderType = 'META' | 'EVOLUTION';

export type ConnectionStatus = 
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'QRCODE_PENDING'
  | 'ERROR';

export type MessageStatus = 
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED';

export type MessageType = 
  | 'TEXT'
  | 'IMAGE'
  | 'DOCUMENT'
  | 'AUDIO'
  | 'VIDEO'
  | 'STICKER'
  | 'TEMPLATE'
  | 'INTERACTIVE'
  | 'LOCATION'
  | 'CONTACTS';

// ============================================
// BASE MESSAGE TYPES
// ============================================

export interface BaseMessage {
  to: string;
  type: MessageType;
  previewUrl?: boolean;
}

export interface TextMessage extends BaseMessage {
  type: 'TEXT';
  text: {
    body: string;
    previewUrl?: boolean;
  };
}

export interface ImageMessage extends BaseMessage {
  type: 'IMAGE';
  image: {
    id?: string;
    link?: string;
    caption?: string;
    provider?: string;
  };
}

export interface DocumentMessage extends BaseMessage {
  type: 'DOCUMENT';
  document: {
    id?: string;
    link?: string;
    caption?: string;
    filename?: string;
    provider?: string;
  };
}

export interface AudioMessage extends BaseMessage {
  type: 'AUDIO';
  audio: {
    id?: string;
    link?: string;
    provider?: string;
  };
}

export interface VideoMessage extends BaseMessage {
  type: 'VIDEO';
  video: {
    id?: string;
    link?: string;
    caption?: string;
    provider?: string;
  };
}

export interface TemplateMessage extends BaseMessage {
  type: 'TEMPLATE';
  template: {
    name: string;
    language: {
      code: string;
      policy?: 'deterministic' | 'fallback';
    };
    components?: TemplateComponent[];
  };
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: TemplateParameter[];
  sub_type?: string;
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document' | 'video' | 'currency' | 'date_time';
  text?: string;
  image?: { id?: string; link?: string };
  document?: { id?: string; link?: string };
  video?: { id?: string; link?: string };
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
}

export interface InteractiveMessage extends BaseMessage {
  type: 'INTERACTIVE';
  interactive: {
    type: 'button' | 'list' | 'product' | 'product_list';
    header?: {
      type: 'text' | 'image' | 'video' | 'document';
      text?: string;
      image?: { id?: string; link?: string };
      video?: { id?: string; link?: string };
      document?: { id?: string; link?: string };
    };
    body: { text: string };
    footer?: { text: string };
    action: InteractiveAction;
  };
}

export interface InteractiveAction {
  buttons?: Array<{
    type: 'reply';
    reply: {
      id: string;
      title: string;
    };
  }>;
  button?: string;
  sections?: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
  catalog_id?: string;
  product_retailer_id?: string;
}

export interface LocationMessage extends BaseMessage {
  type: 'LOCATION';
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

export interface ContactsMessage extends BaseMessage {
  type: 'CONTACTS';
  contacts: ContactCard[];
}

export interface ContactCard {
  name?: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
  };
  phones?: Array<{
    phone: string;
    type?: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK';
    wa_id?: string;
  }>;
  emails?: Array<{
    email: string;
    type?: 'HOME' | 'WORK';
  }>;
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: 'HOME' | 'WORK';
  }>;
  org?: {
    company?: string;
    department?: string;
    title?: string;
  };
}

export type WhatsAppMessage = 
  | TextMessage
  | ImageMessage
  | DocumentMessage
  | AudioMessage
  | VideoMessage
  | TemplateMessage
  | InteractiveMessage
  | LocationMessage
  | ContactsMessage;

// ============================================
// RESPONSE TYPES
// ============================================

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: WhatsAppError;
}

export interface WhatsAppError {
  code: number;
  message: string;
  type?: string;
  details?: Record<string, unknown>;
}

export interface QRCodeResponse {
  success: boolean;
  qrCode?: string;
  qrCodeImage?: string; // Base64 encoded image
  status: ConnectionStatus;
  expiresIn?: number;
  error?: WhatsAppError;
}

export interface ConnectionStatusResponse {
  success: boolean;
  status: ConnectionStatus;
  phoneNumber?: string;
  phoneNumberId?: string;
  wabaId?: string;
  instanceName?: string;
  lastSeen?: Date;
  error?: WhatsAppError;
}

// ============================================
// WEBHOOK PAYLOAD TYPES
// ============================================

export interface WebhookPayload {
  provider: WhatsAppProviderType;
  rawPayload: Record<string, unknown>;
  parsedData?: ParsedWebhookData;
}

export interface ParsedWebhookData {
  type: 'message' | 'status' | 'error' | 'instance_status';
  timestamp: Date;
  data: MessageWebhookData | StatusWebhookData | ErrorWebhookData | InstanceStatusData;
}

export interface MessageWebhookData {
  messageId: string;
  from: string;
  to: string;
  timestamp: Date;
  type: MessageType;
  content: MessageContent;
  context?: {
    messageId?: string;
    forwarded?: boolean;
    from?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: ContactCard[];
}

export interface MessageContent {
  text?: string;
  image?: {
    id: string;
    mime_type?: string;
    sha256?: string;
    caption?: string;
  };
  document?: {
    id: string;
    mime_type?: string;
    sha256?: string;
    filename?: string;
    caption?: string;
  };
  audio?: {
    id: string;
    mime_type?: string;
    sha256?: string;
  };
  video?: {
    id: string;
    mime_type?: string;
    sha256?: string;
    caption?: string;
  };
  sticker?: {
    id: string;
    mime_type?: string;
    sha256?: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: ContactCard[];
}

export interface StatusWebhookData {
  messageId: string;
  recipientId: string;
  status: MessageStatus;
  timestamp: Date;
  conversationId?: string;
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  error?: WhatsAppError;
}

export interface ErrorWebhookData {
  code: number;
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface InstanceStatusData {
  instanceId: string;
  instanceName?: string;
  status: ConnectionStatus;
  timestamp: Date;
  phoneNumber?: string;
  error?: WhatsAppError;
}

// ============================================
// PROVIDER CONFIGURATION TYPES
// ============================================

export interface MetaProviderConfig {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  apiVersion?: string;
  baseUrl?: string;
}

export interface EvolutionProviderConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
  instanceId?: string;
  webhookUrl?: string;
}

export type ProviderConfig = MetaProviderConfig | EvolutionProviderConfig;

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface WhatsAppProvider {
  readonly providerType: WhatsAppProviderType;
  
  // Connection Management
  connect(): Promise<ConnectionStatusResponse>;
  disconnect(): Promise<{ success: boolean; error?: WhatsAppError }>;
  getConnectionStatus(): Promise<ConnectionStatusResponse>;
  getQRCode(): Promise<QRCodeResponse>;
  
  // Message Sending
  sendMessage(message: WhatsAppMessage): Promise<SendMessageResponse>;
  sendTextMessage(to: string, text: string): Promise<SendMessageResponse>;
  sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<SendMessageResponse>;
  sendDocumentMessage(to: string, documentUrl: string, filename?: string, caption?: string): Promise<SendMessageResponse>;
  sendTemplateMessage(to: string, templateName: string, language: string, components?: TemplateComponent[]): Promise<SendMessageResponse>;
  
  // Message Management
  markAsRead(messageId: string): Promise<{ success: boolean; error?: WhatsAppError }>;
  
  // Webhook Handling
  parseWebhook(payload: Record<string, unknown>): Promise<WebhookPayload>;
  
  // Instance Management (Mainly for Evolution API)
  createInstance?(config?: Record<string, unknown>): Promise<{ success: boolean; instanceId?: string; error?: WhatsAppError }>;
  deleteInstance?(): Promise<{ success: boolean; error?: WhatsAppError }>;
  
  // Health Check
  healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: WhatsAppError }>;
}

// ============================================
// FACTORY TYPES
// ============================================

export interface ProviderFactoryConfig {
  providerType: WhatsAppProviderType;
  config: ProviderConfig;
}

export interface TenantWhatsAppConfig {
  tenantId: string;
  providerType: WhatsAppProviderType;
  metaConfig?: MetaProviderConfig;
  evolutionConfig?: EvolutionProviderConfig;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

export interface RateLimitConfig {
  maxRequestsPerSecond: number;
  maxRequestsPerMinute: number;
  maxRequestsPerDay: number;
}

export const META_RATE_LIMITS: RateLimitConfig = {
  maxRequestsPerSecond: 80,
  maxRequestsPerMinute: 4800,
  maxRequestsPerDay: 100000,
};

export const EVOLUTION_RATE_LIMITS: RateLimitConfig = {
  maxRequestsPerSecond: 10,
  maxRequestsPerMinute: 600,
  maxRequestsPerDay: 10000,
};
