/**
 * Billing Module - Subscription Service
 * SaaSWPP AI Platform - Business Logic for Subscriptions
 */

import { db } from '@/lib/db';
import { 
  Subscription, 
  Invoice, 
  Tenant, 
  Plan,
  SubscriptionStatus,
  TenantStatus,
} from '@prisma/client';
import { 
  getIuguClient, 
  IuguClient 
} from './iugu';
import {
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
  PaymentResult,
  CommissionCalculation,
  GracePeriodStatus,
  BillingEnforcementAction,
  PlanLimitExceededError,
} from './types';

// ============================================
// TYPES
// ============================================

interface SubscriptionWithRelations extends Subscription {
  tenant: Tenant;
  plan: Plan;
  invoices?: Invoice[];
}

interface CreateSubscriptionResult {
  success: boolean;
  subscription?: Subscription;
  iuguSubscriptionId?: string;
  iuguCustomerId?: string;
  trialEndsAt?: Date;
  error?: string;
}

interface PaymentWebhookData {
  invoiceId: string;
  subscriptionId?: string;
  status: string;
  paidAt?: Date;
  amount: number;
  paymentMethod?: string;
}

// ============================================
// SUBSCRIPTION SERVICE CLASS
// ============================================

export class SubscriptionService {
  private iuguClient: IuguClient;

  constructor() {
    this.iuguClient = getIuguClient();
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Create a new subscription for a tenant
   */
  async createSubscriptionForTenant(input: SubscriptionCreateInput): Promise<CreateSubscriptionResult> {
    try {
      // Get tenant and plan
      const tenant = await db.tenant.findUnique({
        where: { id: input.tenantId },
      });

      if (!tenant) {
        return { success: false, error: 'Tenant not found' };
      }

      const plan = await db.plan.findUnique({
        where: { id: input.planId },
      });

      if (!plan) {
        return { success: false, error: 'Plan not found' };
      }

      // Create or get Iugu customer
      let iuguCustomerId = await this.getOrCreateIuguCustomer(tenant);

      // Calculate trial end date
      const trialDays = input.trialDays ?? plan.trialDays;
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

      // Create Iugu subscription
      const iuguSubscription = await this.iuguClient.createSubscription({
        customer_id: iuguCustomerId,
        plan_identifier: plan.slug,
        expires_at: trialEndsAt.toISOString().split('T')[0],
        only_on_charge_success: false,
        custom_variables: [
          { name: 'tenant_id', value: input.tenantId },
          { name: 'plan_id', value: input.planId },
        ],
      });

      // Create local subscription record
      const subscription = await db.subscription.create({
        data: {
          tenantId: input.tenantId,
          planId: input.planId,
          provider: 'IUGU',
          providerSubscriptionId: iuguSubscription.id,
          providerCustomerId: iuguCustomerId,
          status: trialDays > 0 ? SubscriptionStatus.trialing : SubscriptionStatus.active,
          startedAt: new Date(),
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndsAt,
        },
        include: {
          tenant: true,
          plan: true,
        },
      });

      // Update tenant status
      await db.tenant.update({
        where: { id: input.tenantId },
        data: {
          status: trialDays > 0 ? TenantStatus.TRIALING : TenantStatus.ACTIVE,
        },
      });

      return {
        success: true,
        subscription,
        iuguSubscriptionId: iuguSubscription.id,
        iuguCustomerId,
        trialEndsAt: trialDays > 0 ? trialEndsAt : undefined,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get or create Iugu customer for a tenant
   */
  private async getOrCreateIuguCustomer(tenant: Tenant): Promise<string> {
    // Check if tenant already has a subscription with customer ID
    const existingSubscription = await db.subscription.findFirst({
      where: {
        tenantId: tenant.id,
        providerCustomerId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingSubscription?.providerCustomerId) {
      return existingSubscription.providerCustomerId;
    }

    // Create new Iugu customer
    const customer = await this.iuguClient.createCustomer({
      email: tenant.email || `tenant-${tenant.id}@placeholder.com`,
      name: tenant.tradeName || tenant.name,
      phone_prefix: tenant.phone?.substring(0, 2),
      phone: tenant.phone?.substring(2),
      custom_variables: [
        { name: 'tenant_id', value: tenant.id },
      ],
    });

    return customer.id;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, immediately = false): Promise<{
    success: boolean;
    subscription?: Subscription;
    error?: string;
  }> {
    try {
      const subscription = await db.subscription.findUnique({
        where: { id: subscriptionId },
        include: { tenant: true },
      });

      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      // Cancel in Iugu if provider subscription exists
      if (subscription.providerSubscriptionId) {
        await this.iuguClient.cancelSubscription(subscription.providerSubscriptionId);
      }

      // Update local subscription
      const updatedSubscription = await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.canceled,
          canceledAt: new Date(),
          cancelAtPeriodEnd: !immediately,
        },
      });

      // Update tenant status
      if (immediately) {
        await db.tenant.update({
          where: { id: subscription.tenantId },
          data: { status: TenantStatus.CANCELED },
        });
      }

      return { success: true, subscription: updatedSubscription };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(subscriptionId: string, newPlanId: string): Promise<{
    success: boolean;
    subscription?: Subscription;
    error?: string;
  }> {
    try {
      const subscription = await db.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      const newPlan = await db.plan.findUnique({
        where: { id: newPlanId },
      });

      if (!newPlan) {
        return { success: false, error: 'Plan not found' };
      }

      // Update in Iugu
      if (subscription.providerSubscriptionId) {
        await this.iuguClient.updateSubscription(subscription.providerSubscriptionId, {
          plan_identifier: newPlan.slug,
        });
      }

      // Update local subscription
      const updatedSubscription = await db.subscription.update({
        where: { id: subscriptionId },
        data: { planId: newPlanId },
      });

      return { success: true, subscription: updatedSubscription };
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================
  // PAYMENT HANDLING
  // ============================================

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(data: PaymentWebhookData): Promise<PaymentResult> {
    try {
      const subscription = data.subscriptionId
        ? await db.subscription.findFirst({
            where: { providerSubscriptionId: data.subscriptionId },
          })
        : null;

      if (subscription) {
        // Update subscription status
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.active,
            suspendedAt: null,
            reactivatedAt: new Date(),
          },
        });

        // Update tenant status
        await db.tenant.update({
          where: { id: subscription.tenantId },
          data: {
            status: TenantStatus.ACTIVE,
          },
        });

        // Update invoice if exists
        if (data.invoiceId) {
          await db.invoice.updateMany({
            where: { providerInvoiceId: data.invoiceId },
            data: {
              status: 'PAID',
              paidAt: data.paidAt ?? new Date(),
            },
          });
        }

        // Calculate and create commission
        await this.processCommissionForPayment(subscription.id, data.amount);

        return {
          success: true,
          subscriptionId: subscription.id,
          invoiceId: data.invoiceId,
          paidAt: data.paidAt ?? new Date(),
          amount: data.amount,
        };
      }

      // Handle one-time payment (no subscription)
      if (data.invoiceId) {
        await db.invoice.updateMany({
          where: { providerInvoiceId: data.invoiceId },
          data: {
            status: 'PAID',
            paidAt: data.paidAt ?? new Date(),
          },
        });
      }

      return {
        success: true,
        invoiceId: data.invoiceId,
        paidAt: data.paidAt,
        amount: data.amount,
      };
    } catch (error) {
      console.error('Error handling payment success:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailure(data: PaymentWebhookData): Promise<PaymentResult> {
    try {
      const subscription = data.subscriptionId
        ? await db.subscription.findFirst({
            where: { providerSubscriptionId: data.subscriptionId },
            include: { plan: true },
          })
        : null;

      if (subscription) {
        // Update subscription status to past_due
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.past_due,
          },
        });

        // Check and potentially start grace period
        const graceStatus = await this.checkGracePeriod(subscription.id);

        // Update invoice
        if (data.invoiceId) {
          await db.invoice.updateMany({
            where: { providerInvoiceId: data.invoiceId },
            data: { status: 'FAILED' },
          });
        }

        // Create operational alert
        await db.operationalAlert.create({
          data: {
            tenantId: subscription.tenantId,
            type: 'PAYMENT_FAILED',
            severity: 'HIGH',
            title: 'Payment Failed',
            description: `Payment of ${data.amount} failed for subscription ${subscription.id}`,
            status: 'OPEN',
          },
        });

        return {
          success: true,
          subscriptionId: subscription.id,
          invoiceId: data.invoiceId,
          error: 'Payment failed',
        };
      }

      return {
        success: false,
        error: 'Subscription not found',
      };
    } catch (error) {
      console.error('Error handling payment failure:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================
  // GRACE PERIOD MANAGEMENT
  // ============================================

  /**
   * Check and manage grace period for a subscription
   */
  async checkGracePeriod(subscriptionId: string): Promise<GracePeriodStatus> {
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      return {
        isActive: false,
        daysRemaining: 0,
        enforcementLevel: 0,
        blockedFeatures: [],
      };
    }

    // Check if already in grace period
    if (subscription.status === SubscriptionStatus.grace_period) {
      const graceStart = subscription.suspendedAt ?? subscription.currentPeriodEnd;
      const graceEnd = new Date(graceStart);
      graceEnd.setDate(graceEnd.getDate() + subscription.plan.graceDays);
      
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        isActive: true,
        startedAt: graceStart,
        endsAt: graceEnd,
        daysRemaining,
        enforcementLevel: this.calculateEnforcementLevel(daysRemaining, subscription.plan.graceDays),
        blockedFeatures: this.getBlockedFeatures(daysRemaining, subscription.plan.graceDays),
      };
    }

    // Start grace period if past_due
    if (subscription.status === SubscriptionStatus.past_due) {
      const now = new Date();
      const graceEnd = new Date(now);
      graceEnd.setDate(graceEnd.getDate() + subscription.plan.graceDays);

      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.grace_period,
          suspendedAt: now,
          currentPeriodEnd: graceEnd,
        },
      });

      // Create billing status record
      await db.tenantBillingStatus.upsert({
        where: { tenantId: subscription.tenantId },
        create: {
          tenantId: subscription.tenantId,
          status: 'GRACE_PERIOD',
          enforcementLevel: 1,
          graceEndsAt: graceEnd,
        },
        update: {
          status: 'GRACE_PERIOD',
          enforcementLevel: 1,
          graceEndsAt: graceEnd,
        },
      });

      return {
        isActive: true,
        startedAt: now,
        endsAt: graceEnd,
        daysRemaining: subscription.plan.graceDays,
        enforcementLevel: 1,
        blockedFeatures: [],
      };
    }

    return {
      isActive: false,
      daysRemaining: 0,
      enforcementLevel: 0,
      blockedFeatures: [],
    };
  }

  /**
   * Calculate enforcement level based on remaining grace days
   */
  private calculateEnforcementLevel(daysRemaining: number, totalGraceDays: number): number {
    const ratio = daysRemaining / totalGraceDays;
    
    if (ratio > 0.5) return 1; // Warning level
    if (ratio > 0.25) return 2; // Restricted level
    if (ratio > 0) return 3; // Critical level
    return 4; // Blocked level
  }

  /**
   * Get blocked features based on grace period status
   */
  private getBlockedFeatures(daysRemaining: number, totalGraceDays: number): string[] {
    const ratio = daysRemaining / totalGraceDays;
    
    if (ratio > 0.5) return [];
    if (ratio > 0.25) return ['campaigns', 'bulk_messages'];
    if (ratio > 0) return ['campaigns', 'bulk_messages', 'ai_responses', 'knowledge_base'];
    return ['all'];
  }

  /**
   * Get billing enforcement action for tenant
   */
  async getEnforcementAction(tenantId: string): Promise<BillingEnforcementAction> {
    const billingStatus = await db.tenantBillingStatus.findUnique({
      where: { tenantId },
    });

    if (!billingStatus || billingStatus.status === 'ACTIVE') {
      return {
        type: 'WARNING',
        reason: '',
        affectedModules: [],
        canAccessPortal: true,
        message: '',
      };
    }

    const enforcementLevel = billingStatus.enforcementLevel;

    if (enforcementLevel >= 4) {
      return {
        type: 'BLOCKED',
        reason: 'Subscription expired',
        affectedModules: ['all'],
        canAccessPortal: true,
        message: 'Your subscription has expired. Please update your payment method to continue using the service.',
      };
    }

    if (enforcementLevel >= 2) {
      const blockedModules = billingStatus.blockedModules?.split(',') ?? [];
      return {
        type: 'READ_ONLY',
        reason: 'Payment overdue',
        affectedModules: blockedModules,
        canAccessPortal: true,
        message: 'Some features are restricted due to payment issues. Please update your payment method.',
      };
    }

    return {
      type: 'WARNING',
      reason: 'Payment pending',
      affectedModules: [],
      canAccessPortal: true,
      message: 'Your payment is being processed. Some features may be restricted if payment fails.',
    };
  }

  // ============================================
  // COMMISSION MANAGEMENT
  // ============================================

  /**
   * Calculate commission for a payment
   */
  async calculateCommission(subscriptionId: string, amount: number): Promise<CommissionCalculation | null> {
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: {
          include: {
            resellerProfile: true,
          },
        },
      },
    });

    if (!subscription?.tenant.resellerId) {
      return null;
    }

    const reseller = subscription.tenant.resellerProfile;

    if (!reseller) {
      return null;
    }

    // Get commission policy
    const commissionPolicy = reseller.commissionPolicyId
      ? await db.commissionPolicy.findUnique({
          where: { id: reseller.commissionPolicyId },
          include: { tiers: true },
        })
      : null;

    // Get base percentage
    let percentApplied = commissionPolicy?.basePercent ?? 20;

    // Check for tier-based commission
    if (commissionPolicy?.tiers && commissionPolicy.tiers.length > 0) {
      const activeAccounts = await db.tenant.count({
        where: {
          resellerId: reseller.id,
          status: { in: [TenantStatus.ACTIVE, TenantStatus.TRIALING] },
        },
      });

      const applicableTier = commissionPolicy.tiers
        .filter((tier) => activeAccounts >= tier.minActiveAccounts)
        .sort((a, b) => b.minActiveAccounts - a.minActiveAccounts)[0];

      if (applicableTier) {
        percentApplied = applicableTier.percent;
      }
    }

    const competenceMonth = new Date().toISOString().substring(0, 7);

    return {
      baseAmount: amount,
      percentApplied,
      commissionAmount: (amount * percentApplied) / 100,
      resellerId: reseller.id,
      subscriptionId,
      competenceMonth,
    };
  }

  /**
   * Process and record commission for a payment
   */
  private async processCommissionForPayment(subscriptionId: string, amount: number): Promise<void> {
    const commission = await this.calculateCommission(subscriptionId, amount);

    if (!commission) {
      return;
    }

    // Create commission ledger entry
    await db.commissionLedger.create({
      data: {
        resellerId: commission.resellerId,
        subscriptionId: commission.subscriptionId,
        competenceMonth: commission.competenceMonth,
        baseAmount: commission.baseAmount,
        percentApplied: commission.percentApplied,
        commissionAmount: commission.commissionAmount,
        status: 'PENDING',
      },
    });
  }

  // ============================================
  // PLAN LIMITS
  // ============================================

  /**
   * Check if tenant has reached a plan limit
   */
  async checkPlanLimit(tenantId: string, limitKey: string, currentCount: number): Promise<{
    withinLimit: boolean;
    limit: number | null;
    current: number;
    remaining: number;
  }> {
    const subscription = await db.subscription.findFirst({
      where: {
        tenantId,
        status: { in: [SubscriptionStatus.active, SubscriptionStatus.trialing] },
      },
      include: {
        plan: {
          include: {
            planLimits: true,
          },
        },
      },
    });

    if (!subscription) {
      return {
        withinLimit: false,
        limit: 0,
        current: currentCount,
        remaining: 0,
      };
    }

    const limit = subscription.plan.planLimits.find((l) => l.limitKey === limitKey);

    if (!limit) {
      // No limit defined means unlimited
      return {
        withinLimit: true,
        limit: null,
        current: currentCount,
        remaining: Infinity,
      };
    }

    const withinLimit = currentCount < limit.limitValue;
    const remaining = Math.max(0, limit.limitValue - currentCount);

    return {
      withinLimit,
      limit: limit.limitValue,
      current: currentCount,
      remaining,
    };
  }

  /**
   * Enforce plan limit (throws if exceeded)
   */
  async enforcePlanLimit(tenantId: string, limitKey: string, increment = 1): Promise<void> {
    const usageCounter = await db.usageCounter.findUnique({
      where: {
        tenantId_metricKey: {
          tenantId,
          metricKey: limitKey,
        },
      },
    });

    const currentCount = (usageCounter?.currentValue ?? 0) + increment;
    const limitCheck = await this.checkPlanLimit(tenantId, limitKey, currentCount);

    if (!limitCheck.withinLimit) {
      throw new PlanLimitExceededError(
        limitKey,
        limitCheck.current,
        limitCheck.limit ?? 0
      );
    }
  }

  /**
   * Increment usage counter
   */
  async incrementUsageCounter(tenantId: string, metricKey: string, increment = 1): Promise<void> {
    await db.usageCounter.upsert({
      where: {
        tenantId_metricKey: {
          tenantId,
          metricKey,
        },
      },
      create: {
        tenantId,
        metricKey,
        currentValue: increment,
      },
      update: {
        currentValue: { increment },
      },
    });
  }

  // ============================================
  // SYNC OPERATIONS
  // ============================================

  /**
   * Sync subscription status from Iugu
   */
  async syncSubscriptionFromIugu(subscriptionId: string): Promise<Subscription | null> {
    const localSubscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!localSubscription?.providerSubscriptionId) {
      return null;
    }

    const iuguSubscription = await this.iuguClient.getSubscription(
      localSubscription.providerSubscriptionId
    );

    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.active,
      canceled: SubscriptionStatus.canceled,
      expired: SubscriptionStatus.expired,
      suspended: SubscriptionStatus.suspended,
      pending: SubscriptionStatus.past_due,
    };

    const newStatus = statusMap[iuguSubscription.status] ?? SubscriptionStatus.active;

    return db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: newStatus,
        currentPeriodEnd: iuguSubscription.expires_at
          ? new Date(iuguSubscription.expires_at)
          : null,
      },
    });
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

let subscriptionServiceInstance: SubscriptionService | null = null;

export function getSubscriptionService(): SubscriptionService {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = new SubscriptionService();
  }
  return subscriptionServiceInstance;
}

export function createSubscriptionService(): SubscriptionService {
  return new SubscriptionService();
}
