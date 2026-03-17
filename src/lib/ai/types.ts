/**
 * AI Pool Types - SaaSWPP AI Platform
 * TypeScript interfaces for multi-provider AI pool with failover
 */

// ============================================
// MESSAGE TYPES
// ============================================

export type ChatRole = 'system' | 'user' | 'assistant' | 'function' | 'tool';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  toolCallId?: string;
}

export interface ChatMessageWithMetadata extends ChatMessage {
  id: string;
  timestamp: Date;
  provider?: AIProviderType;
  tokens?: number;
  cost?: number;
}

// ============================================
// PROVIDER TYPES
// ============================================

export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'custom';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderType;
  contextWindow: number;
  inputCostPer1k: number;  // Cost in USD per 1k input tokens
  outputCostPer1k: number; // Cost in USD per 1k output tokens
  maxOutputTokens: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
}

// OpenAI Models
export const OPENAI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    inputCostPer1k: 0.005,
    outputCostPer1k: 0.015,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextWindow: 128000,
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128000,
    inputCostPer1k: 0.01,
    outputCostPer1k: 0.03,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    contextWindow: 16385,
    inputCostPer1k: 0.0005,
    outputCostPer1k: 0.0015,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
  },
];

// Anthropic Models
export const ANTHROPIC_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    contextWindow: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    contextWindow: 200000,
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200000,
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
];

// Gemini Models
export const GEMINI_MODELS: AIModel[] = [
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    contextWindow: 1000000,
    inputCostPer1k: 0.00125,
    outputCostPer1k: 0.005,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    contextWindow: 1000000,
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    contextWindow: 32760,
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.0005,
    maxOutputTokens: 2048,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
  },
];

// ============================================
// COMPLETION OPTIONS
// ============================================

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export interface StreamingOptions extends CompletionOptions {
  stream: true;
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

// ============================================
// EXECUTION RESULT TYPES
// ============================================

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CompletionResult {
  success: boolean;
  content: string;
  model: string;
  provider: AIProviderType;
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'error' | 'unknown';
  functionCall?: {
    name: string;
    arguments: unknown;
  };
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: unknown;
    };
  }>;
  metadata?: Record<string, unknown>;
}

export interface StreamingResult {
  success: boolean;
  stream: AsyncIterable<string>;
  model: string;
  provider: AIProviderType;
  abort: () => void;
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface AIProvider {
  readonly name: AIProviderType;
  readonly models: AIModel[];
  readonly isConfigured: boolean;
  
  /**
   * Check if the provider is available and healthy
   */
  healthCheck(): Promise<boolean>;
  
  /**
   * Get available models for this provider
   */
  getModels(): AIModel[];
  
  /**
   * Get a specific model by ID
   */
  getModel(modelId: string): AIModel | undefined;
  
  /**
   * Create a chat completion
   */
  createCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions
  ): Promise<CompletionResult>;
  
  /**
   * Create a streaming chat completion
   */
  createStreamingCompletion?(
    messages: ChatMessage[],
    options?: StreamingOptions
  ): Promise<StreamingResult>;
  
  /**
   * Count tokens for a given text
   */
  countTokens(text: string): number;
  
  /**
   * Calculate cost for a given token usage
   */
  calculateCost(usage: TokenUsage, modelId: string): number;
}

// ============================================
// FAILOVER EVENT TYPES
// ============================================

export type FailoverEventType = 
  | 'provider_selected'
  | 'provider_failed'
  | 'provider_timeout'
  | 'provider_quota_exceeded'
  | 'provider_rate_limited'
  | 'provider_unhealthy'
  | 'failover_triggered'
  | 'failover_complete'
  | 'all_providers_failed'
  | 'health_check_passed'
  | 'health_check_failed'
  | 'quota_reset';

export interface FailoverEvent {
  type: FailoverEventType;
  timestamp: Date;
  provider?: AIProviderType;
  model?: string;
  reason?: string;
  error?: Error;
  attemptNumber?: number;
  nextProvider?: AIProviderType;
  originalProvider?: AIProviderType;
  metadata?: Record<string, unknown>;
}

export type FailoverEventHandler = (event: FailoverEvent) => void;

// ============================================
// POOL CONFIGURATION TYPES
// ============================================

export interface ProviderConfig {
  type: AIProviderType;
  enabled: boolean;
  priority: number; // Lower number = higher priority
  models: string[]; // Allowed models for this provider
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
  quotaLimit?: number; // Monthly token limit
  quotaUsed?: number;
  rateLimitRpm?: number; // Requests per minute
  rateLimitTpm?: number; // Tokens per minute
  apiKey?: string;
  baseUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PoolConfig {
  providers: ProviderConfig[];
  defaultModel?: string;
  defaultProvider?: AIProviderType;
  healthCheckIntervalMs: number;
  healthCheckTimeoutMs: number;
  enableAutoFailover: boolean;
  maxFailoverAttempts: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  onFailoverEvent?: FailoverEventHandler;
  executionTimeoutMs: number;
  retryOnRateLimit: boolean;
  retryOnTimeout: boolean;
  retryOnServerError: boolean;
}

export const DEFAULT_POOL_CONFIG: Partial<PoolConfig> = {
  healthCheckIntervalMs: 60000, // 1 minute
  healthCheckTimeoutMs: 10000, // 10 seconds
  enableAutoFailover: true,
  maxFailoverAttempts: 3,
  logLevel: 'info',
  executionTimeoutMs: 60000, // 60 seconds
  retryOnRateLimit: true,
  retryOnTimeout: true,
  retryOnServerError: true,
};

// ============================================
// HEALTH CHECK TYPES
// ============================================

export interface ProviderHealthStatus {
  provider: AIProviderType;
  healthy: boolean;
  lastChecked: Date;
  lastError?: string;
  consecutiveFailures: number;
  avgLatencyMs: number;
  quotaRemaining?: number;
  rateLimitRemaining?: number;
}

// ============================================
// EXECUTION LOG TYPES
// ============================================

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  provider: AIProviderType;
  model: string;
  success: boolean;
  latencyMs: number;
  tokens?: TokenUsage;
  cost?: number;
  errorMessage?: string;
  errorCode?: string;
  wasFailover: boolean;
  originalProvider?: AIProviderType;
  metadata?: Record<string, unknown>;
}

// ============================================
// ERROR TYPES
// ============================================

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: AIProviderType,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class AIQuotaExceededError extends AIProviderError {
  constructor(provider: AIProviderType, quotaLimit: number, quotaUsed: number) {
    super(
      `Quota exceeded for ${provider}: ${quotaUsed}/${quotaLimit} tokens used`,
      provider,
      'QUOTA_EXCEEDED',
      false
    );
    this.name = 'AIQuotaExceededError';
  }
}

export class AIRateLimitError extends AIProviderError {
  constructor(
    provider: AIProviderType,
    public readonly retryAfterMs: number
  ) {
    super(
      `Rate limit exceeded for ${provider}. Retry after ${retryAfterMs}ms`,
      provider,
      'RATE_LIMIT',
      true
    );
    this.name = 'AIRateLimitError';
  }
}

export class AITimeoutError extends AIProviderError {
  constructor(provider: AIProviderType, timeoutMs: number) {
    super(
      `Request timeout for ${provider} after ${timeoutMs}ms`,
      provider,
      'TIMEOUT',
      true
    );
    this.name = 'AITimeoutError';
  }
}

export class AIModelNotFoundError extends AIProviderError {
  constructor(provider: AIProviderType, modelId: string) {
    super(
      `Model ${modelId} not found for provider ${provider}`,
      provider,
      'MODEL_NOT_FOUND',
      false
    );
    this.name = 'AIModelNotFoundError';
  }
}

export class AINoProvidersAvailableError extends Error {
  constructor(message: string = 'No AI providers available') {
    super(message);
    this.name = 'AINoProvidersAvailableError';
  }
}

// ============================================
// UTILITY TYPES
// ============================================

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: ['RATE_LIMIT', 'TIMEOUT', 'SERVER_ERROR', 'OVERLOADED'],
};

export interface TokenCountResult {
  tokens: number;
  characters: number;
  words: number;
}
