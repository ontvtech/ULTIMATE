/**
 * Meta Cloud API Provider Implementation
 * SaaSWPP AI Platform - WhatsApp Business API via Meta
 */

import type {
  WhatsAppProvider,
  WhatsAppProviderType,
  MetaProviderConfig,
  WhatsAppMessage,
  SendMessageResponse,
  QRCodeResponse,
  ConnectionStatusResponse,
  ConnectionStatus,
  WhatsAppError,
  TemplateComponent,
  WebhookPayload,
  ParsedWebhookData,
  MessageWebhookData,
  StatusWebhookData,
  MessageContent,
  META_RATE_LIMITS,
} from './types';

// ============================================
// CONSTANTS
// ============================================

const META_API_BASE_URL = 'https://graph.facebook.com';
const DEFAULT_API_VERSION = 'v18.0';

// ============================================
// ERROR CLASS
// ============================================

export class MetaWhatsAppError extends Error {
  code: number;
  type?: string;
  details?: Record<string, unknown>;

  constructor(error: WhatsAppError) {
    super(error.message);
    this.name = 'MetaWhatsAppError';
    this.code = error.code;
    this.type = error.type;
    this.details = error.details;
  }
}

// ============================================
// META PROVIDER CLASS
// ============================================

export class MetaWhatsAppProvider implements WhatsAppProvider {
  readonly providerType: WhatsAppProviderType = 'META';
  
  private accessToken: string;
  private phoneNumberId: string;
  private wabaId: string;
  private apiVersion: string;
  private baseUrl: string;

  constructor(config: MetaProviderConfig) {
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;
    this.wabaId = config.wabaId;
    this.apiVersion = config.apiVersion || DEFAULT_API_VERSION;
    this.baseUrl = config.baseUrl || META_API_BASE_URL;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private getApiUrl(endpoint: string): string {
    return `${this.baseUrl}/${this.apiVersion}/${endpoint}`;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<{ data?: T; error?: WhatsAppError }> {
    try {
      const url = this.getApiUrl(endpoint);
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const responseData = await response.json() as Record<string, unknown>;

      if (!response.ok) {
        const errorData = responseData.error as Record<string, unknown> | undefined;
        const error: WhatsAppError = {
          code: errorData?.code as number || response.status,
          message: (errorData?.message as string) || `HTTP Error: ${response.status}`,
          type: errorData?.type as string | undefined,
          details: errorData?.error_data as Record<string, unknown> | undefined,
        };
        return { error };
      }

      return { data: responseData as T };
    } catch (error) {
      const whatsappError: WhatsAppError = {
        code: 500,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'NETWORK_ERROR',
      };
      return { error: whatsappError };
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-numeric characters and ensure proper format
    let formatted = phone.replace(/\D/g, '');
    // Ensure it starts with country code (no leading + or 00)
    if (formatted.startsWith('00')) {
      formatted = formatted.substring(2);
    }
    return formatted;
  }

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  async connect(): Promise<ConnectionStatusResponse> {
    // For Meta API, we verify the phone number and WABA ID
    const response = await this.request<{ id: string; name?: string }>(
      this.phoneNumberId
    );

    if (response.error) {
      return {
        success: false,
        status: 'ERROR',
        error: response.error,
      };
    }

    return {
      success: true,
      status: 'CONNECTED',
      phoneNumberId: this.phoneNumberId,
      wabaId: this.wabaId,
    };
  }

  async disconnect(): Promise<{ success: boolean; error?: WhatsAppError }> {
    // Meta Cloud API doesn't require explicit disconnection
    // The connection is stateless and token-based
    return { success: true };
  }

  async getConnectionStatus(): Promise<ConnectionStatusResponse> {
    // Check phone number status
    const response = await this.request<{
      id: string;
      display_phone_number?: string;
      verified_name?: string;
      quality_rating?: string;
      messaging_tier?: string;
    }>(this.phoneNumberId);

    if (response.error) {
      return {
        success: false,
        status: 'ERROR',
        error: response.error,
      };
    }

    if (response.data) {
      return {
        success: true,
        status: 'CONNECTED',
        phoneNumber: response.data.display_phone_number,
        phoneNumberId: response.data.id,
        wabaId: this.wabaId,
      };
    }

    return {
      success: false,
      status: 'DISCONNECTED',
    };
  }

  async getQRCode(): Promise<QRCodeResponse> {
    // Meta doesn't use QR codes for connection
    // Phone numbers are pre-configured in the Business Manager
    return {
      success: false,
      status: 'CONNECTED',
      error: {
        code: 400,
        message: 'QR code is not applicable for Meta Cloud API. Phone numbers are configured in WhatsApp Business Manager.',
        type: 'NOT_APPLICABLE',
      },
    };
  }

  // ============================================
  // MESSAGE SENDING
  // ============================================

  async sendMessage(message: WhatsAppMessage): Promise<SendMessageResponse> {
    const endpoint = `${this.phoneNumberId}/messages`;
    
    // Format the recipient phone number
    const formattedMessage = {
      ...message,
      messaging_product: 'whatsapp',
      to: this.formatPhoneNumber(message.to),
    };

    const response = await this.request<{ 
      messages: Array<{ id: string }>;
      messaging_product: string;
      contacts: Array<{ input: string; wa_id: string }>;
    }>(endpoint, 'POST', formattedMessage);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
    };
  }

  async sendTextMessage(to: string, text: string): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      type: 'TEXT',
      text: {
        body: text,
      },
    });
  }

  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      type: 'IMAGE',
      image: {
        link: imageUrl,
        caption,
      },
    });
  }

  async sendDocumentMessage(
    to: string,
    documentUrl: string,
    filename?: string,
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      type: 'DOCUMENT',
      document: {
        link: documentUrl,
        filename,
        caption,
      },
    });
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string,
    components?: TemplateComponent[]
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      type: 'TEMPLATE',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components,
      },
    });
  }

  async sendInteractiveMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    header?: { type: 'text'; text: string },
    footerText?: string
  ): Promise<SendMessageResponse> {
    const interactiveMessage: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'INTERACTIVE',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply' as const,
            reply: {
              id: b.id,
              title: b.title,
            },
          })),
        },
      },
    };

    if (header) {
      interactiveMessage.interactive.header = header;
    }

    if (footerText) {
      interactiveMessage.interactive.footer = { text: footerText };
    }

    return this.sendMessage(interactiveMessage);
  }

  async sendListMessage(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    headerText?: string,
    footerText?: string
  ): Promise<SendMessageResponse> {
    const interactiveMessage: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'INTERACTIVE',
      interactive: {
        type: 'list',
        header: headerText ? { type: 'text', text: headerText } : undefined,
        body: { text: bodyText },
        footer: footerText ? { text: footerText } : undefined,
        action: {
          button: buttonText,
          sections: sections.map(s => ({
            title: s.title,
            rows: s.rows.map(r => ({
              id: r.id,
              title: r.title,
              description: r.description,
            })),
          })),
        },
      },
    };

    return this.sendMessage(interactiveMessage);
  }

  // ============================================
  // MESSAGE MANAGEMENT
  // ============================================

  async markAsRead(messageId: string): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `${this.phoneNumberId}/messages`;
    
    const response = await this.request<{ success: boolean }>(endpoint, 'POST', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });

    return {
      success: !response.error,
      error: response.error,
    };
  }

  // ============================================
  // WEBHOOK HANDLING
  // ============================================

  async parseWebhook(payload: Record<string, unknown>): Promise<WebhookPayload> {
    const result: WebhookPayload = {
      provider: 'META',
      rawPayload: payload,
    };

    try {
      const entry = (payload.entry as Array<Record<string, unknown>>)?.[0];
      const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
      const value = changes?.value as Record<string, unknown> | undefined;

      if (!value) {
        return result;
      }

      // Handle messages
      const messages = value.messages as Array<Record<string, unknown>> | undefined;
      if (messages && messages.length > 0) {
        const message = messages[0];
        result.parsedData = this.parseMessageWebhook(message, value);
      }

      // Handle status updates
      const statuses = value.statuses as Array<Record<string, unknown>> | undefined;
      if (statuses && statuses.length > 0) {
        const status = statuses[0];
        result.parsedData = this.parseStatusWebhook(status);
      }

    } catch (error) {
      console.error('Error parsing Meta webhook:', error);
    }

    return result;
  }

  private parseMessageWebhook(
    message: Record<string, unknown>,
    value: Record<string, unknown>
  ): ParsedWebhookData {
    const contacts = (value.contacts as Array<Record<string, unknown>>) || [];
    const contact = contacts[0] || {};

    const messageType = (message.type as string) || 'TEXT';
    const timestamp = new Date(parseInt(message.timestamp as string) * 1000);

    const messageData: MessageWebhookData = {
      messageId: message.id as string,
      from: this.formatPhoneNumber(message.from as string),
      to: this.phoneNumberId,
      timestamp,
      type: messageType as MessageWebhookData['type'],
      content: this.parseMessageContent(message),
      context: message.context ? {
        messageId: (message.context as Record<string, unknown>).id as string,
        from: (message.context as Record<string, unknown>).from as string,
      } : undefined,
    };

    // Add location if present
    if (message.location) {
      const loc = message.location as Record<string, unknown>;
      messageData.location = {
        latitude: loc.latitude as number,
        longitude: loc.longitude as number,
        name: loc.name as string,
        address: loc.address as string,
      };
    }

    // Add contacts if present
    if (contact.profile) {
      const profile = contact.profile as Record<string, unknown>;
      messageData.contacts = [{
        name: {
          formatted_name: profile.name as string || '',
        },
      }];
    }

    return {
      type: 'message',
      timestamp,
      data: messageData,
    };
  }

  private parseMessageContent(message: Record<string, unknown>): MessageContent {
    const content: MessageContent = {};
    const type = message.type as string;

    switch (type) {
      case 'text':
        content.text = (message.text as Record<string, unknown>)?.body as string;
        break;
      case 'image':
        content.image = {
          id: (message.image as Record<string, unknown>).id as string,
          mime_type: (message.image as Record<string, unknown>).mime_type as string,
          sha256: (message.image as Record<string, unknown>).sha256 as string,
          caption: (message.image as Record<string, unknown>).caption as string,
        };
        break;
      case 'document':
        content.document = {
          id: (message.document as Record<string, unknown>).id as string,
          mime_type: (message.document as Record<string, unknown>).mime_type as string,
          sha256: (message.document as Record<string, unknown>).sha256 as string,
          filename: (message.document as Record<string, unknown>).filename as string,
          caption: (message.document as Record<string, unknown>).caption as string,
        };
        break;
      case 'audio':
        content.audio = {
          id: (message.audio as Record<string, unknown>).id as string,
          mime_type: (message.audio as Record<string, unknown>).mime_type as string,
          sha256: (message.audio as Record<string, unknown>).sha256 as string,
        };
        break;
      case 'video':
        content.video = {
          id: (message.video as Record<string, unknown>).id as string,
          mime_type: (message.video as Record<string, unknown>).mime_type as string,
          sha256: (message.video as Record<string, unknown>).sha256 as string,
          caption: (message.video as Record<string, unknown>).caption as string,
        };
        break;
      case 'interactive':
        content.interactive = {
          type: (message.interactive as Record<string, unknown>).type as string,
          button_reply: (message.interactive as Record<string, unknown>).button_reply as MessageContent['interactive'] extends { button_reply?: infer T } ? T : never,
          list_reply: (message.interactive as Record<string, unknown>).list_reply as MessageContent['interactive'] extends { list_reply?: infer T } ? T : never,
        };
        break;
      case 'location':
        const loc = message.location as Record<string, unknown>;
        content.location = {
          latitude: loc.latitude as number,
          longitude: loc.longitude as number,
          name: loc.name as string,
          address: loc.address as string,
        };
        break;
    }

    return content;
  }

  private parseStatusWebhook(status: Record<string, unknown>): ParsedWebhookData {
    const statusData: StatusWebhookData = {
      messageId: status.id as string,
      recipientId: status.recipient_id as string,
      status: status.status as StatusWebhookData['status'],
      timestamp: new Date(parseInt(status.timestamp as string) * 1000),
      conversationId: status.conversation?.id as string,
      pricing: status.pricing ? {
        billable: (status.pricing as Record<string, unknown>).billable as boolean,
        pricing_model: (status.pricing as Record<string, unknown>).pricing_model as string,
        category: (status.pricing as Record<string, unknown>).category as string,
      } : undefined,
      error: status.errors ? {
        code: ((status.errors as Array<Record<string, unknown>>)[0]).code as number,
        message: ((status.errors as Array<Record<string, unknown>>)[0]).message as string,
      } : undefined,
    };

    return {
      type: 'status',
      timestamp: statusData.timestamp,
      data: statusData,
    };
  }

  // ============================================
  // TEMPLATE MANAGEMENT
  // ============================================

  async getTemplates(): Promise<{ 
    success: boolean; 
    templates?: Array<{
      name: string;
      status: string;
      category: string;
      language: string;
    }>;
    error?: WhatsAppError;
  }> {
    const endpoint = `${this.wabaId}/message_templates`;
    const response = await this.request<{
      data: Array<{
        name: string;
        status: string;
        category: string;
        language: string;
      }>;
    }>(endpoint);

    return {
      success: !response.error,
      templates: response.data?.data,
      error: response.error,
    };
  }

  // ============================================
  // MEDIA MANAGEMENT
  // ============================================

  async getMediaUrl(mediaId: string): Promise<{ 
    success: boolean; 
    url?: string;
    mime_type?: string;
    error?: WhatsAppError;
  }> {
    const response = await this.request<{
      url: string;
      mime_type: string;
    }>(mediaId);

    return {
      success: !response.error,
      url: response.data?.url,
      mime_type: response.data?.mime_type,
      error: response.error,
    };
  }

  async downloadMedia(mediaUrl: string): Promise<{ 
    success: boolean; 
    data?: Buffer;
    error?: WhatsAppError;
  }> {
    try {
      const response = await fetch(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status,
            message: `Failed to download media: ${response.statusText}`,
          },
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      return {
        success: true,
        data: Buffer.from(arrayBuffer),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error downloading media',
        },
      };
    }
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: WhatsAppError }> {
    const startTime = Date.now();
    
    const response = await this.getConnectionStatus();
    
    const latency = Date.now() - startTime;

    return {
      healthy: response.success && response.status === 'CONNECTED',
      latency,
      error: response.error,
    };
  }

  // ============================================
  // PHONE NUMBER VALIDATION
  // ============================================

  async validatePhoneNumber(phone: string): Promise<{ 
    valid: boolean; 
    status?: string;
    error?: WhatsAppError;
  }> {
    const endpoint = `${this.phoneNumberId}/phone_numbers`;
    const response = await this.request<{
      data: Array<{
        id: string;
        display_phone_number: string;
        quality_rating: string;
        verified_name: string;
      }>;
    }>(endpoint);

    if (response.error) {
      return {
        valid: false,
        error: response.error,
      };
    }

    const formatted = this.formatPhoneNumber(phone);
    const found = response.data?.data?.find(
      p => this.formatPhoneNumber(p.display_phone_number) === formatted
    );

    return {
      valid: !!found,
      status: found?.quality_rating,
    };
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createMetaProvider(config: MetaProviderConfig): MetaWhatsAppProvider {
  return new MetaWhatsAppProvider(config);
}
