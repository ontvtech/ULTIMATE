/**
 * OpenAI Provider - SaaSWPP AI Platform
 * Implementation of AIProvider interface for OpenAI GPT models
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
  OPENAI_MODELS,
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
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    contextWindow: 8192,
    inputCostPer1k: 0.03,
    outputCostPer1k: 0.06,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
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

export interface OpenAIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * OpenAI Provider Implementation
 * Uses z-ai-web-dev-sdk for API calls
 */
export class OpenAIProvider implements AIProvider {
  readonly name: AIProviderType = 'openai';
  readonly models: AIModel[] = MODELS;
  
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
  private config: OpenAIProviderConfig;
  private initialized = false;

  constructor(config: OpenAIProviderConfig = {}) {
    this.config = {
      defaultModel: 'gpt-4o-mini',
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
        'Failed to initialize OpenAI provider',
        'openai',
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
    // z-ai-web-dev-sdk handles API keys internally
    return true;
  }

  /**
   * Perform a health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      // Try a minimal completion to check health
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
   * Create a chat completion
   */
  async createCompletion(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    await this.initialize();
    
    const modelId = options.model || this.config.defaultModel || 'gpt-4o-mini';
    const model = this.getModel(modelId);
    
    if (!model) {
      throw new AIModelNotFoundError('openai', modelId);
    }

    const startTime = Date.now();

    try {
      // Convert messages to SDK format
      const sdkMessages = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));

      const completion = await this.zai!.chat.completions.create({
        messages: sdkMessages,
        model: modelId,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? model.maxOutputTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stop: options.stop,
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
        provider: 'openai',
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
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        throw new AIRateLimitError('openai', 60000); // Default 60s retry
      }
      
      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        throw new AITimeoutError('openai', options.timeout || this.config.timeout || 60000);
      }

      throw new AIProviderError(
        errorMessage,
        'openai',
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
    options: Partial<StreamingOptions> = {}
  ): Promise<StreamingResult> {
    await this.initialize();
    
    const modelId = options.model || this.config.defaultModel || 'gpt-4o-mini';
    const model = this.getModel(modelId);
    
    if (!model) {
      throw new AIModelNotFoundError('openai', modelId);
    }

    // Convert messages to SDK format
    const sdkMessages = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));

    let aborted = false;
    let fullContent = '';

    const stream = this.zai!.chat.completions.create({
      messages: sdkMessages,
      model: modelId,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? model.maxOutputTokens,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stop: options.stop,
      stream: true,
    });

    const asyncIterable: AsyncIterable<string> = {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            if (aborted) {
              return { done: true, value: undefined };
            }

            // We need to handle the streaming differently
            // For now, return the full content
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
      provider: 'openai',
      abort: () => {
        aborted = true;
      },
    };
  }

  /**
   * Count tokens for a given text
   * Uses a simple approximation (GPT tokenization is more complex)
   */
  countTokens(text: string): number {
    // GPT models use ~4 characters per token on average
    // This is an approximation - for precise counting, use tiktoken
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    // Use a hybrid approach for better accuracy
    return Math.ceil((charCount / 4 + wordCount) / 2);
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

  /**
   * Convert messages to OpenAI format
   */
  private convertMessages(messages: ChatMessage[]): Array<{
    role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
    content: string;
    name?: string;
  }> {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      ...(msg.name && { name: msg.name }),
    }));
  }
}

/**
 * Factory function to create OpenAI provider
 */
export function createOpenAIProvider(config?: OpenAIProviderConfig): OpenAIProvider {
  return new OpenAIProvider(config);
}

export default OpenAIProvider;
