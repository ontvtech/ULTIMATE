/**
 * Billing Module - Types
 * SaaSWPP AI Platform - Iugu Integration Types
 */

// ============================================
// IUGU API TYPES
// ============================================

export type IuguSubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'expired'
  | 'suspended'
  | 'pending';

export type IuguInvoiceStatus = 
  | 'pending'
  | 'paid'
  | 'canceled'
  | 'refunded'
  | 'expired'
  | 'draft';

export type IuguPaymentMethod = 
  | 'bank_slip'
  | 'credit_card'
  | 'pix';

// ============================================
// IUGU SUBSCRIPTION
// ============================================

export interface IuguSubscriptionItem {
  id?: string;
  description: string;
  quantity: number;
  price_cents: number;
  price?: string;
  payable_with?: IuguPaymentMethod[];
}

export interface IuguSubscription {
  id: string;
  customer_id: string;
  plan_identifier?: string;
  status: IuguSubscriptionStatus;
  active: boolean;
  expires_at?: string;
  suspended: boolean;
  items: IuguSubscriptionItem[];
  subitems?: IuguSubscriptionItem[];
  credits_cycle_start?: string;
  credits_cycle_end?: string;
  currency?: string;
  payable_with?: IuguPaymentMethod;
  payment_method?: IuguPaymentMethod;
  created_at: string;
  updated_at: string;
  price_range?: {
    minimum_value: number;
    maximum_value: number;
  };
  custom_variables?: Array<{
    name: string;
    value: string;
  }>;
  credit_card?: {
    last_four_digits: string;
    brand: string;
  };
  customer_name?: string;
  customer_email?: string;
  customer_cc_emails?: string;
  customer_phone_prefix?: string;
  customer_phone?: string;
  two_step?: boolean;
  webhook_url?: string;
}

export interface IuguCreateSubscriptionInput {
  customer_id: string;
  plan_identifier?: string;
  expires_at?: string;
  only_on_charge_success?: boolean;
  payable_with?: IuguPaymentMethod;
  credits_cycle_start?: string;
  credits_cycle_end?: string;
  two_step?: boolean;
  items?: IuguSubscriptionItem[];
  subitems?: IuguSubscriptionItem[];
  custom_variables?: Array<{
    name: string;
    value: string;
  }>;
  webhook_url?: string;
}

export interface IuguUpdateSubscriptionInput {
  plan_identifier?: string;
  expires_at?: string;
  payable_with?: IuguPaymentMethod;
  items?: IuguSubscriptionItem[];
  subitems?: IuguSubscriptionItem[];
  custom_variables?: Array<{
    name: string;
    value: string;
  }>;
  webhook_url?: string;
}

// ============================================
// IUGU INVOICE
// ============================================

export interface IuguInvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  price_cents: number;
  price?: string;
  payable_with?: IuguPaymentMethod[];
}

export interface IuguInvoice {
  id: string;
  customer_id: string;
  subscription_id?: string;
  status: IuguInvoiceStatus;
  currency?: string;
  total_cents: number;
  total?: string;
  items: IuguInvoiceItem[];
  subitems?: IuguInvoiceItem[];
  email?: string;
  due_date: string;
  secured_url?: string;
  secure_url?: string;
  digitable_line?: string;
  barcode?: string;
  pix_code?: string;
  bank_slip?: {
    digitable_line: string;
    barcode_data: string;
    barcode: string;
  };
  payment_method?: IuguPaymentMethod;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_cc_emails?: string;
  customer_phone_prefix?: string;
  customer_phone?: string;
  early_payment_discount?: {
    days: number;
    percent: number;
    value_cents: number;
  };
  expired_at?: string;
  refunded_at?: string;
  canceled_at?: string;
  custom_variables?: Array<{
    name: string;
    value: string;
  }>;
}

export interface IuguCreateInvoiceInput {
  customer_id: string;
  email?: string;
  due_date: string;
  items: IuguInvoiceItem[];
  subitems?: IuguInvoiceItem[];
  payer?: IuguPayer;
  pay_customer_id?: string;
  payable_with?: IuguPaymentMethod[];
  ignore_due_email?: boolean;
  subscription_id?: string;
  credits?: number;
  custom_variables?: Array<{
    name: string;
    value: string;
  }>;
  webhook_url?: string;
  early_payment_discount?: {
    days: number;
    percent: number;
  };
}

// ============================================
// IUGU CUSTOMER
// ============================================

export interface IuguAddress {
  street: string;
  number: string;
  district?: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  complement?: string;
}

export interface IuguPayer {
  name: string;
  email: string;
  cpf_cnpj: string;
  phone_prefix: string;
  phone: string;
  address?: IuguAddress;
}

export interface IuguCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  phone_prefix?: string;
  cpf_cnpj?: string;
  cc_emails?: string;
  notes?: string;
  custom_variables?: Array<{
    name: string;
    value: string;
  }>;
  created_at: string;
  updated_at: string;
  default_payment_method_id?: string;
  payment_methods?: IuguPaymentMethodDetail[];
}

export interface IuguPaymentMethodDetail {
  id: string;
  description?: string;
  item_type: 'CreditCard' | 'BankSlip' | 'Pix';
  data: {
    holder_name?: string;
    display_number?: string;
    brand?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface IuguCreateCustomerInput {
  email: string;
  name: string;
  phone_prefix?: string;
  phone?: string;
  cpf_cnpj?: string;
  cc_emails?: string;
  notes?: string;
  address?: IuguAddress;
  custom_variables?: Array<{
    name: string;
    value: string;
  }>;
}

// ============================================
// IUGU WEBHOOK
// ============================================

export interface IuguWebhookEvent {
  id: string;
  event: IuguWebhookEventType;
  data: IuguSubscription | IuguInvoice;
  occurred_at: string;
}

export type IuguWebhookEventType = 
  | 'invoice.created'
  | 'invoice.status_changed'
  | 'invoice.payment_failed'
  | 'invoice.refund'
  | 'invoice.canceled'
  | 'invoice.expired'
  | 'invoice.duedate_reminder'
  | 'subscription.created'
  | 'subscription.reactivated'
  | 'subscription.renewed'
  | 'subscription.expired'
  | 'subscription.canceled'
  | 'subscription.suspended';

export interface IuguWebhookInvoicePayload {
  id: string;
  event: string;
  data: IuguInvoice;
}

export interface IuguWebhookSubscriptionPayload {
  id: string;
  event: string;
  data: IuguSubscription;
}

// ============================================
// IUGU API RESPONSE
// ============================================

export interface IuguApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IuguApiError;
}

export interface IuguApiError {
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface IuguPaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// ============================================
// SUBSCRIPTION BUSINESS TYPES
// ============================================

export type SubscriptionProviderType = 'IUGU' | 'STRIPE' | 'MANUAL';

export interface SubscriptionCreateInput {
  tenantId: string;
  planId: string;
  customerId: string;
  provider?: SubscriptionProviderType;
  trialDays?: number;
}

export interface SubscriptionUpdateInput {
  planId?: string;
  status?: SubscriptionStatusType;
  cancelAtPeriodEnd?: boolean;
}

export type SubscriptionStatusType = 
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'grace_period'
  | 'suspended'
  | 'canceled'
  | 'expired';

export interface PaymentResult {
  success: boolean;
  invoiceId?: string;
  subscriptionId?: string;
  paidAt?: Date;
  amount?: number;
  error?: string;
}

export interface CommissionCalculation {
  baseAmount: number;
  percentApplied: number;
  commissionAmount: number;
  resellerId: string;
  subscriptionId: string;
  competenceMonth: string;
}

// ============================================
// PLAN TYPES
// ============================================

export interface PlanDetails {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly?: number;
  trialDays: number;
  graceDays: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  features: string[];
  limits: Record<string, number>;
}

export interface PlanLimitType {
  key: string;
  value: number;
  description?: string;
}

export const PLAN_LIMITS = {
  CONVERSATIONS_MONTHLY: 'conversations_monthly',
  AI_MESSAGES_MONTHLY: 'ai_messages_monthly',
  KNOWLEDGE_ITEMS: 'knowledge_items',
  CATALOG_ITEMS: 'catalog_items',
  USERS: 'users',
  WHATSAPP_NUMBERS: 'whatsapp_numbers',
  CAMPAIGNS_MONTHLY: 'campaigns_monthly',
} as const;

export type PlanLimitKey = typeof PLAN_LIMITS[keyof typeof PLAN_LIMITS];

// ============================================
// GRACE PERIOD TYPES
// ============================================

export interface GracePeriodStatus {
  isActive: boolean;
  startedAt?: Date;
  endsAt?: Date;
  daysRemaining: number;
  enforcementLevel: number;
  blockedFeatures: string[];
}

export interface BillingEnforcementAction {
  type: 'WARNING' | 'READ_ONLY' | 'BLOCKED';
  reason: string;
  affectedModules: string[];
  canAccessPortal: boolean;
  message: string;
}

// ============================================
// ERROR CLASSES
// ============================================

export class IuguApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'IuguApiRequestError';
  }
}

export class SubscriptionNotFoundError extends Error {
  constructor(subscriptionId: string) {
    super(`Subscription not found: ${subscriptionId}`);
    this.name = 'SubscriptionNotFoundError';
  }
}

export class PaymentProcessingError extends Error {
  constructor(message: string, public invoiceId?: string) {
    super(message);
    this.name = 'PaymentProcessingError';
  }
}

export class PlanLimitExceededError extends Error {
  constructor(
    public limitKey: string,
    public current: number,
    public limit: number
  ) {
    super(`Plan limit exceeded for ${limitKey}: ${current}/${limit}`);
    this.name = 'PlanLimitExceededError';
  }
}
