/**
 * CRM Module - Customer Service
 * SaaSWPP AI Platform - Customer Management Business Logic
 */

import { db } from '@/lib/db';
import { 
  Customer,
  Order,
  Conversation,
  Appointment,
  Lead,
  ServiceOrder,
} from '@prisma/client';
import {
  CustomerCreateInput,
  CustomerUpdateInput,
  CustomerStats,
  CustomerHistory,
  CustomerSearchParams,
  CustomerNotFoundError,
  DuplicateCustomerError,
  CustomerStatus,
} from './types';

// ============================================
// CUSTOMER SERVICE CLASS
// ============================================

export class CustomerService {
  // ============================================
  // CUSTOMER MANAGEMENT
  // ============================================

  /**
   * Create a new customer
   */
  async createCustomer(input: CustomerCreateInput): Promise<Customer> {
    // Check if customer already exists with this phone number
    const existingCustomer = await db.customer.findUnique({
      where: {
        tenantId_phoneE164: {
          tenantId: input.tenantId,
          phoneE164: input.phoneE164,
        },
      },
    });

    if (existingCustomer) {
      // Return existing customer instead of throwing
      return existingCustomer;
    }

    return db.customer.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        phoneE164: input.phoneE164,
        email: input.email,
        status: input.status ?? 'ACTIVE',
        tags: input.tags?.join(',') ?? '',
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        totalOrders: 0,
        totalSpent: 0,
      },
    });
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Customer | null> {
    return db.customer.findUnique({
      where: { id: customerId },
    });
  }

  /**
   * Get customer by phone number
   */
  async getCustomerByPhone(tenantId: string, phoneE164: string): Promise<Customer | null> {
    return db.customer.findUnique({
      where: {
        tenantId_phoneE164: {
          tenantId,
          phoneE164,
        },
      },
    });
  }

  /**
   * Get or create customer by phone
   */
  async getOrCreateCustomer(tenantId: string, phoneE164: string, name?: string): Promise<Customer> {
    const existing = await this.getCustomerByPhone(tenantId, phoneE164);
    
    if (existing) {
      return existing;
    }

    return this.createCustomer({
      tenantId,
      phoneE164,
      name: name ?? phoneE164,
    });
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, input: CustomerUpdateInput): Promise<Customer> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.tags !== undefined) updateData.tags = input.tags.join(',');
    if (input.metadata !== undefined) updateData.metadata = JSON.stringify(input.metadata);

    return db.customer.update({
      where: { id: customerId },
      data: updateData,
    });
  }

  /**
   * Update customer status
   */
  async updateCustomerStatus(customerId: string, status: CustomerStatus): Promise<Customer> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    return db.customer.update({
      where: { id: customerId },
      data: { status },
    });
  }

  // ============================================
  // CUSTOMER STATISTICS
  // ============================================

  /**
   * Update customer statistics after order
   */
  async updateCustomerStats(customerId: string, orderTotal: number): Promise<void> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) return;

    const newTotalOrders = customer.totalOrders + 1;
    const newTotalSpent = customer.totalSpent + orderTotal;

    await db.customer.update({
      where: { id: customerId },
      data: {
        totalOrders: newTotalOrders,
        totalSpent: newTotalSpent,
        lastOrderAt: new Date(),
      },
    });
  }

  /**
   * Recalculate customer statistics from orders
   */
  async recalculateCustomerStats(customerId: string): Promise<CustomerStats> {
    const orders = await db.order.findMany({
      where: {
        customerId,
        status: { not: 'CANCELED' },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const lastOrderAt = orders.length > 0 ? orders[orders.length - 1].createdAt : undefined;
    const firstOrderAt = orders.length > 0 ? orders[0].createdAt : undefined;

    // Calculate order frequency
    let orderFrequency = 0;
    if (orders.length >= 2) {
      const firstOrder = orders[0].createdAt;
      const lastOrder = orders[orders.length - 1].createdAt;
      const daysDiff = Math.floor(
        (lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24)
      );
      orderFrequency = daysDiff / (orders.length - 1);
    }

    // Update customer record
    await db.customer.update({
      where: { id: customerId },
      data: {
        totalOrders,
        totalSpent,
        lastOrderAt,
      },
    });

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastOrderAt,
      firstOrderAt,
      orderFrequency,
    };
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(customerId: string): Promise<CustomerStats> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          where: { status: { not: 'CANCELED' } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    const orders = customer.orders;
    const totalOrders = orders.length;
    const totalSpent = customer.totalSpent;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const lastOrderAt = orders.length > 0 ? orders[orders.length - 1].createdAt : undefined;
    const firstOrderAt = orders.length > 0 ? orders[0].createdAt : undefined;

    let orderFrequency = 0;
    if (orders.length >= 2) {
      const firstOrder = orders[0].createdAt;
      const lastOrder = orders[orders.length - 1].createdAt;
      const daysDiff = Math.floor(
        (lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24)
      );
      orderFrequency = daysDiff / (orders.length - 1);
    }

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastOrderAt,
      firstOrderAt,
      orderFrequency,
    };
  }

  // ============================================
  // CUSTOMER HISTORY
  // ============================================

  /**
   * Get complete customer history
   */
  async getCustomerHistory(customerId: string): Promise<CustomerHistory> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    const [orders, conversations, appointments, leads] = await Promise.all([
      // Get orders
      db.order.findMany({
        where: { customerId },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      
      // Get conversations
      db.conversation.findMany({
        where: { customerId },
        select: {
          id: true,
          lastMessageAt: true,
          status: true,
        },
        orderBy: { lastMessageAt: 'desc' },
        take: 10,
      }),
      
      // Get appointments
      db.appointment.findMany({
        where: { customerId },
        select: {
          id: true,
          title: true,
          startAt: true,
          status: true,
        },
        orderBy: { startAt: 'desc' },
        take: 10,
      }),
      
      // Get leads
      db.lead.findMany({
        where: { customerId },
        select: {
          id: true,
          status: true,
          score: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phoneE164: customer.phoneE164,
        email: customer.email ?? undefined,
        status: customer.status,
        createdAt: customer.createdAt,
      },
      orders,
      conversations,
      appointments,
      leads,
    };
  }

  /**
   * Get customer activity timeline
   */
  async getCustomerTimeline(customerId: string, limit = 50): Promise<Array<{
    type: string;
    id: string;
    description: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  }>> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    const timeline: Array<{
      type: string;
      id: string;
      description: string;
      timestamp: Date;
      metadata?: Record<string, unknown>;
    }> = [];

    // Get recent orders
    const orders = await db.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    for (const order of orders) {
      timeline.push({
        type: 'ORDER',
        id: order.id,
        description: `Order placed - Total: ${order.total}`,
        timestamp: order.createdAt,
        metadata: { total: order.total, status: order.status },
      });
    }

    // Get recent conversations
    const conversations = await db.conversation.findMany({
      where: { customerId },
      orderBy: { lastMessageAt: 'desc' },
      take: 10,
    });

    for (const conv of conversations) {
      timeline.push({
        type: 'CONVERSATION',
        id: conv.id,
        description: `Conversation ${conv.status.toLowerCase()}`,
        timestamp: conv.lastMessageAt,
        metadata: { status: conv.status, lastMessagePreview: conv.lastMessagePreview },
      });
    }

    // Get recent appointments
    const appointments = await db.appointment.findMany({
      where: { customerId },
      orderBy: { startAt: 'desc' },
      take: 10,
    });

    for (const apt of appointments) {
      timeline.push({
        type: 'APPOINTMENT',
        id: apt.id,
        description: apt.title ?? 'Appointment scheduled',
        timestamp: apt.startAt,
        metadata: { status: apt.status },
      });
    }

    // Sort by timestamp descending
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return timeline.slice(0, limit);
  }

  // ============================================
  // CUSTOMER SEARCH
  // ============================================

  /**
   * Search customers
   */
  async searchCustomers(params: CustomerSearchParams): Promise<{ customers: Customer[]; total: number }> {
    const where: Record<string, unknown> = {
      tenantId: params.tenantId,
    };

    // Text search
    if (params.query) {
      where.OR = [
        { name: { contains: params.query } },
        { email: { contains: params.query } },
        { phoneE164: { contains: params.query } },
      ];
    }

    // Status filter
    if (params.status) {
      where.status = params.status;
    }

    // Has orders filter
    if (params.hasOrders !== undefined) {
      if (params.hasOrders) {
        where.totalOrders = { gt: 0 };
      } else {
        where.totalOrders = 0;
      }
    }

    // Total spent filters
    if (params.minTotalSpent !== undefined || params.maxTotalSpent !== undefined) {
      where.totalSpent = {};
      if (params.minTotalSpent !== undefined) {
        where.totalSpent.gte = params.minTotalSpent;
      }
      if (params.maxTotalSpent !== undefined) {
        where.totalSpent.lte = params.maxTotalSpent;
      }
    }

    // Last order filters
    if (params.lastOrderAfter || params.lastOrderBefore) {
      where.lastOrderAt = {};
      if (params.lastOrderAfter) {
        where.lastOrderAt.gte = params.lastOrderAfter;
      }
      if (params.lastOrderBefore) {
        where.lastOrderAt.lte = params.lastOrderBefore;
      }
    }

    // Tags filter (comma-separated in DB)
    if (params.tags && params.tags.length > 0) {
      // Simple contains check for each tag
      where.tags = { contains: params.tags[0] };
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit ?? 50,
        skip: params.offset ?? 0,
      }),
      db.customer.count({ where }),
    ]);

    return { customers, total };
  }

  // ============================================
  // CUSTOMER SEGMENTATION
  // ============================================

  /**
   * Get customer segments for a tenant
   */
  async getCustomerSegments(tenantId: string): Promise<{
    newCustomers: number;
    activeCustomers: number;
    vipCustomers: number;
    atRiskCustomers: number;
    churnedCustomers: number;
    totalCustomers: number;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [
      newCustomers,
      activeCustomers,
      vipCustomers,
      atRiskCustomers,
      churnedCustomers,
      totalCustomers,
    ] = await Promise.all([
      // New customers (created in last 30 days)
      db.customer.count({
        where: {
          tenantId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      
      // Active customers (ordered in last 30 days)
      db.customer.count({
        where: {
          tenantId,
          lastOrderAt: { gte: thirtyDaysAgo },
          status: 'ACTIVE',
        },
      }),
      
      // VIP customers (total spent > 1000 or > 10 orders)
      db.customer.count({
        where: {
          tenantId,
          OR: [
            { totalSpent: { gte: 1000 } },
            { totalOrders: { gte: 10 } },
          ],
          status: 'ACTIVE',
        },
      }),
      
      // At-risk customers (no order in 60-90 days)
      db.customer.count({
        where: {
          tenantId,
          lastOrderAt: {
            gte: ninetyDaysAgo,
            lt: sixtyDaysAgo,
          },
          status: 'ACTIVE',
        },
      }),
      
      // Churned customers (no order in 90+ days)
      db.customer.count({
        where: {
          tenantId,
          lastOrderAt: { lt: ninetyDaysAgo },
          status: { in: ['INACTIVE', 'CHURNED'] },
        },
      }),
      
      // Total customers
      db.customer.count({
        where: { tenantId },
      }),
    ]);

    return {
      newCustomers,
      activeCustomers,
      vipCustomers,
      atRiskCustomers,
      churnedCustomers,
      totalCustomers,
    };
  }

  /**
   * Get top customers by total spent
   */
  async getTopCustomers(tenantId: string, limit = 10): Promise<Array<{
    id: string;
    name: string;
    phoneE164: string;
    totalSpent: number;
    totalOrders: number;
    lastOrderAt?: Date;
  }>> {
    const customers = await db.customer.findMany({
      where: {
        tenantId,
        totalSpent: { gt: 0 },
      },
      orderBy: { totalSpent: 'desc' },
      take: limit,
    });

    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      phoneE164: c.phoneE164,
      totalSpent: c.totalSpent,
      totalOrders: c.totalOrders,
      lastOrderAt: c.lastOrderAt ?? undefined,
    }));
  }

  // ============================================
  // CUSTOMER TAGS
  // ============================================

  /**
   * Add tag to customer
   */
  async addCustomerTag(customerId: string, tag: string): Promise<Customer> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    const existingTags = customer.tags ? customer.tags.split(',') : [];
    if (!existingTags.includes(tag)) {
      existingTags.push(tag);
    }

    return db.customer.update({
      where: { id: customerId },
      data: { tags: existingTags.join(',') },
    });
  }

  /**
   * Remove tag from customer
   */
  async removeCustomerTag(customerId: string, tag: string): Promise<Customer> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    const existingTags = customer.tags ? customer.tags.split(',') : [];
    const filteredTags = existingTags.filter((t) => t !== tag);

    return db.customer.update({
      where: { id: customerId },
      data: { tags: filteredTags.join(',') },
    });
  }

  /**
   * Get all tags used by tenant
   */
  async getTenantTags(tenantId: string): Promise<string[]> {
    const customers = await db.customer.findMany({
      where: {
        tenantId,
        tags: { not: '' },
      },
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    for (const customer of customers) {
      if (customer.tags) {
        customer.tags.split(',').forEach((tag) => {
          if (tag.trim()) {
            tagSet.add(tag.trim());
          }
        });
      }
    }

    return Array.from(tagSet).sort();
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Bulk update customer status
   */
  async bulkUpdateStatus(customerIds: string[], status: CustomerStatus): Promise<number> {
    const result = await db.customer.updateMany({
      where: {
        id: { in: customerIds },
      },
      data: { status },
    });

    return result.count;
  }

  /**
   * Bulk add tags
   */
  async bulkAddTags(customerIds: string[], tags: string[]): Promise<void> {
    for (const customerId of customerIds) {
      const customer = await db.customer.findUnique({
        where: { id: customerId },
      });

      if (customer) {
        const existingTags = customer.tags ? customer.tags.split(',') : [];
        const newTags = [...new Set([...existingTags, ...tags])];
        
        await db.customer.update({
          where: { id: customerId },
          data: { tags: newTags.join(',') },
        });
      }
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

let customerServiceInstance: CustomerService | null = null;

export function getCustomerService(): CustomerService {
  if (!customerServiceInstance) {
    customerServiceInstance = new CustomerService();
  }
  return customerServiceInstance;
}

export function createCustomerService(): CustomerService {
  return new CustomerService();
}
