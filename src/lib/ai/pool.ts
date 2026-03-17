/**
 * AI Pool Manager - SaaSWPP AI Platform
 * Multi-provider pool with automatic failover, health checking, and quota management
 */

import type { AIProvider } from './types';
import {
  type AIProviderType,
  type ChatMessage,
  type CompletionOptions,
  type CompletionResult,
  type StreamingOptions,
  type StreamingResult,
  type TokenUsage,
  type PoolConfig,
  type ProviderConfig,
  type ProviderHealthStatus,
  type ExecutionLog,
  type FailoverEvent,
  type FailoverEventHandler,
  type RetryConfig,
  DEFAULT_POOL_CONFIG,
  DEFAULT_RETRY_CONFIG,
  AIProviderError,
  AINoProvidersAvailableError,
  AIQuotaExceededError,
  AIRateLimitError,
  AITimeoutError,
} from './types';
import { OpenAIProvider, createOpenAIProvider } from './providers/openai';
import { AnthropicProvider, createAnthropicProvider } from './providers/anthropic';
import { GeminiProvider, createGeminiProvider } from './providers/gemini';

/**
 * AI Pool Manager
 * Manages multiple AI providers with automatic failover and health checking
 */
export class AIPoolManager {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private providerConfigs: Map<AIProviderType, ProviderConfig> = new Map();
  private healthStatus: Map<AIProviderType, ProviderHealthStatus> = new Map();
  private executionLogs: ExecutionLog[] = [];
  private config: PoolConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = {
      ...DEFAULT_POOL_CONFIG,
      ...config,
    } as PoolConfig;
  }

  /**
   * Initialize the pool with providers
   */
  async initialize(): Promise<void> {
    if (this.isRunning) return;

    // Create providers from configuration
    for (const providerConfig of this.config.providers) {
      if (!providerConfig.enabled) continue;

      const provider = this.createProvider(providerConfig);
      if (provider) {
        this.providers.set(providerConfig.type, provider);
        this.providerConfigs.set(providerConfig.type, providerConfig);

        // Initialize health status
        this.healthStatus.set(providerConfig.type, {
          provider: providerConfig.type,
          healthy: true,
          lastChecked: new Date(),
          consecutiveFailures: 0,
          avgLatencyMs: 0,
        });
      }
    }

    // Start health checking
    this.startHealthChecking();
    this.isRunning = true;

    // Perform initial health check
    await this.performHealthCheck();
  }

  /**
   * Create a provider instance based on configuration
   */
  private createProvider(config: ProviderConfig): AIProvider | null {
    switch (config.type) {
      case 'openai':
        return createOpenAIProvider({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          defaultModel: config.models[0],
          timeout: config.timeoutMs,
          maxRetries: config.maxRetries,
        });
      case 'anthropic':
        return createAnthropicProvider({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          defaultModel: config.models[0],
          timeout: config.timeoutMs,
          maxRetries: config.maxRetries,
        });
      case 'gemini':
        return createGeminiProvider({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          defaultModel: config.models[0],
          timeout: config.timeoutMs,
          maxRetries: config.maxRetries,
        });
      default:
        console.warn(`Unknown provider type: ${config.type}`);
        return null;
    }
  }

  /**
   * Start periodic health checking
   */
  private startHealthChecking(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck().catch(err => {
        console.error('Health check failed:', err);
      });
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * Perform health check on all providers
   */
  private async performHealthCheck(): Promise<void> {
    const checkPromises = Array.from(this.providers.entries()).map(
      async ([type, provider]) => {
        const startTime = Date.now();
        let healthy = false;

        try {
          healthy = await Promise.race([
            provider.healthCheck(),
            new Promise<boolean>((_, reject) =>
              setTimeout(() => reject(new Error('Health check timeout')), this.config.healthCheckTimeoutMs)
            ),
          ]);
        } catch {
          healthy = false;
        }

        const latency = Date.now() - startTime;
        const status = this.healthStatus.get(type);
        const config = this.providerConfigs.get(type);

        if (status) {
          const previousHealthy = status.healthy;
          status.healthy = healthy;
          status.lastChecked = new Date();
          status.avgLatencyMs = (status.avgLatencyMs + latency) / 2;

          if (!healthy) {
            status.consecutiveFailures++;
            status.lastError = 'Health check failed';

            this.emitEvent({
              type: 'health_check_failed',
              timestamp: new Date(),
              provider: type,
              reason: `Consecutive failures: ${status.consecutiveFailures}`,
            });
          } else {
            status.consecutiveFailures = 0;
            delete status.lastError;

            if (!previousHealthy) {
              this.emitEvent({
                type: 'health_check_passed',
                timestamp: new Date(),
                provider: type,
              });
            }
          }

          // Check quota
          if (config?.quotaLimit && config.quotaUsed !== undefined) {
            status.quotaRemaining = Math.max(0, config.quotaLimit - config.quotaUsed);
          }
        }
      }
    );

    await Promise.allSettled(checkPromises);
  }

  /**
   * Emit a failover event
   */
  private emitEvent(event: FailoverEvent): void {
    if (this.config.onFailoverEvent) {
      try {
        this.config.onFailoverEvent(event);
      } catch (err) {
        console.error('Error in failover event handler:', err);
      }
    }

    // Log based on level
    switch (this.config.logLevel) {
      case 'debug':
        console.debug('[AI Pool]', event);
        break;
      case 'info':
        if (['provider_failed', 'failover_triggered', 'all_providers_failed'].includes(event.type)) {
          console.info('[AI Pool]', event);
        }
        break;
      case 'warn':
        if (['provider_failed', 'provider_unhealthy', 'failover_triggered'].includes(event.type)) {
          console.warn('[AI Pool]', event);
        }
        break;
      case 'error':
        if (['provider_failed', 'all_providers_failed'].includes(event.type)) {
          console.error('[AI Pool]', event);
        }
        break;
    }
  }

  /**
   * Get available providers sorted by priority and health
   */
  private getAvailableProviders(): AIProviderType[] {
    const available: Array<{ type: AIProviderType; priority: number; healthy: boolean }> = [];

    for (const [type, config] of this.providerConfigs) {
      if (!config.enabled) continue;

      const status = this.healthStatus.get(type);
      const isHealthy = status?.healthy ?? true;

      // Check quota
      if (config.quotaLimit && config.quotaUsed !== undefined) {
        if (config.quotaUsed >= config.quotaLimit) {
          continue; // Skip providers with exhausted quota
        }
      }

      available.push({
        type,
        priority: config.priority,
        healthy: isHealthy,
      });
    }

    // Sort by: healthy first, then by priority (lower = higher priority)
    return available
      .sort((a, b) => {
        if (a.healthy !== b.healthy) {
          return a.healthy ? -1 : 1;
        }
        return a.priority - b.priority;
      })
      .map(p => p.type);
  }

  /**
   * Check if a provider can handle a specific model
   */
  private canProviderHandleModel(providerType: AIProviderType, modelId?: string): boolean {
    if (!modelId) return true;

    const config = this.providerConfigs.get(providerType);
    if (!config) return false;

    // If no models specified, allow all
    if (config.models.length === 0) return true;

    return config.models.includes(modelId);
  }

  /**
   * Select the best provider for a request
   */
  private selectProvider(modelId?: string, preferredProvider?: AIProviderType): AIProviderType | null {
    // If a preferred provider is specified and available, use it
    if (preferredProvider) {
      const config = this.providerConfigs.get(preferredProvider);
      const status = this.healthStatus.get(preferredProvider);
      const provider = this.providers.get(preferredProvider);

      if (
        config?.enabled &&
        (status?.healthy ?? true) &&
        provider?.isConfigured &&
        this.canProviderHandleModel(preferredProvider, modelId)
      ) {
        // Check quota
        if (config.quotaLimit && config.quotaUsed !== undefined) {
          if (config.quotaUsed < config.quotaLimit) {
            return preferredProvider;
          }
        } else {
          return preferredProvider;
        }
      }
    }

    // Get available providers and select the best one
    const available = this.getAvailableProviders();
    
    for (const type of available) {
      if (this.canProviderHandleModel(type, modelId)) {
        return type;
      }
    }

    return null;
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = config.initialDelayMs;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        const aiError = error as AIProviderError;
        const isRetryable = config.retryableErrors.includes(aiError.code || '') || 
          (aiError.retryable ?? false);

        if (!isRetryable || attempt === config.maxRetries) {
          throw error;
        }

        // Wait before retry
        await this.sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
      }
    }

    throw lastError;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a completion with automatic failover
   */
  async createCompletion(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    await this.initialize();

    const modelId = options.model || this.config.defaultModel;
    let attemptNumber = 0;
    let originalProvider = this.config.defaultProvider;
    const failedProviders = new Set<AIProviderType>();

    while (attemptNumber < this.config.maxFailoverAttempts) {
      // Select provider
      const providerType = this.selectProvider(modelId, attemptNumber === 0 ? originalProvider : undefined);

      if (!providerType) {
        this.emitEvent({
          type: 'all_providers_failed',
          timestamp: new Date(),
          reason: 'No available providers after all failover attempts',
          attemptNumber,
        });
        throw new AINoProvidersAvailableError(
          'No AI providers available after exhausting all failover options'
        );
      }

      // Record original provider for first attempt
      if (attemptNumber === 0) {
        originalProvider = providerType;
      }

      const provider = this.providers.get(providerType);
      const providerConfig = this.providerConfigs.get(providerType);

      if (!provider) {
        failedProviders.add(providerType);
        attemptNumber++;
        continue;
      }

      // Emit selection event
      this.emitEvent({
        type: 'provider_selected',
        timestamp: new Date(),
        provider: providerType,
        model: modelId,
        attemptNumber,
        metadata: { failedProviders: Array.from(failedProviders) },
      });

      try {
        // Execute with timeout
        const result = await this.executeWithTimeout(
          provider.createCompletion(messages, options),
          options.timeout || this.config.executionTimeoutMs
        );

        // Update quota
        if (providerConfig?.quotaUsed !== undefined && result.usage) {
          providerConfig.quotaUsed += result.usage.totalTokens;
        }

        // Log execution
        this.logExecution({
          id: this.generateId(),
          timestamp: new Date(),
          provider: providerType,
          model: result.model,
          success: true,
          latencyMs: result.latencyMs,
          tokens: result.usage,
          cost: result.cost,
          wasFailover: attemptNumber > 0,
          originalProvider: attemptNumber > 0 ? originalProvider : undefined,
        });

        // If this was a failover, emit completion event
        if (attemptNumber > 0) {
          this.emitEvent({
            type: 'failover_complete',
            timestamp: new Date(),
            provider: providerType,
            model: result.model,
            attemptNumber,
            originalProvider,
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const aiError = error as AIProviderError;

        // Mark provider as potentially unhealthy
        const status = this.healthStatus.get(providerType);
        if (status) {
          status.lastError = errorMessage;
        }

        // Emit failure event
        this.emitEvent({
          type: 'provider_failed',
          timestamp: new Date(),
          provider: providerType,
          model: modelId,
          reason: errorMessage,
          error: error instanceof Error ? error : new Error(errorMessage),
          attemptNumber,
        });

        // Check if we should try failover
        if (this.config.enableAutoFailover) {
          // Determine if error warrants failover
          const shouldFailover = 
            aiError.code === 'RATE_LIMIT' ||
            aiError.code === 'TIMEOUT' ||
            aiError.code === 'QUOTA_EXCEEDED' ||
            aiError.code === 'SERVER_ERROR' ||
            (aiError.retryable ?? false);

          if (shouldFailover) {
            failedProviders.add(providerType);

            this.emitEvent({
              type: 'failover_triggered',
              timestamp: new Date(),
              provider: providerType,
              model: modelId,
              reason: errorMessage,
              attemptNumber: attemptNumber + 1,
              nextProvider: this.selectProvider(modelId, undefined) || undefined,
            });
          }
        }

        // Log failed execution
        this.logExecution({
          id: this.generateId(),
          timestamp: new Date(),
          provider: providerType,
          model: modelId || 'unknown',
          success: false,
          latencyMs: 0,
          errorMessage,
          errorCode: aiError.code,
          wasFailover: attemptNumber > 0,
          originalProvider: attemptNumber > 0 ? originalProvider : undefined,
        });

        attemptNumber++;
      }
    }

    throw new AINoProvidersAvailableError(
      'All AI providers failed after maximum failover attempts'
    );
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeoutMs)
      ),
    ]);
  }

  /**
   * Create a streaming completion with failover
   */
  async createStreamingCompletion(
    messages: ChatMessage[],
    options: StreamingOptions = {}
  ): Promise<StreamingResult> {
    await this.initialize();

    const modelId = options.model || this.config.defaultModel;
    const providerType = this.selectProvider(modelId, this.config.defaultProvider);

    if (!providerType) {
      throw new AINoProvidersAvailableError('No AI providers available');
    }

    const provider = this.providers.get(providerType);

    if (!provider || !provider.createStreamingCompletion) {
      // Fallback to non-streaming
      const result = await this.createCompletion(messages, { ...options, stream: false });
      
      // Create a fake stream from the result
      const asyncIterable: AsyncIterable<string> = {
        [Symbol.asyncIterator]() {
          let done = false;
          return {
            async next() {
              if (done) return { done: true, value: undefined };
              done = true;
              return { done: false, value: result.content };
            },
          };
        },
      };

      return {
        success: true,
        stream: asyncIterable,
        model: result.model,
        provider: result.provider,
        abort: () => {},
      };
    }

    return provider.createStreamingCompletion(messages, options);
  }

  /**
   * Log an execution
   */
  private logExecution(log: ExecutionLog): void {
    this.executionLogs.push(log);

    // Keep only last 1000 logs
    if (this.executionLogs.length > 1000) {
      this.executionLogs = this.executionLogs.slice(-1000);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  /**
   * Get all provider health statuses
   */
  getHealthStatuses(): Map<AIProviderType, ProviderHealthStatus> {
    return new Map(this.healthStatus);
  }

  /**
   * Get a specific provider's health status
   */
  getProviderHealth(providerType: AIProviderType): ProviderHealthStatus | undefined {
    return this.healthStatus.get(providerType);
  }

  /**
   * Get execution logs
   */
  getExecutionLogs(limit = 100): ExecutionLog[] {
    return this.executionLogs.slice(-limit);
  }

  /**
   * Get available providers
   */
  getAvailableProvidersList(): AIProviderType[] {
    return this.getAvailableProviders();
  }

  /**
   * Get provider instance
   */
  getProvider(providerType: AIProviderType): AIProvider | undefined {
    return this.providers.get(providerType);
  }

  /**
   * Manually mark a provider as unhealthy
   */
  markProviderUnhealthy(providerType: AIProviderType, reason: string): void {
    const status = this.healthStatus.get(providerType);
    if (status) {
      status.healthy = false;
      status.lastError = reason;
      status.consecutiveFailures++;

      this.emitEvent({
        type: 'provider_unhealthy',
        timestamp: new Date(),
        provider: providerType,
        reason,
      });
    }
  }

  /**
   * Reset provider health status
   */
  resetProviderHealth(providerType: AIProviderType): void {
    const status = this.healthStatus.get(providerType);
    if (status) {
      status.healthy = true;
      status.consecutiveFailures = 0;
      delete status.lastError;
    }
  }

  /**
   * Update quota for a provider
   */
  updateQuota(providerType: AIProviderType, used: number): void {
    const config = this.providerConfigs.get(providerType);
    if (config) {
      config.quotaUsed = used;

      const status = this.healthStatus.get(providerType);
      if (status && config.quotaLimit) {
        status.quotaRemaining = Math.max(0, config.quotaLimit - used);
      }
    }
  }

  /**
   * Reset quota for a provider
   */
  resetQuota(providerType: AIProviderType): void {
    const config = this.providerConfigs.get(providerType);
    if (config) {
      config.quotaUsed = 0;

      const status = this.healthStatus.get(providerType);
      if (status && config.quotaLimit) {
        status.quotaRemaining = config.quotaLimit;
      }

      this.emitEvent({
        type: 'quota_reset',
        timestamp: new Date(),
        provider: providerType,
      });
    }
  }

  /**
   * Add a provider dynamically
   */
  async addProvider(config: ProviderConfig): Promise<void> {
    if (!config.enabled) return;

    const provider = this.createProvider(config);
    if (provider) {
      this.providers.set(config.type, provider);
      this.providerConfigs.set(config.type, config);

      this.healthStatus.set(config.type, {
        provider: config.type,
        healthy: true,
        lastChecked: new Date(),
        consecutiveFailures: 0,
        avgLatencyMs: 0,
      });

      // Check health immediately
      const healthy = await provider.healthCheck();
      const status = this.healthStatus.get(config.type);
      if (status) {
        status.healthy = healthy;
      }
    }
  }

  /**
   * Remove a provider
   */
  removeProvider(providerType: AIProviderType): void {
    this.providers.delete(providerType);
    this.providerConfigs.delete(providerType);
    this.healthStatus.delete(providerType);
  }

  /**
   * Shutdown the pool
   */
  shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.isRunning = false;
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalProviders: number;
    healthyProviders: number;
    totalExecutions: number;
    successRate: number;
    averageLatency: number;
  } {
    const totalProviders = this.providers.size;
    const healthyProviders = Array.from(this.healthStatus.values()).filter(s => s.healthy).length;
    const totalExecutions = this.executionLogs.length;
    const successfulExecutions = this.executionLogs.filter(l => l.success).length;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;
    const averageLatency = this.executionLogs.length > 0
      ? this.executionLogs.reduce((sum, l) => sum + l.latencyMs, 0) / this.executionLogs.length
      : 0;

    return {
      totalProviders,
      healthyProviders,
      totalExecutions,
      successRate,
      averageLatency,
    };
  }
}

/**
 * Create a default AI pool manager
 */
export function createAIPoolManager(config?: Partial<PoolConfig>): AIPoolManager {
  return new AIPoolManager(config);
}

/**
 * Default pool configuration with all providers enabled
 */
export const DEFAULT_PROVIDERS_CONFIG: ProviderConfig[] = [
  {
    type: 'openai',
    enabled: true,
    priority: 1,
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 60000,
  },
  {
    type: 'anthropic',
    enabled: true,
    priority: 2,
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 60000,
  },
  {
    type: 'gemini',
    enabled: true,
    priority: 3,
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 60000,
  },
];

export default AIPoolManager;
