/**
 * CRM Module - Types
 * SaaSWPP AI Platform - Customer Relationship Management Types
 */

// ============================================
// CUSTOMER TYPES
// ============================================

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'CHURNED';

export interface CustomerBase {
  name: string;
  phoneE164: string;
  email?: string;
  status?: CustomerStatus;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface CustomerCreateInput extends CustomerBase {
  tenantId: string;
}

export interface CustomerUpdateInput {
  name?: string;
  email?: string;
  status?: CustomerStatus;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt?: Date;
  firstOrderAt?: Date;
  orderFrequency: number; // Average days between orders
}

export interface CustomerHistory {
  customer: {
    id: string;
    name: string;
    phoneE164: string;
    email?: string;
    status: string;
    createdAt: Date;
  };
  orders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: Date;
  }>;
  conversations: Array<{
    id: string;
    lastMessageAt: Date;
    status: string;
  }>;
  appointments: Array<{
    id: string;
    title?: string;
    startAt: Date;
    status: string;
  }>;
  leads: Array<{
    id: string;
    status: string;
    score: number;
    createdAt: Date;
  }>;
}

export interface CustomerSearchParams {
  tenantId: string;
  query?: string;
  status?: CustomerStatus;
  tags?: string[];
  hasOrders?: boolean;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  lastOrderAfter?: Date;
  lastOrderBefore?: Date;
  limit?: number;
  offset?: number;
}

// ============================================
// LEAD TYPES
// ============================================

export type LeadStatusType = 
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type LeadSource = 
  | 'WHATSAPP'
  | 'WEBSITE'
  | 'REFERRAL'
  | 'CAMPAIGN'
  | 'MANUAL'
  | 'SOCIAL_MEDIA'
  | 'PHONE'
  | 'OTHER';

export interface LeadBase {
  customerId: string;
  status?: LeadStatusType;
  source?: LeadSource;
  notes?: string;
}

export interface LeadCreateInput extends LeadBase {
  tenantId: string;
  stageId?: string;
  campaignId?: string;
}

export interface LeadUpdateInput {
  status?: LeadStatusType;
  stageId?: string;
  score?: number;
  chancePercent?: number;
  isHot?: boolean;
  notes?: string;
  lastInteractionAt?: Date;
}

export interface LeadScoringFactors {
  hasEmail: boolean;
  hasPreviousOrders: boolean;
  orderCount: number;
  totalSpent: number;
  lastActivityDays: number;
  engagementScore: number;
  responseRate: number;
  conversationCount: number;
  appointmentCount: number;
}

export interface LeadScoreResult {
  score: number;
  factors: {
    factor: string;
    points: number;
    weight: number;
  }[];
  recommendation: string;
  isHot: boolean;
}

export interface LeadSearchParams {
  tenantId: string;
  status?: LeadStatusType;
  source?: LeadSource;
  stageId?: string;
  isHot?: boolean;
  minScore?: number;
  maxScore?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

// ============================================
// PIPELINE STAGE TYPES
// ============================================

export interface PipelineStageCreateInput {
  tenantId: string;
  name: string;
  order?: number;
  color?: string;
}

export interface PipelineStageUpdateInput {
  name?: string;
  order?: number;
  color?: string;
}

export interface PipelineStageWithLeads {
  id: string;
  name: string;
  order: number;
  color?: string;
  leads: Array<{
    id: string;
    score: number;
    isHot: boolean;
    customer: {
      id: string;
      name: string;
      phoneE164: string;
    };
    createdAt: Date;
    lastInteractionAt?: Date;
  }>;
}

// ============================================
// FOLLOW-UP TYPES
// ============================================

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';

export type FollowUpPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface FollowUpBase {
  title: string;
  description?: string;
  dueAt: Date;
  priority?: FollowUpPriority;
}

export interface FollowUpCreateInput extends FollowUpBase {
  leadId: string;
  tenantId: string;
}

export interface FollowUpUpdateInput {
  title?: string;
  description?: string;
  dueAt?: Date;
  status?: FollowUpStatus;
  priority?: FollowUpPriority;
  completedAt?: Date;
}

export interface FollowUpWithLead {
  id: string;
  title: string;
  description?: string;
  dueAt: Date;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  lead: {
    id: string;
    status: string;
    score: number;
    customer: {
      id: string;
      name: string;
      phoneE164: string;
    };
  };
}

// ============================================
// LEAD SCORING CONFIGURATION
// ============================================

export interface LeadScoringConfig {
  factors: {
    name: string;
    enabled: boolean;
    weight: number;
    maxPoints: number;
    criteria: Record<string, unknown>;
  }[];
  hotLeadThreshold: number;
  warmLeadThreshold: number;
  coldLeadThreshold: number;
}

export const DEFAULT_LEAD_SCORING_CONFIG: LeadScoringConfig = {
  factors: [
    {
      name: 'has_email',
      enabled: true,
      weight: 1,
      maxPoints: 10,
      criteria: { pointsIfTrue: 10 },
    },
    {
      name: 'has_previous_orders',
      enabled: true,
      weight: 2,
      maxPoints: 30,
      criteria: { pointsIfTrue: 30 },
    },
    {
      name: 'order_count',
      enabled: true,
      weight: 2,
      maxPoints: 20,
      criteria: { pointsPerOrder: 5, maxOrders: 4 },
    },
    {
      name: 'total_spent',
      enabled: true,
      weight: 3,
      maxPoints: 30,
      criteria: {
        tiers: [
          { minAmount: 100, points: 10 },
          { minAmount: 500, points: 20 },
          { minAmount: 1000, points: 30 },
        ],
      },
    },
    {
      name: 'recent_activity',
      enabled: true,
      weight: 2,
      maxPoints: 20,
      criteria: {
        daysThresholds: [
          { days: 7, points: 20 },
          { days: 30, points: 10 },
          { days: 60, points: 5 },
        ],
      },
    },
    {
      name: 'engagement_score',
      enabled: true,
      weight: 1,
      maxPoints: 15,
      criteria: {
        responseRateThresholds: [
          { rate: 0.8, points: 15 },
          { rate: 0.5, points: 10 },
          { rate: 0.3, points: 5 },
        ],
      },
    },
  ],
  hotLeadThreshold: 70,
  warmLeadThreshold: 40,
  coldLeadThreshold: 0,
};

// ============================================
// CONVERSION METRICS
// ============================================

export interface ConversionMetrics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  proposalLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageTimeToConversion: number; // in days
  averageDealSize: number;
  hotLeadCount: number;
  averageLeadScore: number;
}

export interface LeadFunnelStage {
  stage: LeadStatusType;
  count: number;
  percentage: number;
  conversionRateToNext: number;
}

// ============================================
// ERROR CLASSES
// ============================================

export class CustomerNotFoundError extends Error {
  constructor(customerId: string) {
    super(`Customer not found: ${customerId}`);
    this.name = 'CustomerNotFoundError';
  }
}

export class LeadNotFoundError extends Error {
  constructor(leadId: string) {
    super(`Lead not found: ${leadId}`);
    this.name = 'LeadNotFoundError';
  }
}

export class PipelineStageNotFoundError extends Error {
  constructor(stageId: string) {
    super(`Pipeline stage not found: ${stageId}`);
    this.name = 'PipelineStageNotFoundError';
  }
}

export class DuplicateCustomerError extends Error {
  constructor(phoneE164: string) {
    super(`Customer already exists with phone: ${phoneE164}`);
    this.name = 'DuplicateCustomerError';
  }
}
