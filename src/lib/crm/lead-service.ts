/**
 * CRM Module - Lead Service
 * SaaSWPP AI Platform - Lead Management Business Logic
 */

import { db } from '@/lib/db';
import { 
  Lead, 
  LeadStatus,
  Customer,
  Conversation,
  Order,
  Appointment,
} from '@prisma/client';
import {
  LeadCreateInput,
  LeadUpdateInput,
  LeadSearchParams,
  LeadScoreResult,
  LeadScoringFactors,
  LeadStatusType,
  LeadNotFoundError,
  PipelineStageWithLeads,
  FollowUpCreateInput,
  FollowUpUpdateInput,
  FollowUpWithLead,
  DEFAULT_LEAD_SCORING_CONFIG,
  ConversionMetrics,
  LeadFunnelStage,
} from './types';

// ============================================
// LEAD SERVICE CLASS
// ============================================

export class LeadService {
  // ============================================
  // LEAD MANAGEMENT
  // ============================================

  /**
   * Create a new lead
   */
  async createLead(input: LeadCreateInput): Promise<Lead> {
    // Verify customer exists
    const customer = await db.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new Error(`Customer not found: ${input.customerId}`);
    }

    // Check if lead already exists for this customer
    const existingLead = await db.lead.findFirst({
      where: {
        tenantId: input.tenantId,
        customerId: input.customerId,
        status: { notIn: [LeadStatus.WON, LeadStatus.LOST] },
      },
    });

    if (existingLead) {
      return existingLead;
    }

    // Get default pipeline stage if not specified
    let stageId = input.stageId;
    if (!stageId) {
      const firstStage = await db.pipelineStage.findFirst({
        where: { tenantId: input.tenantId },
        orderBy: { order: 'asc' },
      });
      stageId = firstStage?.id;
    }

    // Create lead
    const lead = await db.lead.create({
      data: {
        tenantId: input.tenantId,
        customerId: input.customerId,
        status: (input.status as LeadStatus) ?? LeadStatus.NEW,
        stageId,
        source: input.source,
        campaignId: input.campaignId,
        notes: input.notes,
        score: 0,
        isHot: false,
      },
      include: {
        customer: true,
      },
    });

    // Calculate initial score
    await this.scoreLead(lead.id);

    return lead;
  }

  /**
   * Get lead by ID
   */
  async getLead(leadId: string): Promise<Lead | null> {
    return db.lead.findUnique({
      where: { id: leadId },
      include: {
        customer: true,
        followUpTasks: {
          where: { status: 'PENDING' },
          orderBy: { dueAt: 'asc' },
          take: 5,
        },
      },
    });
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId: string, status: LeadStatusType): Promise<Lead> {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new LeadNotFoundError(leadId);
    }

    // Determine stage transition if stages exist
    let stageId = lead.stageId;
    
    // Map status to stage order for auto-progression
    const stageProgression = await this.getStageForStatus(lead.tenantId, status);
    if (stageProgression) {
      stageId = stageProgression;
    }

    return db.lead.update({
      where: { id: leadId },
      data: {
        status: status as LeadStatus,
        stageId,
        lastInteractionAt: new Date(),
      },
    });
  }

  /**
   * Get appropriate stage for a lead status
   */
  private async getStageForStatus(tenantId: string, status: LeadStatusType): Promise<string | null> {
    const stages = await db.pipelineStage.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    });

    if (stages.length === 0) return null;

    const statusToStageMap: Record<LeadStatusType, number> = {
      NEW: 0,
      CONTACTED: 1,
      QUALIFIED: 2,
      PROPOSAL: 3,
      NEGOTIATION: 4,
      WON: stages.length - 1,
      LOST: stages.length - 1,
    };

    const targetOrder = statusToStageMap[status];
    const targetStage = stages[Math.min(targetOrder, stages.length - 1)];
    return targetStage?.id ?? null;
  }

  /**
   * Update lead details
   */
  async updateLead(leadId: string, input: LeadUpdateInput): Promise<Lead> {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new LeadNotFoundError(leadId);
    }

    const updateData: Record<string, unknown> = {
      lastInteractionAt: new Date(),
    };

    if (input.status !== undefined) updateData.status = input.status;
    if (input.stageId !== undefined) updateData.stageId = input.stageId;
    if (input.score !== undefined) updateData.score = input.score;
    if (input.chancePercent !== undefined) updateData.chancePercent = input.chancePercent;
    if (input.isHot !== undefined) updateData.isHot = input.isHot;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.lastInteractionAt !== undefined) updateData.lastInteractionAt = input.lastInteractionAt;

    return db.lead.update({
      where: { id: leadId },
      data: updateData,
    });
  }

  // ============================================
  // LEAD SCORING
  // ============================================

  /**
   * Score a lead based on various factors
   */
  async scoreLead(leadId: string): Promise<LeadScoreResult> {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        customer: {
          include: {
            orders: true,
            conversations: true,
            appointments: true,
          },
        },
      },
    });

    if (!lead) {
      throw new LeadNotFoundError(leadId);
    }

    const factors = await this.calculateScoringFactors(lead);
    const result = this.calculateScore(factors);

    // Update lead with score
    await db.lead.update({
      where: { id: leadId },
      data: {
        score: result.score,
        isHot: result.isHot,
      },
    });

    // Create alert for hot lead
    if (result.isHot) {
      await db.operationalAlert.create({
        data: {
          tenantId: lead.tenantId,
          type: 'HOT_LEAD',
          severity: 'HIGH',
          title: 'Hot Lead Detected',
          description: `Lead for ${lead.customer.name} has reached hot status with score ${result.score}`,
          relatedEntityType: 'LEAD',
          relatedEntityId: leadId,
          status: 'OPEN',
        },
      });
    }

    return result;
  }

  /**
   * Calculate scoring factors for a lead
   */
  private async calculateScoringFactors(lead: Lead & { 
    customer: Customer & { 
      orders: Order[];
      conversations: Conversation[];
      appointments: Appointment[];
    } 
  }): Promise<LeadScoringFactors> {
    const customer = lead.customer;
    const now = new Date();

    // Calculate last activity days
    const lastActivity = customer.orders.length > 0
      ? customer.orders.reduce((latest, order) => 
          order.createdAt > latest ? order.createdAt : latest, 
          new Date(0)
        )
      : lead.lastInteractionAt ?? lead.createdAt;

    const lastActivityDays = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate engagement score (simplified)
    const responseRate = customer.conversations.length > 0
      ? customer.conversations.reduce((sum, conv) => 
          sum + (conv.status === 'CLOSED' ? 1 : 0), 0
        ) / customer.conversations.length
      : 0;

    return {
      hasEmail: !!customer.email,
      hasPreviousOrders: customer.orders.length > 0,
      orderCount: customer.orders.length,
      totalSpent: customer.totalSpent,
      lastActivityDays,
      engagementScore: responseRate * 100,
      responseRate,
      conversationCount: customer.conversations.length,
      appointmentCount: customer.appointments.length,
    };
  }

  /**
   * Calculate score from factors
   */
  private calculateScore(factors: LeadScoringFactors): LeadScoreResult {
    const config = DEFAULT_LEAD_SCORING_CONFIG;
    const factorResults: LeadScoreResult['factors'] = [];
    let totalScore = 0;

    for (const factorConfig of config.factors) {
      if (!factorConfig.enabled) continue;

      let points = 0;

      switch (factorConfig.name) {
        case 'has_email':
          if (factors.hasEmail) {
            points = (factorConfig.criteria.pointsIfTrue as number) ?? 10;
          }
          break;

        case 'has_previous_orders':
          if (factors.hasPreviousOrders) {
            points = (factorConfig.criteria.pointsIfTrue as number) ?? 30;
          }
          break;

        case 'order_count':
          const pointsPerOrder = (factorConfig.criteria.pointsPerOrder as number) ?? 5;
          const maxOrders = (factorConfig.criteria.maxOrders as number) ?? 4;
          points = Math.min(factors.orderCount, maxOrders) * pointsPerOrder;
          break;

        case 'total_spent':
          const tiers = factorConfig.criteria.tiers as Array<{ minAmount: number; points: number }>;
          if (tiers) {
            for (const tier of tiers.sort((a, b) => b.minAmount - a.minAmount)) {
              if (factors.totalSpent >= tier.minAmount) {
                points = tier.points;
                break;
              }
            }
          }
          break;

        case 'recent_activity':
          const dayThresholds = factorConfig.criteria.daysThresholds as Array<{ days: number; points: number }>;
          if (dayThresholds) {
            for (const threshold of dayThresholds.sort((a, b) => a.days - b.days)) {
              if (factors.lastActivityDays <= threshold.days) {
                points = threshold.points;
                break;
              }
            }
          }
          break;

        case 'engagement_score':
          const rateThresholds = factorConfig.criteria.responseRateThresholds as Array<{ rate: number; points: number }>;
          if (rateThresholds) {
            for (const threshold of rateThresholds.sort((a, b) => b.rate - a.rate)) {
              if (factors.responseRate >= threshold.rate) {
                points = threshold.points;
                break;
              }
            }
          }
          break;
      }

      points = Math.min(points, factorConfig.maxPoints);
      totalScore += points * factorConfig.weight;

      factorResults.push({
        factor: factorConfig.name,
        points,
        weight: factorConfig.weight,
      });
    }

    // Normalize score to 0-100
    const maxPossibleScore = config.factors.reduce(
      (sum, f) => sum + f.maxPoints * f.weight, 
      0
    );
    const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

    const isHot = normalizedScore >= config.hotLeadThreshold;

    let recommendation: string;
    if (isHot) {
      recommendation = 'High priority lead - immediate follow-up recommended';
    } else if (normalizedScore >= config.warmLeadThreshold) {
      recommendation = 'Warm lead - schedule follow-up within 24 hours';
    } else {
      recommendation = 'Cold lead - nurture campaign recommended';
    }

    return {
      score: normalizedScore,
      factors: factorResults,
      recommendation,
      isHot,
    };
  }

  /**
   * Batch score all leads for a tenant
   */
  async batchScoreLeads(tenantId: string): Promise<{ updated: number; errors: string[] }> {
    const leads = await db.lead.findMany({
      where: {
        tenantId,
        status: { notIn: [LeadStatus.WON, LeadStatus.LOST] },
      },
    });

    const errors: string[] = [];
    let updated = 0;

    for (const lead of leads) {
      try {
        await this.scoreLead(lead.id);
        updated++;
      } catch (error) {
        errors.push(`Failed to score lead ${lead.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { updated, errors };
  }

  // ============================================
  // LEAD ASSIGNMENT
  // ============================================

  /**
   * Assign lead to a user
   */
  async assignLead(leadId: string, userId: string): Promise<Lead> {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new LeadNotFoundError(leadId);
    }

    // Verify user belongs to tenant
    const userTenant = await db.userTenant.findFirst({
      where: {
        userId,
        tenantId: lead.tenantId,
        isActive: true,
      },
    });

    if (!userTenant) {
      throw new Error('User not found in tenant');
    }

    return db.lead.update({
      where: { id: leadId },
      data: {
        lastInteractionAt: new Date(),
      },
    });
  }

  /**
   * Auto-assign leads using round-robin
   */
  async autoAssignLead(tenantId: string, leadId: string): Promise<string | null> {
    // Get all active users in tenant
    const userTenants = await db.userTenant.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    if (userTenants.length === 0) {
      return null;
    }

    // Get recent lead assignments to determine round-robin
    const recentAssignments = await db.conversation.findMany({
      where: {
        tenantId,
        assignedUserId: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
      take: userTenants.length,
      select: { assignedUserId: true },
    });

    // Find least recently assigned user
    const assignedUserIds = new Set(
      recentAssignments.map(a => a.assignedUserId).filter(Boolean) as string[]
    );

    const nextUser = userTenants.find(ut => !assignedUserIds.has(ut.userId)) || userTenants[0];

    return nextUser?.userId ?? null;
  }

  // ============================================
  // LEAD SEARCH
  // ============================================

  /**
   * Search leads
   */
  async searchLeads(params: LeadSearchParams): Promise<{ leads: Lead[]; total: number }> {
    const where: Record<string, unknown> = {
      tenantId: params.tenantId,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.source) {
      where.source = params.source;
    }

    if (params.stageId) {
      where.stageId = params.stageId;
    }

    if (params.isHot !== undefined) {
      where.isHot = params.isHot;
    }

    if (params.minScore !== undefined || params.maxScore !== undefined) {
      where.score = {};
      if (params.minScore !== undefined) {
        where.score.gte = params.minScore;
      }
      if (params.maxScore !== undefined) {
        where.score.lte = params.maxScore;
      }
    }

    if (params.createdAfter || params.createdBefore) {
      where.createdAt = {};
      if (params.createdAfter) {
        where.createdAt.gte = params.createdAfter;
      }
      if (params.createdBefore) {
        where.createdAt.lte = params.createdBefore;
      }
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: params.limit ?? 50,
        skip: params.offset ?? 0,
      }),
      db.lead.count({ where }),
    ]);

    return { leads, total };
  }

  // ============================================
  // PIPELINE MANAGEMENT
  // ============================================

  /**
   * Get pipeline with leads grouped by stage
   */
  async getPipeline(tenantId: string): Promise<PipelineStageWithLeads[]> {
    const stages = await db.pipelineStage.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
      include: {
        leads: {
          where: {
            status: { notIn: [LeadStatus.WON, LeadStatus.LOST] },
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phoneE164: true,
              },
            },
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    return stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      order: stage.order,
      color: stage.color ?? undefined,
      leads: stage.leads.map((lead) => ({
        id: lead.id,
        score: lead.score,
        isHot: lead.isHot,
        customer: lead.customer,
        createdAt: lead.createdAt,
        lastInteractionAt: lead.lastInteractionAt ?? undefined,
      })),
    }));
  }

  // ============================================
  // FOLLOW-UP TASKS
  // ============================================

  /**
   * Create follow-up task for a lead
   */
  async createFollowUp(input: FollowUpCreateInput): Promise<{ id: string; title: string; dueAt: Date; status: string }> {
    const lead = await db.lead.findUnique({
      where: { id: input.leadId },
    });

    if (!lead) {
      throw new LeadNotFoundError(input.leadId);
    }

    return db.followUpTask.create({
      data: {
        leadId: input.leadId,
        tenantId: input.tenantId,
        title: input.title,
        description: input.description,
        dueAt: input.dueAt,
        status: 'PENDING',
      },
    });
  }

  /**
   * Get upcoming follow-ups
   */
  async getUpcomingFollowUps(tenantId: string, limit = 10): Promise<FollowUpWithLead[]> {
    const tasks = await db.followUpTask.findMany({
      where: {
        tenantId,
        status: 'PENDING',
        dueAt: {
          gte: new Date(),
        },
      },
      include: {
        lead: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phoneE164: true,
              },
            },
          },
        },
      },
      orderBy: { dueAt: 'asc' },
      take: limit,
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      dueAt: task.dueAt,
      status: task.status as FollowUpWithLead['status'],
      priority: 'NORMAL' as FollowUpWithLead['priority'],
      lead: {
        id: task.lead.id,
        status: task.lead.status,
        score: task.lead.score,
        customer: task.lead.customer,
      },
    }));
  }

  /**
   * Complete follow-up task
   */
  async completeFollowUp(taskId: string): Promise<void> {
    await db.followUpTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  // ============================================
  // METRICS & ANALYTICS
  // ============================================

  /**
   * Get conversion metrics for a tenant
   */
  async getConversionMetrics(tenantId: string, periodStart?: Date, periodEnd?: Date): Promise<ConversionMetrics> {
    const where: Record<string, unknown> = { tenantId };

    if (periodStart || periodEnd) {
      where.createdAt = {};
      if (periodStart) where.createdAt.gte = periodStart;
      if (periodEnd) where.createdAt.lte = periodEnd;
    }

    const leads = await db.lead.findMany({
      where,
      select: {
        status: true,
        score: true,
        isHot: true,
        createdAt: true,
        customer: {
          select: {
            totalSpent: true,
          },
        },
      },
    });

    const statusCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      PROPOSAL: 0,
      NEGOTIATION: 0,
      WON: 0,
      LOST: 0,
    };

    for (const lead of leads) {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    }

    const wonLeads = leads.filter(l => l.status === LeadStatus.WON);
    const totalWonValue = wonLeads.reduce((sum, l) => sum + l.customer.totalSpent, 0);

    return {
      totalLeads: leads.length,
      newLeads: statusCounts.NEW,
      contactedLeads: statusCounts.CONTACTED,
      qualifiedLeads: statusCounts.QUALIFIED,
      proposalLeads: statusCounts.PROPOSAL,
      wonLeads: statusCounts.WON,
      lostLeads: statusCounts.LOST,
      conversionRate: leads.length > 0 ? (statusCounts.WON / leads.length) * 100 : 0,
      averageTimeToConversion: 0, // Would need more complex calculation
      averageDealSize: wonLeads.length > 0 ? totalWonValue / wonLeads.length : 0,
      hotLeadCount: leads.filter(l => l.isHot).length,
      averageLeadScore: leads.length > 0 
        ? leads.reduce((sum, l) => sum + l.score, 0) / leads.length 
        : 0,
    };
  }

  /**
   * Get funnel stages with conversion data
   */
  async getFunnelStages(tenantId: string): Promise<LeadFunnelStage[]> {
    const metrics = await this.getConversionMetrics(tenantId);
    const total = metrics.totalLeads || 1;

    const stages: LeadStatusType[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];
    const counts = [
      metrics.newLeads,
      metrics.contactedLeads,
      metrics.qualifiedLeads,
      metrics.proposalLeads,
      metrics.wonLeads + metrics.lostLeads,
      metrics.wonLeads,
    ];

    return stages.map((stage, index) => {
      const count = counts[index];
      const nextCount = counts[index + 1] ?? count;
      
      return {
        stage,
        count,
        percentage: (count / total) * 100,
        conversionRateToNext: count > 0 ? (nextCount / count) * 100 : 0,
      };
    });
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

let leadServiceInstance: LeadService | null = null;

export function getLeadService(): LeadService {
  if (!leadServiceInstance) {
    leadServiceInstance = new LeadService();
  }
  return leadServiceInstance;
}

export function createLeadService(): LeadService {
  return new LeadService();
}
