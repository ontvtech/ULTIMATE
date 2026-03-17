/**
 * AI Pool Module - SaaSWPP AI Platform
 * Main exports for multi-provider AI pool with failover
 */

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  AIProvider,
  AIProviderType,
  AIModel,
  ChatRole,
  ChatMessage,
  ChatMessageWithMetadata,
  CompletionOptions,
  StreamingOptions,
  CompletionResult,
  StreamingResult,
  TokenUsage,
  FailoverEvent,
  FailoverEventHandler,
  FailoverEventType,
  PoolConfig,
  ProviderConfig,
  ProviderHealthStatus,
  ExecutionLog,
  RetryConfig,
  TokenCountResult,
} from './types';

// Model constants
export {
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  GEMINI_MODELS,
} from './types';

// Default configurations
export {
  DEFAULT_POOL_CONFIG,
  DEFAULT_RETRY_CONFIG,
} from './types';

// Error classes
export {
  AIProviderError,
  AIQuotaExceededError,
  AIRateLimitError,
  AITimeoutError,
  AIModelNotFoundError,
  AINoProvidersAvailableError,
} from './types';

// ============================================
// PROVIDER EXPORTS
// ============================================

export {
  OpenAIProvider,
  createOpenAIProvider,
  type OpenAIProviderConfig,
} from './providers/openai';

export {
  AnthropicProvider,
  createAnthropicProvider,
  type AnthropicProviderConfig,
} from './providers/anthropic';

export {
  GeminiProvider,
  createGeminiProvider,
  type GeminiProviderConfig,
  type GeminiSafetySetting,
  DEFAULT_SAFETY_SETTINGS,
} from './providers/gemini';

// ============================================
// POOL EXPORTS
// ============================================

export {
  AIPoolManager,
  createAIPoolManager,
  DEFAULT_PROVIDERS_CONFIG,
} from './pool';

// ============================================
// FACTORY FUNCTIONS
// ============================================

import { AIPoolManager, createAIPoolManager } from './pool';
import { createOpenAIProvider } from './providers/openai';
import { createAnthropicProvider } from './providers/anthropic';
import { createGeminiProvider } from './providers/gemini';
import type {
  PoolConfig,
  ProviderConfig,
  ChatMessage,
  CompletionOptions,
  CompletionResult,
  AIProviderType,
} from './types';
import { DEFAULT_PROVIDERS_CONFIG } from './pool';

// Singleton instance for convenience
let defaultPool: AIPoolManager | null = null;

/**
 * Get or create the default AI pool instance
 */
export function getAIPool(config?: Partial<PoolConfig>): AIPoolManager {
  if (!defaultPool) {
    defaultPool = createAIPoolManager({
      providers: DEFAULT_PROVIDERS_CONFIG,
      ...config,
    });
  }
  return defaultPool;
}

/**
 * Initialize the default pool with custom configuration
 */
export async function initializeAIPool(config?: Partial<PoolConfig>): Promise<AIPoolManager> {
  const pool = getAIPool(config);
  await pool.initialize();
  return pool;
}

/**
 * Quick completion helper using the default pool
 */
export async function quickCompletion(
  messages: ChatMessage[],
  options?: CompletionOptions
): Promise<CompletionResult> {
  const pool = getAIPool();
  await pool.initialize();
  return pool.createCompletion(messages, options);
}

/**
 * Quick chat helper for simple single-turn conversations
 */
export async function quickChat(
  prompt: string,
  systemPrompt?: string,
  options?: CompletionOptions
): Promise<string> {
  const messages: ChatMessage[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: prompt });

  const result = await quickCompletion(messages, options);
  return result.content;
}

/**
 * Create a configured pool with specific providers
 */
export function createConfiguredPool(options: {
  providers?: AIProviderType[];
  defaultProvider?: AIProviderType;
  defaultModel?: string;
  onFailover?: Parameters<typeof createAIPoolManager>[0]['onFailoverEvent'];
}): AIPoolManager {
  const { providers = ['openai', 'anthropic', 'gemini'], defaultProvider, defaultModel, onFailover } = options;

  const providerConfigs: ProviderConfig[] = DEFAULT_PROVIDERS_CONFIG
    .filter(config => providers.includes(config.type))
    .map((config, index) => ({
      ...config,
      priority: index + 1,
    }));

  return createAIPoolManager({
    providers: providerConfigs,
    defaultProvider,
    defaultModel,
    onFailoverEvent: onFailover,
  });
}

/**
 * Helper to create a pool with a single provider
 */
export function createSingleProviderPool(
  providerType: AIProviderType,
  model?: string
): AIPoolManager {
  const config = DEFAULT_PROVIDERS_CONFIG.find(c => c.type === providerType);
  
  if (!config) {
    throw new Error(`Unknown provider type: ${providerType}`);
  }

  return createAIPoolManager({
    providers: [{
      ...config,
      models: model ? [model] : config.models,
    }],
    defaultProvider: providerType,
    defaultModel: model || config.models[0],
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Count tokens for a text using approximation
 */
export function countTokens(text: string): number {
  // Simple approximation: ~4 characters per token
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil((charCount / 4 + wordCount) / 2);
}

/**
 * Estimate cost for a completion
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  modelId: string
): number {
  // Cost per 1k tokens (approximate)
  const costs: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
    'gemini-pro': { input: 0.00025, output: 0.0005 },
  };

  const modelCost = costs[modelId];
  if (!modelCost) {
    // Default fallback cost
    return (inputTokens + outputTokens) * 0.001;
  }

  const inputCost = (inputTokens / 1000) * modelCost.input;
  const outputCost = (outputTokens / 1000) * modelCost.output;
  return Number((inputCost + outputCost).toFixed(6));
}

/**
 * Validate a model ID
 */
export function isValidModel(modelId: string): boolean {
  const validModels = [
    'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo',
    'claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307',
    'claude-3-opus-20240229', 'claude-3-sonnet-20240229',
    'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-pro', 'gemini-2.0-flash',
  ];
  return validModels.includes(modelId);
}

/**
 * Get provider type from model ID
 */
export function getProviderForModel(modelId: string): AIProviderType | null {
  if (modelId.startsWith('gpt-')) return 'openai';
  if (modelId.startsWith('claude-')) return 'anthropic';
  if (modelId.startsWith('gemini-')) return 'gemini';
  return null;
}

/**
 * Create chat messages from a conversation history
 */
export function createMessagesFromHistory(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  for (const turn of history) {
    messages.push({ role: turn.role, content: turn.content });
  }

  return messages;
}

// ============================================
// DEFAULT EXPORT
// ============================================

const aiPoolModule = {
  // Pool management
  getAIPool,
  initializeAIPool,
  createAIPoolManager,
  createConfiguredPool,
  createSingleProviderPool,
  
  // Quick helpers
  quickCompletion,
  quickChat,
  
  // Utilities
  countTokens,
  estimateCost,
  isValidModel,
  getProviderForModel,
  createMessagesFromHistory,
};

export default aiPoolModule;
