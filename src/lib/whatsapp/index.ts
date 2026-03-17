/**
 * WhatsApp Integration Module - Provider Factory
 * SaaSWPP AI Platform - Multi-provider WhatsApp support
 */

import crypto from 'crypto';

import type {
  WhatsAppProvider,
  WhatsAppProviderType,
  MetaProviderConfig,
  EvolutionProviderConfig,
  ProviderConfig,
  TenantWhatsAppConfig,
  ConnectionStatusResponse,
  SendMessageResponse,
  QRCodeResponse,
  WhatsAppMessage,
  WhatsAppError,
  TemplateComponent,
  WebhookPayload,
} from './types';

import { MetaWhatsAppProvider, createMetaProvider } from './meta-provider';
import { EvolutionWhatsAppProvider, createEvolutionProvider } from './evolution-provider';

// Re-export all types
export * from './types';
export { MetaWhatsAppProvider, createMetaProvider } from './meta-provider';
export { EvolutionWhatsAppProvider, createEvolutionProvider } from './evolution-provider';

// ============================================
// PROVIDER FACTORY
// ============================================

export class ProviderFactory {
  private static instances: Map<string, WhatsAppProvider> = new Map();

  /**
   * Create a WhatsApp provider instance based on configuration
   */
  static createProvider(
    providerType: WhatsAppProviderType,
    config: ProviderConfig
  ): WhatsAppProvider {
    switch (providerType) {
      case 'META':
        return createMetaProvider(config as MetaProviderConfig);
      
      case 'EVOLUTION':
        return createEvolutionProvider(config as EvolutionProviderConfig);
      
      default:
        throw new Error(`Unsupported WhatsApp provider type: ${providerType}`);
    }
  }

  /**
   * Get or create a cached provider instance for a tenant
   */
  static getProviderForTenant(
    tenantId: string,
    tenantConfig: TenantWhatsAppConfig
  ): WhatsAppProvider {
    const cacheKey = `${tenantId}-${tenantConfig.providerType}`;
    
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    let provider: WhatsAppProvider;
    
    switch (tenantConfig.providerType) {
      case 'META':
        if (!tenantConfig.metaConfig) {
          throw new Error('Meta configuration is required for Meta provider');
        }
        provider = createMetaProvider(tenantConfig.metaConfig);
        break;
      
      case 'EVOLUTION':
        if (!tenantConfig.evolutionConfig) {
          throw new Error('Evolution configuration is required for Evolution provider');
        }
        provider = createEvolutionProvider(tenantConfig.evolutionConfig);
        break;
      
      default:
        throw new Error(`Unsupported provider type: ${tenantConfig.providerType}`);
    }

    this.instances.set(cacheKey, provider);
    return provider;
  }

  /**
   * Clear cached provider instance for a tenant
   */
  static clearProviderForTenant(tenantId: string, providerType: WhatsAppProviderType): void {
    const cacheKey = `${tenantId}-${providerType}`;
    this.instances.delete(cacheKey);
  }

  /**
   * Clear all cached provider instances
   */
  static clearAllProviders(): void {
    this.instances.clear();
  }

  /**
   * Create provider from database configuration
   */
  static createFromDbConfig(dbConfig: {
    provider: string;
    phoneNumberId?: string | null;
    wabaId?: string | null;
    instanceName?: string | null;
    providerInstanceId?: string | null;
    settings?: Record<string, unknown>;
  }): WhatsAppProvider {
    const providerType = dbConfig.provider.toUpperCase() as WhatsAppProviderType;

    switch (providerType) {
      case 'META':
        if (!dbConfig.phoneNumberId || !dbConfig.wabaId) {
          throw new Error('phoneNumberId and wabaId are required for Meta provider');
        }
        return createMetaProvider({
          accessToken: (dbConfig.settings?.accessToken as string) || process.env.META_ACCESS_TOKEN || '',
          phoneNumberId: dbConfig.phoneNumberId,
          wabaId: dbConfig.wabaId,
          apiVersion: (dbConfig.settings?.apiVersion as string) || undefined,
          baseUrl: (dbConfig.settings?.baseUrl as string) || undefined,
        });
      
      case 'EVOLUTION':
        if (!dbConfig.instanceName) {
          throw new Error('instanceName is required for Evolution provider');
        }
        return createEvolutionProvider({
          baseUrl: (dbConfig.settings?.baseUrl as string) || process.env.EVOLUTION_BASE_URL || 'http://localhost:8080',
          apiKey: (dbConfig.settings?.apiKey as string) || process.env.EVOLUTION_API_KEY || '',
          instanceName: dbConfig.instanceName,
          instanceId: dbConfig.providerInstanceId || undefined,
          webhookUrl: (dbConfig.settings?.webhookUrl as string) || undefined,
        });
      
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-numeric characters
  let formatted = phone.replace(/\D/g, '');
  
  // Remove leading zeros after country code
  if (formatted.startsWith('00')) {
    formatted = formatted.substring(2);
  }
  
  // Handle Brazilian numbers specially
  if (formatted.startsWith('55') && formatted.length === 13) {
    // Brazilian mobile numbers: 55 + DDD + 9 + number
    const ddd = formatted.substring(2, 4);
    const number = formatted.substring(4);
    // Ensure 9 is present for mobile
    if (!number.startsWith('9')) {
      formatted = `55${ddd}9${number}`;
    }
  }
  
  return formatted;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Phone number is required' };
  }

  const formatted = formatPhoneNumber(phone);
  
  // Minimum length check (country code + number)
  if (formatted.length < 8) {
    return { valid: false, error: 'Phone number is too short' };
  }
  
  // Maximum length check
  if (formatted.length > 15) {
    return { valid: false, error: 'Phone number is too long' };
  }
  
  return { valid: true, formatted };
}

/**
 * Extract media type from MIME type
 */
export function getMediaTypeFromMime(mimeType: string): 'image' | 'document' | 'audio' | 'video' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('application/') || mimeType.includes('pdf') || mimeType.includes('document')) {
    return 'document';
  }
  return 'unknown';
}

/**
 * Parse WhatsApp message ID to extract timestamp
 */
export function extractTimestampFromMessageId(messageId: string): Date | null {
  // WhatsApp message IDs contain encoded timestamp
  // Format varies by provider
  try {
    // For Meta Cloud API, message IDs are base64 encoded
    // This is a simplified extraction
    const match = messageId.match(/(\d{10,})/);
    if (match) {
      return new Date(parseInt(match[1]) * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a unique message reference ID
 */
export function generateMessageRef(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MSG_${timestamp}_${random}`.toUpperCase();
}

/**
 * Check if a message requires a template (for Meta API)
 * Messages sent outside the 24h window require templates
 */
export function requiresTemplate(lastMessageTimestamp: Date | null): boolean {
  if (!lastMessageTimestamp) return true;
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return lastMessageTimestamp < twentyFourHoursAgo;
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  initialDelayMs: number = 1000,
  maxDelayMs: number = 10000,
  multiplier: number = 2
): number {
  const delay = initialDelayMs * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelayMs);
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries - 1) {
        const delay = calculateRetryDelay(attempt, initialDelayMs);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

// ============================================
// WEBHOOK VERIFICATION
// ============================================

/**
 * Verify Meta webhook signature
 */
export function verifyMetaWebhookSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
  } catch {
    return false;
  }
}

/**
 * Generate Evolution API webhook event name
 */
export function getEvolutionWebhookEvents(): string[] {
  return [
    'messages.upsert',
    'messages.upsert.app',
    'messages.upsert.auth',
    'messages.upsert.me',
    'messages.update',
    'messages.delete',
    'messages.read',
    'connection.update',
    'groups.upsert',
    'groups.update',
    'groups.participants',
    'calls.upsert',
    'chats.upsert',
    'chats.update',
    'chats.delete',
    'presence.update',
  ];
}

// ============================================
// RATE LIMITING HELPERS
// ============================================

export interface RateLimiter {
  canSend(): boolean;
  recordSend(): void;
  getWaitTime(): number;
}

/**
 * Simple in-memory rate limiter
 */
export class SimpleRateLimiter implements RateLimiter {
  private sends: number[] = [];
  private maxPerSecond: number;
  private maxPerMinute: number;

  constructor(maxPerSecond: number = 80, maxPerMinute: number = 4800) {
    this.maxPerSecond = maxPerSecond;
    this.maxPerMinute = maxPerMinute;
  }

  canSend(): boolean {
    this.cleanup();
    return this.sends.length < this.maxPerMinute;
  }

  recordSend(): void {
    this.sends.push(Date.now());
  }

  getWaitTime(): number {
    this.cleanup();
    if (this.sends.length < this.maxPerSecond) {
      return 0;
    }
    
    const oneSecondAgo = Date.now() - 1000;
    const recentSends = this.sends.filter(t => t > oneSecondAgo);
    
    if (recentSends.length >= this.maxPerSecond && recentSends.length > 0) {
      return recentSends[0] + 1000 - Date.now();
    }
    
    return 0;
  }

  private cleanup(): void {
    const oneMinuteAgo = Date.now() - 60000;
    this.sends = this.sends.filter(t => t > oneMinuteAgo);
  }
}


