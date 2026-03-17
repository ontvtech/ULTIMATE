/**
 * Billing Module - Iugu API Client
 * SaaSWPP AI Platform - Iugu Payment Gateway Integration
 */

import {
  IuguSubscription,
  IuguCreateSubscriptionInput,
  IuguUpdateSubscriptionInput,
  IuguInvoice,
  IuguCreateInvoiceInput,
  IuguCustomer,
  IuguCreateCustomerInput,
  IuguApiRequestError,
  IuguWebhookEvent,
  IuguApiResponse,
  IuguPaginatedResponse,
} from './types';

// ============================================
// CONFIGURATION
// ============================================

const IUGU_API_BASE_URL = 'https://api.iugu.com/v1';
const IUGU_SANDBOX_API_BASE_URL = 'https://sandbox-api.iugu.com/v1';

interface IuguClientConfig {
  apiKey: string;
  sandbox?: boolean;
  webhookUrl?: string;
}

// ============================================
// IUGU CLIENT CLASS
// ============================================

export class IuguClient {
  private apiKey: string;
  private baseUrl: string;
  private webhookUrl?: string;

  constructor(config: IuguClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.sandbox ? IUGU_SANDBOX_API_BASE_URL : IUGU_API_BASE_URL;
    this.webhookUrl = config.webhookUrl;
  }

  // ============================================
  // HTTP HELPER METHODS
  // ============================================

  private async request<T>(
    method: string,
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Iugu uses Basic Auth with API key as username
    const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json() as Record<string, unknown>;

      if (!response.ok) {
        const errorData = responseData as Record<string, unknown>;
        throw new IuguApiRequestError(
          (errorData.message as string) || `HTTP Error: ${response.status}`,
          response.status,
          (errorData.code as string) || 'API_ERROR',
          errorData.errors as Record<string, string[]>
        );
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof IuguApiRequestError) {
        throw error;
      }
      throw new IuguApiRequestError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  private get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    return this.request<T>('GET', url);
  }

  private post<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  private put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  private delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  // ============================================
  // CUSTOMER METHODS
  // ============================================

  /**
   * Create a new customer in Iugu
   */
  async createCustomer(input: IuguCreateCustomerInput): Promise<IuguCustomer> {
    const data: Record<string, unknown> = {
      email: input.email,
      name: input.name,
    };

    if (input.phone_prefix) data.phone_prefix = input.phone_prefix;
    if (input.phone) data.phone = input.phone;
    if (input.cpf_cnpj) data.cpf_cnpj = input.cpf_cnpj;
    if (input.cc_emails) data.cc_emails = input.cc_emails;
    if (input.notes) data.notes = input.notes;
    if (input.address) data.address = input.address;
    if (input.custom_variables) data.custom_variables = input.custom_variables;

    return this.post<IuguCustomer>('/customers', data);
  }

  /**
   * Get a customer by ID
   */
  async getCustomer(customerId: string): Promise<IuguCustomer> {
    return this.get<IuguCustomer>(`/customers/${customerId}`);
  }

  /**
   * Update a customer
   */
  async updateCustomer(customerId: string, input: Partial<IuguCreateCustomerInput>): Promise<IuguCustomer> {
    const data: Record<string, unknown> = {};
    
    if (input.email) data.email = input.email;
    if (input.name) data.name = input.name;
    if (input.phone_prefix) data.phone_prefix = input.phone_prefix;
    if (input.phone) data.phone = input.phone;
    if (input.cpf_cnpj) data.cpf_cnpj = input.cpf_cnpj;
    if (input.cc_emails) data.cc_emails = input.cc_emails;
    if (input.notes) data.notes = input.notes;
    if (input.address) data.address = input.address;
    if (input.custom_variables) data.custom_variables = input.custom_variables;

    return this.put<IuguCustomer>(`/customers/${customerId}`, data);
  }

  /**
   * List customers
   */
  async listCustomers(page = 1, limit = 100): Promise<IuguPaginatedResponse<IuguCustomer>> {
    return this.get<IuguPaginatedResponse<IuguCustomer>>('/customers', {
      page: page.toString(),
      limit: limit.toString(),
    });
  }

  // ============================================
  // SUBSCRIPTION METHODS
  // ============================================

  /**
   * Create a new subscription
   */
  async createSubscription(input: IuguCreateSubscriptionInput): Promise<IuguSubscription> {
    const data: Record<string, unknown> = {
      customer_id: input.customer_id,
    };

    if (input.plan_identifier) data.plan_identifier = input.plan_identifier;
    if (input.expires_at) data.expires_at = input.expires_at;
    if (input.only_on_charge_success !== undefined) data.only_on_charge_success = input.only_on_charge_success;
    if (input.payable_with) data.payable_with = input.payable_with;
    if (input.credits_cycle_start) data.credits_cycle_start = input.credits_cycle_start;
    if (input.credits_cycle_end) data.credits_cycle_end = input.credits_cycle_end;
    if (input.two_step !== undefined) data.two_step = input.two_step;
    if (input.items) data.items = input.items;
    if (input.subitems) data.subitems = input.subitems;
    if (input.custom_variables) data.custom_variables = input.custom_variables;
    if (this.webhookUrl && !input.webhook_url) {
      data.webhook_url = this.webhookUrl;
    } else if (input.webhook_url) {
      data.webhook_url = input.webhook_url;
    }

    return this.post<IuguSubscription>('/subscriptions', data);
  }

  /**
   * Get a subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<IuguSubscription> {
    return this.get<IuguSubscription>(`/subscriptions/${subscriptionId}`);
  }

  /**
   * Update a subscription
   */
  async updateSubscription(subscriptionId: string, input: IuguUpdateSubscriptionInput): Promise<IuguSubscription> {
    const data: Record<string, unknown> = {};

    if (input.plan_identifier) data.plan_identifier = input.plan_identifier;
    if (input.expires_at) data.expires_at = input.expires_at;
    if (input.payable_with) data.payable_with = input.payable_with;
    if (input.items) data.items = input.items;
    if (input.subitems) data.subitems = input.subitems;
    if (input.custom_variables) data.custom_variables = input.custom_variables;
    if (this.webhookUrl && !input.webhook_url) {
      data.webhook_url = this.webhookUrl;
    } else if (input.webhook_url) {
      data.webhook_url = input.webhook_url;
    }

    return this.put<IuguSubscription>(`/subscriptions/${subscriptionId}`, data);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<IuguSubscription> {
    return this.post<IuguSubscription>(`/subscriptions/${subscriptionId}/cancel`, {});
  }

  /**
   * Suspend a subscription
   */
  async suspendSubscription(subscriptionId: string): Promise<IuguSubscription> {
    return this.post<IuguSubscription>(`/subscriptions/${subscriptionId}/suspend`, {});
  }

  /**
   * Activate a subscription
   */
  async activateSubscription(subscriptionId: string): Promise<IuguSubscription> {
    return this.post<IuguSubscription>(`/subscriptions/${subscriptionId}/activate`, {});
  }

  /**
   * List subscriptions
   */
  async listSubscriptions(page = 1, limit = 100): Promise<IuguPaginatedResponse<IuguSubscription>> {
    return this.get<IuguPaginatedResponse<IuguSubscription>>('/subscriptions', {
      page: page.toString(),
      limit: limit.toString(),
    });
  }

  // ============================================
  // INVOICE METHODS
  // ============================================

  /**
   * Create a new invoice (charge)
   */
  async createInvoice(input: IuguCreateInvoiceInput): Promise<IuguInvoice> {
    const data: Record<string, unknown> = {
      customer_id: input.customer_id,
      due_date: input.due_date,
      items: input.items,
    };

    if (input.email) data.email = input.email;
    if (input.subitems) data.subitems = input.subitems;
    if (input.payer) data.payer = input.payer;
    if (input.pay_customer_id) data.pay_customer_id = input.pay_customer_id;
    if (input.payable_with) data.payable_with = input.payable_with;
    if (input.ignore_due_email !== undefined) data.ignore_due_email = input.ignore_due_email;
    if (input.subscription_id) data.subscription_id = input.subscription_id;
    if (input.credits) data.credits = input.credits;
    if (input.custom_variables) data.custom_variables = input.custom_variables;
    if (input.early_payment_discount) data.early_payment_discount = input.early_payment_discount;
    if (this.webhookUrl && !input.webhook_url) {
      data.webhook_url = this.webhookUrl;
    } else if (input.webhook_url) {
      data.webhook_url = input.webhook_url;
    }

    return this.post<IuguInvoice>('/invoices', data);
  }

  /**
   * Get an invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<IuguInvoice> {
    return this.get<IuguInvoice>(`/invoices/${invoiceId}`);
  }

  /**
   * Capture an invoice (for two-step transactions)
   */
  async captureInvoice(invoiceId: string): Promise<IuguInvoice> {
    return this.post<IuguInvoice>(`/invoices/${invoiceId}/capture`, {});
  }

  /**
   * Refund an invoice
   */
  async refundInvoice(invoiceId: string): Promise<IuguInvoice> {
    return this.post<IuguInvoice>(`/invoices/${invoiceId}/refund`, {});
  }

  /**
   * Cancel an invoice
   */
  async cancelInvoice(invoiceId: string): Promise<IuguInvoice> {
    return this.put<IuguInvoice>(`/invoices/${invoiceId}`, { status: 'canceled' });
  }

  /**
   * Duplicate an invoice
   */
  async duplicateInvoice(invoiceId: string, dueDate: string): Promise<IuguInvoice> {
    return this.post<IuguInvoice>(`/invoices/${invoiceId}/duplicate`, {
      due_date: dueDate,
    });
  }

  /**
   * List invoices
   */
  async listInvoices(page = 1, limit = 100, customerId?: string): Promise<IuguPaginatedResponse<IuguInvoice>> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    
    if (customerId) {
      params.customer_id = customerId;
    }

    return this.get<IuguPaginatedResponse<IuguInvoice>>('/invoices', params);
  }

  // ============================================
  // WEBHOOK METHODS
  // ============================================

  /**
   * Process and validate a webhook event
   */
  async processWebhook(payload: Record<string, unknown>): Promise<IuguWebhookEvent> {
    // Validate required fields
    if (!payload.event || !payload.data) {
      throw new IuguApiRequestError('Invalid webhook payload: missing event or data', 400, 'INVALID_WEBHOOK');
    }

    const event: IuguWebhookEvent = {
      id: (payload.id as string) || crypto.randomUUID(),
      event: payload.event as IuguWebhookEvent['event'],
      data: payload.data as IuguSubscription | IuguInvoice,
      occurred_at: (payload.occurred_at as string) || new Date().toISOString(),
    };

    // Validate event type
    const validEvents = [
      'invoice.created',
      'invoice.status_changed',
      'invoice.payment_failed',
      'invoice.refund',
      'invoice.canceled',
      'invoice.expired',
      'invoice.duedate_reminder',
      'subscription.created',
      'subscription.reactivated',
      'subscription.renewed',
      'subscription.expired',
      'subscription.canceled',
      'subscription.suspended',
    ];

    if (!validEvents.includes(event.event)) {
      throw new IuguApiRequestError(
        `Unknown webhook event type: ${event.event}`,
        400,
        'UNKNOWN_EVENT_TYPE'
      );
    }

    return event;
  }

  /**
   * Verify webhook signature (if needed)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Iugu doesn't provide webhook signatures in the standard way
    // This is a placeholder for custom verification if implemented
    return !!payload && !!signature;
  }

  // ============================================
  // PLAN METHODS (Iugu Plans)
  // ============================================

  /**
   * Get a plan by identifier
   */
  async getPlan(planIdentifier: string): Promise<{
    id: string;
    identifier: string;
    name: string;
    currency: string;
    prices: Array<{
      currency: string;
      value_cents: number;
    }>;
    features: Array<{
      name: string;
      value: number;
    }>;
  }> {
    return this.get(`/plans/${planIdentifier}`);
  }

  // ============================================
  // PAYMENT METHOD METHODS
  // ============================================

  /**
   * Create a payment method for a customer
   */
  async createPaymentMethod(customerId: string, data: {
    description?: string;
    token: string;
    set_as_default?: boolean;
  }): Promise<{
    id: string;
    description: string;
    item_type: string;
    data: {
      holder_name: string;
      display_number: string;
      brand: string;
    };
  }> {
    return this.post(`/customers/${customerId}/payment_methods`, data);
  }

  /**
   * List payment methods for a customer
   */
  async listPaymentMethods(customerId: string): Promise<{
    items: Array<{
      id: string;
      description: string;
      item_type: string;
      data: {
        holder_name: string;
        display_number: string;
        brand: string;
      };
    }>;
  }> {
    return this.get(`/customers/${customerId}/payment_methods`);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Health check - verify API connectivity
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Try to fetch account info as a health check
      await this.get('/account');
      
      return {
        healthy: true,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<{
    id: string;
    name: string;
    email: string;
    currency: string;
    balance: {
      available: number;
      pending: number;
      transferred: number;
    };
  }> {
    return this.get('/account');
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

let iuguClientInstance: IuguClient | null = null;

export function getIuguClient(): IuguClient {
  if (!iuguClientInstance) {
    const apiKey = process.env.IUGU_API_KEY;
    
    if (!apiKey) {
      throw new Error('IUGU_API_KEY environment variable is not set');
    }

    iuguClientInstance = new IuguClient({
      apiKey,
      sandbox: process.env.IUGU_SANDBOX === 'true',
      webhookUrl: process.env.IUGU_WEBHOOK_URL,
    });
  }

  return iuguClientInstance;
}

export function createIuguClient(config: IuguClientConfig): IuguClient {
  return new IuguClient(config);
}

// Re-export types
export * from './types';
