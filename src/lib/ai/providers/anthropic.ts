/**
 * Anthropic Provider - SaaSWPP AI Platform
 * Implementation of AIProvider interface for Anthropic Claude models
 */

import ZAI from 'z-ai-web-dev-sdk';
import type {
  AIProvider,
  AIProviderType,
  AIModel,
  ChatMessage,
  CompletionOptions,
  CompletionResult,
  StreamingOptions,
  StreamingResult,
  TokenUsage,
} from '../types';
import {
  AIProviderError,
  AIRateLimitError,
  AITimeoutError,
  AIModelNotFoundError,
} from '../types';

// Model definitions
const MODELS: AIModel[] = [
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
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet (Legacy)',
    provider: 'anthropic',
    contextWindow: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    maxOutputTokens: 4096,
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
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
];

export interface AnthropicProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Anthropic Provider Implementation
 * Uses z-ai-web-dev-sdk for API calls with Anthropic-specific message format
 */
export class AnthropicProvider implements AIProvider {
  readonly name: AIProviderType = 'anthropic';
  readonly models: AIModel[] = MODELS;
  
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
  private config: AnthropicProviderConfig;
  private initialized = false;

  constructor(config: AnthropicProviderConfig = {}) {
    this.config = {
      defaultModel: 'claude-3-haiku-20240307',
      timeout: 60000,
      maxRetries: 3,
      ...config,
    };
  }

  /**
   * Initialize the SDK instance
   */
  private async initialize(): Promise<void> {
    if (this.initialized && this.zai) return;
    
    try {
      this.zai = await ZAI.create();
      this.initialized = true;
    } catch (error) {
      throw new AIProviderError(
        'Failed to initialize Anthropic provider',
        'anthropic',
        'INIT_FAILED',
        false,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Check if the provider is properly configured
   */
  get isConfigured(): boolean {
    return true;
  }

  /**
   * Perform a health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      const result = await this.createCompletion(
        [{ role: 'user', content: 'ping' }],
        { maxTokens: 5, timeout: 5000 }
      );
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get all available models
   */
  getModels(): AIModel[] {
    return this.models;
  }

  /**
   * Get a specific model by ID
   */
  getModel(modelId: string): AIModel | undefined {
    return this.models.find(m => m.id === modelId);
  }

  /**
   * Convert messages to Anthropic format
   * Anthropic uses a different message format than OpenAI
   */
  private convertMessages(messages: ChatMessage[]): {
    system?: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  } {
    const result: {
      system?: string;
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    } = {
      messages: [],
    };

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Anthropic handles system messages separately
        result.system = result.system 
          ? `${result.system}\n\n${msg.content}` 
          : msg.content;
      } else if (msg.role === 'user' || msg.role === 'assistant') {
        result.messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
      // Note: Anthropic doesn't support 'function' or 'tool' roles the same way
    }

    return result;
  }

  /**
   * Create a chat completion
   */
  async createCompletion(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    await this.initialize();
    
    const modelId = options.model || this.config.defaultModel || 'claude-3-haiku-20240307';
    const model = this.getModel(modelId);
    
    if (!model) {
      throw new AIModelNotFoundError('anthropic', modelId);
    }

    const startTime = Date.now();

    try {
      // Convert messages to Anthropic format
      const { system, messages: convertedMessages } = this.convertMessages(messages);

      // Use SDK - note: the SDK may need to be configured for Anthropic
      // For now, we use the SDK's chat completions which abstract the provider
      const completion = await this.zai!.chat.completions.create({
        messages: convertedMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        model: modelId,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? model.maxOutputTokens,
        top_p: options.topP,
        stop: options.stop,
        ...(system && { system }),
      });

      const choice = completion.choices[0];
      const content = choice?.message?.content || '';
      const usage: TokenUsage = {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      };

      const latencyMs = Date.now() - startTime;
      const cost = this.calculateCost(usage, modelId);

      // Determine finish reason
      let finishReason: CompletionResult['finishReason'] = 'unknown';
      if (choice?.finish_reason === 'stop') finishReason = 'stop';
      else if (choice?.finish_reason === 'length') finishReason = 'length';
      else if (choice?.finish_reason === 'function_call') finishReason = 'function_call';
      else if (choice?.finish_reason === 'content_filter') finishReason = 'content_filter';

      return {
        success: true,
        content,
        model: modelId,
        provider: 'anthropic',
        usage,
        cost,
        latencyMs,
        finishReason,
        metadata: {
          id: completion.id,
          created: completion.created,
        },
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for specific error types
      if (errorMessage.includes('rate limit') || errorMessage.includes('429') || 
          errorMessage.includes('overloaded')) {
        throw new AIRateLimitError('anthropic', 60000);
      }
      
      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        throw new AITimeoutError('anthropic', options.timeout || this.config.timeout || 60000);
      }

      throw new AIProviderError(
        errorMessage,
        'anthropic',
        'COMPLETION_FAILED',
        true,
        error instanceof Error ? error : new Error(errorMessage)
      );
    }
  }

  /**
   * Create a streaming chat completion
   */
  async createStreamingCompletion(
    messages: ChatMessage[],
    options: StreamingOptions = {}
  ): Promise<StreamingResult> {
    await this.initialize();
    
    const modelId = options.model || this.config.defaultModel || 'claude-3-haiku-20240307';
    const model = this.getModel(modelId);
    
    if (!model) {
      throw new AIModelNotFoundError('anthropic', modelId);
    }

    const { system, messages: convertedMessages } = this.convertMessages(messages);

    let aborted = false;
    let fullContent = '';

    const stream = this.zai!.chat.completions.create({
      messages: convertedMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      model: modelId,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? model.maxOutputTokens,
      top_p: options.topP,
      stop: options.stop,
      stream: true,
      ...(system && { system }),
    });

    const asyncIterable: AsyncIterable<string> = {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            if (aborted) {
              return { done: true, value: undefined };
            }

            const result = await stream;
            fullContent = result.choices[0]?.message?.content || '';
            
            if (options.onComplete) {
              options.onComplete(fullContent);
            }
            
            return { done: true, value: fullContent };
          },
        };
      },
    };

    return {
      success: true,
      stream: asyncIterable,
      model: modelId,
      provider: 'anthropic',
      abort: () => {
        aborted = true;
      },
    };
  }

  /**
   * Count tokens for a given text
   * Uses approximation based on Claude tokenization
   */
  countTokens(text: string): number {
    // Claude uses similar tokenization to GPT but slightly more efficient
    // Approximation: ~3.5 characters per token
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    return Math.ceil((charCount / 3.5 + wordCount) / 2);
  }

  /**
   * Calculate cost for a given token usage
   */
  calculateCost(usage: TokenUsage, modelId: string): number {
    const model = this.getModel(modelId);
    if (!model) return 0;

    const inputCost = (usage.promptTokens / 1000) * model.inputCostPer1k;
    const outputCost = (usage.completionTokens / 1000) * model.outputCostPer1k;
    
    return Number((inputCost + outputCost).toFixed(6));
  }
}

/**
 * Factory function to create Anthropic provider
 */
export function createAnthropicProvider(config?: AnthropicProviderConfig): AnthropicProvider {
  return new AnthropicProvider(config);
}

export default AnthropicProvider;
