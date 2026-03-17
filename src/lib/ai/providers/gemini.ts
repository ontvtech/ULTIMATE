/**
 * Google Gemini Provider - SaaSWPP AI Platform
 * Implementation of AIProvider interface for Google Gemini models
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
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    contextWindow: 1000000, // 1M tokens context window
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
    contextWindow: 1000000, // 1M tokens context window
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'gemini',
    contextWindow: 1000000,
    inputCostPer1k: 0.0000375,
    outputCostPer1k: 0.00015,
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
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    contextWindow: 1048576,
    inputCostPer1k: 0.0001,
    outputCostPer1k: 0.0004,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
];

// Safety settings for Gemini
export interface GeminiSafetySetting {
  category: string;
  threshold: string;
}

export const DEFAULT_SAFETY_SETTINGS: GeminiSafetySetting[] = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

export interface GeminiProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  safetySettings?: GeminiSafetySetting[];
}

/**
 * Google Gemini Provider Implementation
 * Uses z-ai-web-dev-sdk for API calls with Gemini-specific configurations
 */
export class GeminiProvider implements AIProvider {
  readonly name: AIProviderType = 'gemini';
  readonly models: AIModel[] = MODELS;
  
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
  private config: GeminiProviderConfig;
  private initialized = false;
  private safetySettings: GeminiSafetySetting[];

  constructor(config: GeminiProviderConfig = {}) {
    this.config = {
      defaultModel: 'gemini-1.5-flash',
      timeout: 60000,
      maxRetries: 3,
      ...config,
    };
    this.safetySettings = config.safetySettings || DEFAULT_SAFETY_SETTINGS;
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
        'Failed to initialize Gemini provider',
        'gemini',
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
   * Convert messages to Gemini format
   * Gemini uses a slightly different format than OpenAI
   */
  private convertMessages(messages: ChatMessage[]): Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }> {
    // Gemini handles messages similarly to OpenAI
    // but may combine system messages differently
    const converted: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    
    // Collect system messages
    const systemParts: string[] = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemParts.push(msg.content);
      } else if (msg.role === 'user' || msg.role === 'assistant') {
        converted.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Prepend system messages as a user message if present
    // (Gemini doesn't have a native system role in the same way)
    if (systemParts.length > 0) {
      converted.unshift({
        role: 'system',
        content: `System Instructions: ${systemParts.join('\n\n')}`,
      });
    }

    return converted;
  }

  /**
   * Parse Gemini response
   */
  private parseResponse(response: unknown): {
    content: string;
    finishReason: string;
    usage?: TokenUsage;
  } {
    // Handle SDK response format
    const resp = response as {
      choices?: Array<{
        message?: { content?: string };
        finish_reason?: string;
      }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };

    const choice = resp.choices?.[0];
    const content = choice?.message?.content || '';
    const finishReason = choice?.finish_reason || 'stop';
    const usage: TokenUsage | undefined = resp.usage ? {
      promptTokens: resp.usage.prompt_tokens || 0,
      completionTokens: resp.usage.completion_tokens || 0,
      totalTokens: resp.usage.total_tokens || 0,
    } : undefined;

    return { content, finishReason, usage };
  }

  /**
   * Create a chat completion
   */
  async createCompletion(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    await this.initialize();
    
    const modelId = options.model || this.config.defaultModel || 'gemini-1.5-flash';
    const model = this.getModel(modelId);
    
    if (!model) {
      throw new AIModelNotFoundError('gemini', modelId);
    }

    const startTime = Date.now();

    try {
      // Convert messages
      const convertedMessages = this.convertMessages(messages);

      const completion = await this.zai!.chat.completions.create({
        messages: convertedMessages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
        model: modelId,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? model.maxOutputTokens,
        top_p: options.topP,
        stop: options.stop,
      });

      const { content, finishReason: rawFinishReason, usage } = this.parseResponse(completion);

      const finalUsage: TokenUsage = usage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };

      const latencyMs = Date.now() - startTime;
      const cost = this.calculateCost(finalUsage, modelId);

      // Map finish reason
      let finishReason: CompletionResult['finishReason'] = 'unknown';
      if (rawFinishReason === 'stop') finishReason = 'stop';
      else if (rawFinishReason === 'length') finishReason = 'length';
      else if (rawFinishReason === 'SAFETY') finishReason = 'content_filter';

      return {
        success: true,
        content,
        model: modelId,
        provider: 'gemini',
        usage: finalUsage,
        cost,
        latencyMs,
        finishReason,
        metadata: {
          safetySettings: this.safetySettings,
        },
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for specific error types
      if (errorMessage.includes('rate limit') || errorMessage.includes('429') ||
          errorMessage.includes('RESOURCE_EXHAUSTED')) {
        throw new AIRateLimitError('gemini', 60000);
      }
      
      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        throw new AITimeoutError('gemini', options.timeout || this.config.timeout || 60000);
      }

      // Check for safety-related blocks
      if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
        throw new AIProviderError(
          'Content blocked by Gemini safety filters',
          'gemini',
          'CONTENT_FILTERED',
          false,
          error instanceof Error ? error : new Error(errorMessage)
        );
      }

      throw new AIProviderError(
        errorMessage,
        'gemini',
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
    
    const modelId = options.model || this.config.defaultModel || 'gemini-1.5-flash';
    const model = this.getModel(modelId);
    
    if (!model) {
      throw new AIModelNotFoundError('gemini', modelId);
    }

    const convertedMessages = this.convertMessages(messages);

    let aborted = false;
    let fullContent = '';

    const stream = this.zai!.chat.completions.create({
      messages: convertedMessages.map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
      model: modelId,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? model.maxOutputTokens,
      top_p: options.topP,
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

            const result = await stream;
            fullContent = result.choices?.[0]?.message?.content || '';
            
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
      provider: 'gemini',
      abort: () => {
        aborted = true;
      },
    };
  }

  /**
   * Count tokens for a given text
   * Uses approximation based on Gemini tokenization
   */
  countTokens(text: string): number {
    // Gemini uses a similar tokenization approach
    // Approximation: ~4 characters per token
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
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
   * Update safety settings
   */
  setSafetySettings(settings: GeminiSafetySetting[]): void {
    this.safetySettings = settings;
  }

  /**
   * Get current safety settings
   */
  getSafetySettings(): GeminiSafetySetting[] {
    return this.safetySettings;
  }
}

/**
 * Factory function to create Gemini provider
 */
export function createGeminiProvider(config?: GeminiProviderConfig): GeminiProvider {
  return new GeminiProvider(config);
}

export default GeminiProvider;
