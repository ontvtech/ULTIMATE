/**
 * Evolution API Provider Implementation
 * SaaSWPP AI Platform - WhatsApp via Evolution API
 */

import type {
  WhatsAppProvider,
  WhatsAppProviderType,
  EvolutionProviderConfig,
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
} from './types';

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_EVOLUTION_URL = 'http://localhost:8080';

// ============================================
// ERROR CLASS
// ============================================

export class EvolutionWhatsAppError extends Error {
  code: number;
  type?: string;
  details?: Record<string, unknown>;

  constructor(error: WhatsAppError) {
    super(error.message);
    this.name = 'EvolutionWhatsAppError';
    this.code = error.code;
    this.type = error.type;
    this.details = error.details;
  }
}

// ============================================
// EVOLUTION PROVIDER CLASS
// ============================================

export class EvolutionWhatsAppProvider implements WhatsAppProvider {
  readonly providerType: WhatsAppProviderType = 'EVOLUTION';
  
  private baseUrl: string;
  private apiKey: string;
  private instanceName: string;
  private instanceId?: string;
  private webhookUrl?: string;

  constructor(config: EvolutionProviderConfig) {
    this.baseUrl = config.baseUrl || DEFAULT_EVOLUTION_URL;
    this.apiKey = config.apiKey;
    this.instanceName = config.instanceName;
    this.instanceId = config.instanceId;
    this.webhookUrl = config.webhookUrl;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private getApiUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<{ data?: T; error?: WhatsAppError }> {
    try {
      const url = this.getApiUrl(endpoint);
      const headers: Record<string, string> = {
        'apikey': this.apiKey,
        'Content-Type': 'application/json',
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      
      // Handle empty responses
      let responseData: Record<string, unknown> = {};
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseData = await response.json() as Record<string, unknown>;
      }

      if (!response.ok) {
        const error: WhatsAppError = {
          code: (responseData.status as number) || response.status,
          message: (responseData.message as string) || `HTTP Error: ${response.status}`,
          type: (responseData.error as string) || 'API_ERROR',
          details: responseData,
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
    // Remove any non-numeric characters
    let formatted = phone.replace(/\D/g, '');
    // Ensure it starts with country code
    if (formatted.startsWith('00')) {
      formatted = formatted.substring(2);
    }
    return formatted;
  }

  // ============================================
  // INSTANCE MANAGEMENT
  // ============================================

  async createInstance(config?: Record<string, unknown>): Promise<{ 
    success: boolean; 
    instanceId?: string; 
    error?: WhatsAppError;
  }> {
    const endpoint = '/instance/create';
    
    const body: Record<string, unknown> = {
      instanceName: this.instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS', // Default to Baileys integration
      ...config,
    };

    if (this.webhookUrl) {
      body.webhook = this.webhookUrl;
    }

    const response = await this.request<{
      instance: {
        instanceName: string;
        status: string;
      };
      hash?: string;
    }>(endpoint, 'POST', body);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    this.instanceId = response.data?.hash;

    return {
      success: true,
      instanceId: this.instanceId,
    };
  }

  async deleteInstance(): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `/instance/delete/${this.instanceName}`;
    const response = await this.request(endpoint, 'DELETE');

    return {
      success: !response.error,
      error: response.error,
    };
  }

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  async connect(): Promise<ConnectionStatusResponse> {
    // Connect to existing instance or create new one
    const status = await this.getConnectionStatus();
    
    if (status.status === 'CONNECTED') {
      return status;
    }

    // If instance doesn't exist, create it
    if (status.status === 'DISCONNECTED' || status.error?.code === 404) {
      const createResult = await this.createInstance();
      if (!createResult.success) {
        return {
          success: false,
          status: 'ERROR',
          error: createResult.error,
        };
      }

      return {
        success: true,
        status: 'QRCODE_PENDING',
        instanceName: this.instanceName,
      };
    }

    return status;
  }

  async disconnect(): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `/instance/logout/${this.instanceName}`;
    const response = await this.request(endpoint, 'DELETE');

    return {
      success: !response.error,
      error: response.error,
    };
  }

  async getConnectionStatus(): Promise<ConnectionStatusResponse> {
    const endpoint = `/instance/connectionState/${this.instanceName}`;
    
    const response = await this.request<{
      instance: {
        state: string;
      };
    }>(endpoint);

    if (response.error) {
      return {
        success: false,
        status: 'ERROR',
        error: response.error,
      };
    }

    const state = response.data?.instance?.state?.toLowerCase();
    let status: ConnectionStatus;

    switch (state) {
      case 'open':
        status = 'CONNECTED';
        break;
      case 'connecting':
      case 'close':
        status = 'CONNECTING';
        break;
      case 'qrcode':
        status = 'QRCODE_PENDING';
        break;
      default:
        status = 'DISCONNECTED';
    }

    return {
      success: true,
      status,
      instanceName: this.instanceName,
    };
  }

  async getQRCode(): Promise<QRCodeResponse> {
    const endpoint = `/instance/qrcode/${this.instanceName}`;
    const response = await this.request<{
      qrcode: {
        code?: string;
        base64?: string;
      };
      instance: string;
    }>(endpoint);

    if (response.error) {
      return {
        success: false,
        status: 'ERROR',
        error: response.error,
      };
    }

    const qrData = response.data?.qrcode;

    return {
      success: true,
      qrCode: qrData?.code,
      qrCodeImage: qrData?.base64,
      status: 'QRCODE_PENDING',
    };
  }

  // ============================================
  // MESSAGE SENDING
  // ============================================

  async sendMessage(message: WhatsAppMessage): Promise<SendMessageResponse> {
    const endpoint = `/message/sendText/${this.instanceName}`;
    
    // Map message types to Evolution API endpoints
    const result = await this.sendMessageByType(message);
    return result;
  }

  private async sendMessageByType(message: WhatsAppMessage): Promise<SendMessageResponse> {
    const to = this.formatPhoneNumber(message.to);

    switch (message.type) {
      case 'TEXT':
        return this.sendTextMessageInternal(to, message.text.body);
      
      case 'IMAGE':
        return this.sendImageMessageInternal(
          to, 
          message.image.link || message.image.id || '',
          message.image.caption
        );
      
      case 'DOCUMENT':
        return this.sendDocumentMessageInternal(
          to,
          message.document.link || message.document.id || '',
          message.document.filename,
          message.document.caption
        );
      
      case 'AUDIO':
        return this.sendAudioMessage(to, message.audio.link || message.audio.id || '');
      
      case 'VIDEO':
        return this.sendVideoMessage(
          to, 
          message.video.link || message.video.id || '',
          message.video.caption
        );
      
      case 'TEMPLATE':
        return this.sendTemplateMessageInternal(
          to,
          message.template.name,
          message.template.language.code,
          message.template.components
        );
      
      case 'LOCATION':
        return this.sendLocationMessage(
          to,
          message.location.latitude,
          message.location.longitude,
          message.location.name,
          message.location.address
        );
      
      case 'CONTACTS':
        return this.sendContactsMessage(to, message.contacts);
      
      case 'INTERACTIVE':
        return this.sendInteractiveMessageInternal(to, message);
      
      default:
        return {
          success: false,
          error: {
            code: 400,
            message: `Unsupported message type: ${message.type}`,
            type: 'INVALID_MESSAGE_TYPE',
          },
        };
    }
  }

  async sendTextMessage(to: string, text: string): Promise<SendMessageResponse> {
    return this.sendTextMessageInternal(this.formatPhoneNumber(to), text);
  }

  private async sendTextMessageInternal(to: string, text: string): Promise<SendMessageResponse> {
    const endpoint = `/message/sendText/${this.instanceName}`;
    
    const response = await this.request<{
      key: {
        id: string;
      };
    }>(endpoint, 'POST', {
      number: to,
      options: {
        delay: 1200,
        presence: 'composing',
      },
      textMessage: {
        text: text,
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.key?.id,
    };
  }

  async sendImageMessage(
    to: string, 
    imageUrl: string, 
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendImageMessageInternal(this.formatPhoneNumber(to), imageUrl, caption);
  }

  private async sendImageMessageInternal(
    to: string, 
    imageUrl: string, 
    caption?: string
  ): Promise<SendMessageResponse> {
    const endpoint = `/message/sendMedia/${this.instanceName}`;
    
    const response = await this.request<{
      key: {
        id: string;
      };
    }>(endpoint, 'POST', {
      number: to,
      options: {
        delay: 1200,
        presence: 'composing',
      },
      mediaMessage: {
        mediatype: 'image',
        media: imageUrl,
        caption: caption || '',
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.key?.id,
    };
  }

  async sendDocumentMessage(
    to: string, 
    documentUrl: string, 
    filename?: string, 
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendDocumentMessageInternal(
      this.formatPhoneNumber(to), 
      documentUrl, 
      filename, 
      caption
    );
  }

  private async sendDocumentMessageInternal(
    to: string, 
    documentUrl: string, 
    filename?: string, 
    caption?: string
  ): Promise<SendMessageResponse> {
    const endpoint = `/message/sendMedia/${this.instanceName}`;
    
    const response = await this.request<{
      key: {
        id: string;
      };
    }>(endpoint, 'POST', {
      number: to,
      options: {
        delay: 1200,
        presence: 'composing',
      },
      mediaMessage: {
        mediatype: 'document',
        media: documentUrl,
        fileName: filename || 'document',
        caption: caption || '',
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.key?.id,
    };
  }

  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    language: string, 
    components?: TemplateComponent[]
  ): Promise<SendMessageResponse> {
    return this.sendTemplateMessageInternal(
      this.formatPhoneNumber(to), 
      templateName, 
      language, 
      components
    );
  }

  private async sendTemplateMessageInternal(
    to: string, 
    templateName: string, 
    language: string, 
    components?: TemplateComponent[]
  ): Promise<SendMessageResponse> {
    const endpoint = `/message/sendTemplate/${this.instanceName}`;
    
    // Parse template components into Evolution format
    const templateParams: Record<string, unknown> = {
      name: templateName,
      language: {
        code: language,
        policy: 'deterministic',
      },
    };

    if (components) {
      templateParams.components = components;
    }

    const response = await this.request<{
      key: {
        id: string;
      };
    }>(endpoint, 'POST', {
      number: to,
      options: {
        delay: 1200,
      },
      templateMessage: templateParams,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.key?.id,
    };
  }

  private async sendAudioMessage(to: string, audioUrl: string): Promise<SendMessageResponse> {
    const endpoint = `/message/sendMedia/${this.instanceName}`;
    
    const response = await this.request<{
      key: {
        id: string;
      };
    }>(endpoint, 'POST', {
      number: to,
      options: {
        delay: 1200,
        presence: 'recording',
      },
      mediaMessage: {
        mediatype: 'audio',
        media: audioUrl,
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.key?.id,
    };
  }

  private async sendVideoMessage(
    to: string, 
    videoUrl: string, 
    caption?: string
  ): Promise<SendMessageResponse> {
    const endpoint = `/message/sendMedia/${this.instanceName}`;
    
    const response = await this.request<{
      key: {
        id: string;
      };
    }>(endpoint, 'POST', {
      number: to,
      options: {
        delay: 1200,
        presence: 'composing',
      },
      mediaMessage: {
        mediatype: 'video',
        media: videoUrl,
        caption: caption || '',
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.key?.id,
    };
  }

  private async sendLocationMessage(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<SendMessageResponse> {
    const endpoint = `/message/sendLocation/${this.instanceName}`;
    
    const response = await this.request<{
      key: {
        id: string;
      };
    }>(endpoint, 'POST', {
      number: to,
      options: {
        delay: 1200,
      },
      locationMessage: {
        latitude,
        longitude,
        name: name || '',
        address: address || '',
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.key?.id,
    };
  }

  private async sendContactsMessage(
    to: string,
    contacts: Array<{
      name?: {
        formatted_name: string;
        first_name?: string;
        last_name?: string;
      };
      phones?: Array<{ phone: string; type?: string }>;
      emails?: Array<{ email: string; type?: string }>;
    }>
  ): Promise<SendMessageResponse> {
    const endpoint = `/message/sendContact/${this.instanceName}`;
    
    const formattedContacts = contacts.map(contact => ({
      fullName: contact.name?.formatted_name || '',
      firstName: contact.name?.first_name || '',
      lastName: contact.name?.last_name || '',
      phones: contact.phones?.map(p => ({
        phone: p.phone,
        type: p.type || 'CELL',
      })) || [],
      emails: contact.emails?.map(e => ({
        email: e.email,
        type: e.type || 'WORK',
      })) || [],
    }));

    const response = await this.request<{
      key: {
        id: string;
      };
    }>(endpoint, 'POST', {
      number: to,
      options: {
        delay: 1200,
      },
      contactMessage: formattedContacts,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.data?.key?.id,
    };
  }

  private async sendInteractiveMessageInternal(
    to: string,
    message: { type: 'INTERACTIVE'; interactive: { type: string; body: { text: string }; action?: Record<string, unknown>; header?: Record<string, unknown>; footer?: Record<string, unknown> } }
  ): Promise<SendMessageResponse> {
    const interactive = message.interactive;

    if (interactive.type === 'button' && interactive.action?.buttons) {
      const endpoint = `/message/sendButtons/${this.instanceName}`;
      
      const buttons = (interactive.action.buttons as Array<{ reply: { id: string; title: string } }>).map(b => ({
        type: 'reply',
        reply: {
          id: b.reply.id,
          title: b.reply.title,
        },
      }));

      const response = await this.request<{
        key: {
          id: string;
        };
      }>(endpoint, 'POST', {
        number: to,
        options: {
          delay: 1200,
        },
        buttonMessage: {
          text: interactive.body.text,
          buttons,
          footerText: interactive.footer?.text || '',
        },
      });

      if (response.error) {
        return {
          success: false,
          error: response.error,
        };
      }

      return {
        success: true,
        messageId: response.data?.key?.id,
      };
    }

    if (interactive.type === 'list' && interactive.action?.sections) {
      const endpoint = `/message/sendList/${this.instanceName}`;
      
      const response = await this.request<{
        key: {
          id: string;
        };
      }>(endpoint, 'POST', {
        number: to,
        options: {
          delay: 1200,
        },
        listMessage: {
          title: interactive.header?.text || '',
          description: interactive.body.text,
          footerText: interactive.footer?.text || '',
          buttonText: (interactive.action as { button?: string }).button || 'Options',
          sections: interactive.action.sections,
        },
      });

      if (response.error) {
        return {
          success: false,
          error: response.error,
        };
      }

      return {
        success: true,
        messageId: response.data?.key?.id,
      };
    }

    return {
      success: false,
      error: {
        code: 400,
        message: 'Unsupported interactive message type',
        type: 'INVALID_MESSAGE_TYPE',
      },
    };
  }

  // ============================================
  // MESSAGE MANAGEMENT
  // ============================================

  async markAsRead(messageId: string): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `/chat/readMessage/${this.instanceName}`;
    
    const response = await this.request(endpoint, 'POST', {
      read_messages: [messageId],
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
      provider: 'EVOLUTION',
      rawPayload: payload,
    };

    try {
      const event = payload.event as string;
      const data = payload.data as Record<string, unknown>;

      if (!data) {
        return result;
      }

      switch (event) {
        case 'messages.upsert':
        case 'messages.upsert.app':
          result.parsedData = this.parseMessageWebhook(data);
          break;
        case 'messages.upsert.auth':
        case 'messages.upsert.me':
          result.parsedData = this.parseMessageWebhook(data);
          break;
        case 'messages.update':
          result.parsedData = this.parseStatusWebhook(data);
          break;
        case 'connection.update':
          result.parsedData = this.parseInstanceStatusWebhook(data);
          break;
        default:
          // Try to determine type from payload structure
          if (data.key && data.message) {
            result.parsedData = this.parseMessageWebhook(data);
          } else if (data.status) {
            result.parsedData = this.parseStatusWebhook(data);
          }
      }
    } catch (error) {
      console.error('Error parsing Evolution webhook:', error);
    }

    return result;
  }

  private parseMessageWebhook(data: Record<string, unknown>): ParsedWebhookData {
    const key = data.key as Record<string, unknown> || {};
    const message = data.message as Record<string, unknown> || {};
    const pushName = data.pushName as string;
    const messageTimestamp = data.messageTimestamp as number | string;

    // Determine message type
    const messageType = Object.keys(message)[0] || 'text';
    
    let content: MessageContent = {};
    
    switch (messageType) {
      case 'conversation':
      case 'extendedTextMessage':
        content.text = message.conversation as string || 
          (message.extendedTextMessage as Record<string, unknown>)?.text as string;
        break;
      case 'imageMessage':
        const imgMsg = message.imageMessage as Record<string, unknown>;
        content.image = {
          id: (data.key as Record<string, unknown>).id as string,
          mime_type: imgMsg?.mime_type as string,
          caption: imgMsg?.caption as string,
        };
        break;
      case 'documentMessage':
        const docMsg = message.documentMessage as Record<string, unknown>;
        content.document = {
          id: (data.key as Record<string, unknown>).id as string,
          mime_type: docMsg?.mime_type as string,
          filename: docMsg?.fileName as string,
          caption: docMsg?.caption as string,
        };
        break;
      case 'audioMessage':
        const audMsg = message.audioMessage as Record<string, unknown>;
        content.audio = {
          id: (data.key as Record<string, unknown>).id as string,
          mime_type: audMsg?.mime_type as string,
        };
        break;
      case 'videoMessage':
        const vidMsg = message.videoMessage as Record<string, unknown>;
        content.video = {
          id: (data.key as Record<string, unknown>).id as string,
          mime_type: vidMsg?.mime_type as string,
          caption: vidMsg?.caption as string,
        };
        break;
      case 'locationMessage':
        const locMsg = message.locationMessage as Record<string, unknown>;
        content.location = {
          latitude: locMsg?.degreesLatitude as number,
          longitude: locMsg?.degreesLongitude as number,
          name: locMsg?.name as string,
          address: locMsg?.address as string,
        };
        break;
    }

    const messageData: MessageWebhookData = {
      messageId: key.id as string,
      from: this.formatPhoneNumber(key.remoteJid as string || ''),
      to: this.instanceName,
      timestamp: new Date(
        typeof messageTimestamp === 'string' 
          ? parseInt(messageTimestamp) * 1000 
          : messageTimestamp * 1000
      ),
      type: messageType.toUpperCase().replace('MESSAGE', '') as MessageWebhookData['type'],
      content,
      context: message.contextInfo ? {
        messageId: (message.contextInfo as Record<string, unknown>).stanzaId as string,
        from: (message.contextInfo as Record<string, unknown>).remoteJid as string,
      } : undefined,
    };

    // Add contact name if available
    if (pushName) {
      messageData.contacts = [{
        name: {
          formatted_name: pushName,
        },
      }];
    }

    return {
      type: 'message',
      timestamp: messageData.timestamp,
      data: messageData,
    };
  }

  private parseStatusWebhook(data: Record<string, unknown>): ParsedWebhookData {
    const key = data.key as Record<string, unknown> || {};
    const status = data.status as string;
    const messageTimestamp = data.messageTimestamp as number | string;

    const statusMap: Record<string, StatusWebhookData['status']> = {
      'PENDING': 'PENDING',
      'SENT': 'SENT',
      'DELIVERED': 'DELIVERED',
      'READ': 'READ',
      'ERROR': 'FAILED',
    };

    const statusData: StatusWebhookData = {
      messageId: key.id as string,
      recipientId: key.remoteJid as string,
      status: statusMap[status?.toUpperCase()] || 'SENT',
      timestamp: new Date(
        typeof messageTimestamp === 'string' 
          ? parseInt(messageTimestamp) * 1000 
          : messageTimestamp * 1000
      ),
    };

    return {
      type: 'status',
      timestamp: statusData.timestamp,
      data: statusData,
    };
  }

  private parseInstanceStatusWebhook(data: Record<string, unknown>): ParsedWebhookData {
    const state = (data.state as string)?.toLowerCase();
    
    let status: ConnectionStatus;
    switch (state) {
      case 'open':
        status = 'CONNECTED';
        break;
      case 'connecting':
      case 'close':
        status = 'CONNECTING';
        break;
      case 'qrcode':
        status = 'QRCODE_PENDING';
        break;
      default:
        status = 'DISCONNECTED';
    }

    return {
      type: 'instance_status',
      timestamp: new Date(),
      data: {
        instanceId: this.instanceId || this.instanceName,
        instanceName: this.instanceName,
        status,
        timestamp: new Date(),
        phoneNumber: data.number as string,
      },
    };
  }

  // ============================================
  // PROFILE MANAGEMENT
  // ============================================

  async setProfileName(name: string): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `/chat/updateProfileName/${this.instanceName}`;
    
    const response = await this.request(endpoint, 'POST', {
      name,
    });

    return {
      success: !response.error,
      error: response.error,
    };
  }

  async setProfileStatus(status: string): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `/chat/updateProfileStatus/${this.instanceName}`;
    
    const response = await this.request(endpoint, 'POST', {
      status,
    });

    return {
      success: !response.error,
      error: response.error,
    };
  }

  async setProfilePicture(imageUrl: string): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `/chat/updateProfilePicture/${this.instanceName}`;
    
    const response = await this.request(endpoint, 'POST', {
      picture: imageUrl,
    });

    return {
      success: !response.error,
      error: response.error,
    };
  }

  // ============================================
  // GROUP MANAGEMENT
  // ============================================

  async createGroup(
    subject: string,
    participants: string[]
  ): Promise<{ success: boolean; groupId?: string; error?: WhatsAppError }> {
    const endpoint = `/group/create/${this.instanceName}`;
    
    const response = await this.request<{
      id: string;
    }>(endpoint, 'POST', {
      subject,
      participants: participants.map(p => this.formatPhoneNumber(p)),
    });

    return {
      success: !response.error,
      groupId: response.data?.id,
      error: response.error,
    };
  }

  async addParticipants(
    groupId: string,
    participants: string[]
  ): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `/group/updateParticipants/${this.instanceName}`;
    
    const response = await this.request(endpoint, 'POST', {
      groupJid: groupId,
      action: 'add',
      participants: participants.map(p => this.formatPhoneNumber(p)),
    });

    return {
      success: !response.error,
      error: response.error,
    };
  }

  // ============================================
  // WEBHOOK CONFIGURATION
  // ============================================

  async setWebhook(webhookUrl: string): Promise<{ success: boolean; error?: WhatsAppError }> {
    const endpoint = `/webhook/set/${this.instanceName}`;
    
    const response = await this.request(endpoint, 'POST', {
      webhook: {
        url: webhookUrl,
        enabled: true,
      },
    });

    if (!response.error) {
      this.webhookUrl = webhookUrl;
    }

    return {
      success: !response.error,
      error: response.error,
    };
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
  // UTILITY METHODS
  // ============================================

  async getProfilePicture(phoneNumber: string): Promise<{ 
    success: boolean; 
    url?: string;
    error?: WhatsAppError;
  }> {
    const endpoint = `/chat/fetchProfilePictureUrl/${this.instanceName}`;
    
    const response = await this.request<{
      wuid: string;
      eurl: string;
    }>(endpoint, 'POST', {
      number: this.formatPhoneNumber(phoneNumber),
    });

    return {
      success: !response.error,
      url: response.data?.eurl,
      error: response.error,
    };
  }

  async checkNumberExists(phoneNumber: string): Promise<{ 
    exists: boolean; 
    jid?: string;
    error?: WhatsAppError;
  }> {
    const endpoint = `/chat/whatsappNumbers/${this.instanceName}`;
    
    const response = await this.request<{
      exists: boolean;
      jid: string;
    }>(endpoint, 'POST', {
      numbers: [this.formatPhoneNumber(phoneNumber)],
    });

    return {
      exists: response.data?.exists ?? false,
      jid: response.data?.jid,
      error: response.error,
    };
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createEvolutionProvider(config: EvolutionProviderConfig): EvolutionWhatsAppProvider {
  return new EvolutionWhatsAppProvider(config);
}
