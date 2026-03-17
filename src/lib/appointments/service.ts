/**
 * Appointments Module - Service
 * SaaSWPP AI Platform - Appointment Management Business Logic
 */

import { db } from '@/lib/db';
import { 
  Appointment,
  Customer,
  Conversation,
  AppointmentStatus,
} from '@prisma/client';
import {
  AppointmentCreateInput,
  AppointmentUpdateInput,
  AppointmentRescheduleInput,
  AppointmentSearchParams,
  AppointmentWithDetails,
  AppointmentStatusType,
  AvailabilityCheckResult,
  AvailabilitySearchParams,
  TimeSlot,
  ConflictDetails,
  ConflictResolution,
  ConflictResolutionStrategy,
  ReminderConfig,
  ReminderResult,
  ReminderSchedule,
  AppointmentNotFoundError,
  AppointmentConflictError,
  InvalidTimeSlotError,
  OutsideWorkingHoursError,
  DEFAULT_WORKING_HOURS,
  DEFAULT_REMINDER_CONFIG,
  WorkingHours,
  AppointmentMetrics,
  AppointmentStats,
  CalendarDay,
  CalendarWeek,
  CalendarMonth,
} from './types';

// ============================================
// APPOINTMENT SERVICE CLASS
// ============================================

export class AppointmentService {
  // ============================================
  // APPOINTMENT MANAGEMENT
  // ============================================

  /**
   * Create a new appointment
   */
  async createAppointment(input: AppointmentCreateInput): Promise<Appointment> {
    // Validate time slot
    if (input.startAt >= input.endAt) {
      throw new InvalidTimeSlotError('Start time must be before end time');
    }

    // Check if start time is in the past
    if (input.startAt < new Date()) {
      throw new InvalidTimeSlotError('Cannot create appointment in the past');
    }

    // Verify customer exists
    const customer = await db.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new Error(`Customer not found: ${input.customerId}`);
    }

    // Check availability
    const availabilityCheck = await this.checkAvailability({
      tenantId: input.tenantId,
      date: input.startAt,
      serviceTypeId: input.serviceTypeId,
      assignedUserId: input.assignedUserId,
    });

    // Check for conflicts
    const conflictDetails = await this.detectConflicts(
      input.tenantId,
      input.startAt,
      input.endAt,
      input.assignedUserId,
      undefined // new appointment has no ID
    );

    if (conflictDetails.hasConflict) {
      throw new AppointmentConflictError(conflictDetails.conflicts);
    }

    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        tenantId: input.tenantId,
        customerId: input.customerId,
        conversationId: input.conversationId,
        title: input.title,
        description: input.description,
        startAt: input.startAt,
        endAt: input.endAt,
        status: AppointmentStatus.SCHEDULED,
        mode: input.mode ?? 'AUTO',
        serviceTypeId: input.serviceTypeId,
        assignedUserId: input.assignedUserId,
        origin: input.origin ?? 'MANUAL',
      },
      include: {
        customer: true,
      },
    });

    // Schedule reminders
    await this.scheduleReminders(appointment.id, input.tenantId);

    return appointment;
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(appointmentId: string): Promise<AppointmentWithDetails | null> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneE164: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) return null;

    return {
      id: appointment.id,
      title: appointment.title ?? undefined,
      description: appointment.description ?? undefined,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      status: appointment.status as AppointmentStatusType,
      mode: appointment.mode as AppointmentWithDetails['mode'],
      origin: appointment.origin as AppointmentWithDetails['origin'],
      createdAt: appointment.createdAt,
      customer: {
        id: appointment.customer.id,
        name: appointment.customer.name,
        phoneE164: appointment.customer.phoneE164,
        email: appointment.customer.email ?? undefined,
      },
      conversation: appointment.conversationId
        ? {
            id: appointment.conversationId,
            status: 'OPEN', // Default status since we don't have the full relation
          }
        : undefined,
    };
  }

  /**
   * Update appointment
   */
  async updateAppointment(appointmentId: string, input: AppointmentUpdateInput): Promise<Appointment> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.serviceTypeId !== undefined) updateData.serviceTypeId = input.serviceTypeId;
    if (input.assignedUserId !== undefined) updateData.assignedUserId = input.assignedUserId;

    // Handle time changes
    if (input.startAt !== undefined || input.endAt !== undefined) {
      const newStartAt = input.startAt ?? appointment.startAt;
      const newEndAt = input.endAt ?? appointment.endAt;

      if (newStartAt >= newEndAt) {
        throw new InvalidTimeSlotError('Start time must be before end time');
      }

      // Check for conflicts with new times
      const conflictDetails = await this.detectConflicts(
        appointment.tenantId,
        newStartAt,
        newEndAt,
        input.assignedUserId ?? appointment.assignedUserId,
        appointmentId
      );

      if (conflictDetails.hasConflict) {
        throw new AppointmentConflictError(conflictDetails.conflicts);
      }

      updateData.startAt = newStartAt;
      updateData.endAt = newEndAt;
    }

    // Handle status change
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    return db.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    input: AppointmentRescheduleInput
  ): Promise<Appointment> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    // Validate new time
    if (input.newStartAt >= input.newEndAt) {
      throw new InvalidTimeSlotError('Start time must be before end time');
    }

    // Check for conflicts
    const conflictDetails = await this.detectConflicts(
      appointment.tenantId,
      input.newStartAt,
      input.newEndAt,
      appointment.assignedUserId,
      appointmentId
    );

    if (conflictDetails.hasConflict) {
      throw new AppointmentConflictError(conflictDetails.conflicts);
    }

    // Update appointment
    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        startAt: input.newStartAt,
        endAt: input.newEndAt,
        status: AppointmentStatus.SCHEDULED, // Reset to scheduled on reschedule
      },
    });

    // Reschedule reminders
    await this.scheduleReminders(appointmentId, appointment.tenantId);

    // Notify customer if requested
    if (input.notifyCustomer) {
      await this.sendRescheduleNotification(appointmentId, input.reason);
    }

    return updated;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    return db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        description: reason
          ? `${appointment.description ?? ''}\nCancellation reason: ${reason}`.trim()
          : appointment.description,
      },
    });
  }

  /**
   * Confirm appointment
   */
  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    return db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CONFIRMED,
      },
    });
  }

  /**
   * Mark appointment as completed
   */
  async completeAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    return db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.COMPLETED,
      },
    });
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(appointmentId: string): Promise<Appointment> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    return db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.NO_SHOW,
      },
    });
  }

  // ============================================
  // AVAILABILITY MANAGEMENT
  // ============================================

  /**
   * Check availability for a time slot
   */
  async checkAvailability(params: AvailabilitySearchParams): Promise<AvailabilityCheckResult> {
    const workingHours = await this.getWorkingHours(params.tenantId);
    const date = new Date(params.date);
    
    // Check if date is within working hours
    const isWithinWorkingHours = this.isWithinWorkingHours(date, workingHours);
    
    // Get existing appointments for the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await db.appointment.findMany({
      where: {
        tenantId: params.tenantId,
        startAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
        ...(params.assignedUserId && { assignedUserId: params.assignedUserId }),
      },
      orderBy: { startAt: 'asc' },
    });

    // Find conflicting appointments
    const slotDuration = params.slotDuration ?? 60;
    const slotEnd = new Date(date.getTime() + slotDuration * 60 * 1000);

    const conflictingAppointments = existingAppointments.filter((apt) => {
      return (
        (date >= apt.startAt && date < apt.endAt) ||
        (slotEnd > apt.startAt && slotEnd <= apt.endAt) ||
        (date <= apt.startAt && slotEnd >= apt.endAt)
      );
    });

    // Generate suggested alternatives
    const suggestedAlternatives = await this.generateAlternatives(
      params,
      existingAppointments,
      workingHours
    );

    return {
      available: isWithinWorkingHours && conflictingAppointments.length === 0,
      conflictingAppointments: conflictingAppointments.map((apt) => ({
        id: apt.id,
        title: apt.title ?? undefined,
        startAt: apt.startAt,
        endAt: apt.endAt,
      })),
      suggestedAlternatives,
    };
  }

  /**
   * Get available time slots for a day
   */
  async getAvailableSlots(params: AvailabilitySearchParams): Promise<TimeSlot[]> {
    const workingHours = await this.getWorkingHours(params.tenantId);
    const date = new Date(params.date);
    const dayOfWeek = date.getDay();
    
    // Find rule for this day
    const rule = workingHours.rules.find((r) => r.dayOfWeek === dayOfWeek);
    
    if (!rule) {
      return []; // No working hours for this day
    }

    // Check if date is blocked
    const dateStr = date.toISOString().split('T')[0];
    if (workingHours.blockedDates.includes(dateStr)) {
      return [];
    }

    // Check for special hours
    const specialHour = workingHours.specialHours.find((sh) => sh.date === dateStr);
    if (specialHour?.closed) {
      return [];
    }

    const startTime = specialHour?.startTime ?? rule.startTime;
    const endTime = specialHour?.endTime ?? rule.endTime;

    // Generate slots
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentSlot = new Date(date);
    currentSlot.setHours(startHour, startMin, 0, 0);

    const endSlot = new Date(date);
    endSlot.setHours(endHour, endMin, 0, 0);

    const slotDuration = params.slotDuration ?? rule.slotDuration;
    const breakBetween = rule.breakBetweenSlots;

    // Get existing appointments
    const existingAppointments = await db.appointment.findMany({
      where: {
        tenantId: params.tenantId,
        startAt: {
          gte: currentSlot,
          lt: endSlot,
        },
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
        ...(params.assignedUserId && { assignedUserId: params.assignedUserId }),
      },
    });

    while (currentSlot < endSlot) {
      const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60 * 1000);

      if (slotEnd > endSlot) break;

      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some((apt) => {
        return (
          (currentSlot >= apt.startAt && currentSlot < apt.endAt) ||
          (slotEnd > apt.startAt && slotEnd <= apt.endAt) ||
          (currentSlot <= apt.startAt && slotEnd >= apt.endAt)
        );
      });

      slots.push({
        startAt: new Date(currentSlot),
        endAt: slotEnd,
        available: !hasConflict,
      });

      // Move to next slot
      currentSlot = new Date(currentSlot.getTime() + (slotDuration + breakBetween) * 60 * 1000);
    }

    return slots;
  }

  /**
   * Get working hours configuration for tenant
   */
  private async getWorkingHours(tenantId: string): Promise<WorkingHours> {
    // In a real implementation, this would be stored in tenant settings
    // For now, return default configuration
    return DEFAULT_WORKING_HOURS;
  }

  /**
   * Check if date is within working hours
   */
  private isWithinWorkingHours(date: Date, workingHours: WorkingHours): boolean {
    const dayOfWeek = date.getDay();
    const rule = workingHours.rules.find((r) => r.dayOfWeek === dayOfWeek);

    if (!rule) return false;

    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    return timeStr >= rule.startTime && timeStr <= rule.endTime;
  }

  /**
   * Generate alternative time slots
   */
  private async generateAlternatives(
    params: AvailabilitySearchParams,
    existingAppointments: Appointment[],
    workingHours: WorkingHours
  ): Promise<TimeSlot[]> {
    const alternatives: TimeSlot[] = [];
    const date = new Date(params.date);
    
    // Look for alternatives on the same day
    const slots = await this.getAvailableSlots(params);
    const availableSlots = slots.filter((s) => s.available);
    
    // Add up to 3 alternative slots
    alternatives.push(...availableSlots.slice(0, 3));

    // If not enough slots on same day, check next day
    if (alternatives.length < 3) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const nextDaySlots = await this.getAvailableSlots({
        ...params,
        date: nextDay,
      });
      
      alternatives.push(...nextDaySlots.filter((s) => s.available).slice(0, 3 - alternatives.length));
    }

    return alternatives;
  }

  // ============================================
  // CONFLICT HANDLING
  // ============================================

  /**
   * Detect scheduling conflicts
   */
  async detectConflicts(
    tenantId: string,
    startAt: Date,
    endAt: Date,
    assignedUserId?: string | null,
    excludeAppointmentId?: string
  ): Promise<ConflictDetails> {
    // Find overlapping appointments
    const overlappingAppointments = await db.appointment.findMany({
      where: {
        tenantId,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
        OR: [
          // New appointment starts during existing
          {
            AND: [
              { startAt: { lte: startAt } },
              { endAt: { gt: startAt } },
            ],
          },
          // New appointment ends during existing
          {
            AND: [
              { startAt: { lt: endAt } },
              { endAt: { gte: endAt } },
            ],
          },
          // New appointment completely contains existing
          {
            AND: [
              { startAt: { gte: startAt } },
              { endAt: { lte: endAt } },
            ],
          },
        ],
        ...(assignedUserId && { assignedUserId }),
        ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
      },
      include: {
        customer: true,
      },
    });

    const conflicts = overlappingAppointments.map((apt) => {
      // Calculate overlap minutes
      const overlapStart = new Date(Math.max(startAt.getTime(), apt.startAt.getTime()));
      const overlapEnd = new Date(Math.min(endAt.getTime(), apt.endAt.getTime()));
      const overlapMinutes = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));

      return {
        appointmentId: apt.id,
        title: apt.title ?? undefined,
        startAt: apt.startAt,
        endAt: apt.endAt,
        customerId: apt.customerId,
        customerName: apt.customer.name,
        overlapMinutes,
      };
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Handle conflict with specified resolution strategy
   */
  async handleConflict(
    tenantId: string,
    startAt: Date,
    endAt: Date,
    strategy: ConflictResolutionStrategy,
    assignedUserId?: string | null,
    excludeAppointmentId?: string
  ): Promise<ConflictResolution> {
    const conflictDetails = await this.detectConflicts(
      tenantId,
      startAt,
      endAt,
      assignedUserId,
      excludeAppointmentId
    );

    if (!conflictDetails.hasConflict) {
      return {
        resolved: true,
        action: 'REJECT',
        message: 'No conflicts detected',
      };
    }

    switch (strategy) {
      case 'REJECT':
        return {
          resolved: false,
          action: 'REJECT',
          message: `Rejected due to ${conflictDetails.conflicts.length} conflicting appointment(s)`,
        };

      case 'OVERRIDE':
        // Cancel conflicting appointments
        const affectedIds: string[] = [];
        for (const conflict of conflictDetails.conflicts) {
          await db.appointment.update({
            where: { id: conflict.appointmentId },
            data: { status: AppointmentStatus.CANCELLED },
          });
          affectedIds.push(conflict.appointmentId);
        }
        return {
          resolved: true,
          action: 'OVERRIDE',
          affectedAppointments: affectedIds,
          message: `Cancelled ${affectedIds.length} conflicting appointment(s)`,
        };

      case 'SUGGEST':
        // Return suggested alternatives
        const availabilityCheck = await this.checkAvailability({
          tenantId,
          date: startAt,
          assignedUserId: assignedUserId ?? undefined,
        });
        return {
          resolved: false,
          action: 'SUGGEST',
          message: `${availabilityCheck.suggestedAlternatives.length} alternative slots available`,
        };

      case 'QUEUE':
        // In a real implementation, this would add to a waitlist
        return {
          resolved: true,
          action: 'QUEUE',
          message: 'Added to waitlist',
        };

      default:
        return {
          resolved: false,
          action: 'REJECT',
          message: 'Unknown conflict resolution strategy',
        };
    }
  }

  // ============================================
  // REMINDERS
  // ============================================

  /**
   * Schedule reminders for an appointment
   */
  async scheduleReminders(appointmentId: string, tenantId: string): Promise<ReminderSchedule> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { customer: true },
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    const config = await this.getReminderConfig(tenantId);
    const reminders: ReminderSchedule['reminders'] = [];

    for (const timing of config.timings) {
      let scheduledAt: Date;

      switch (timing.timing) {
        case 'IMMEDIATE':
          scheduledAt = new Date();
          break;
        case 'HOURS_BEFORE':
          scheduledAt = new Date(appointment.startAt.getTime() - timing.value * 60 * 60 * 1000);
          break;
        case 'DAYS_BEFORE':
          scheduledAt = new Date(appointment.startAt.getTime() - timing.value * 24 * 60 * 60 * 1000);
          break;
        default:
          continue;
      }

      // Only schedule if in the future
      if (scheduledAt > new Date()) {
        for (const channel of config.channels) {
          reminders.push({
            scheduledAt,
            channel,
            status: 'PENDING',
          });
        }
      }
    }

    // In a real implementation, this would schedule jobs in a queue
    // For now, we just return the schedule
    return {
      appointmentId,
      reminders,
    };
  }

  /**
   * Send reminders for pending appointments
   */
  async sendReminders(tenantId: string): Promise<ReminderResult> {
    const now = new Date();
    const result: ReminderResult = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [],
    };

    // Get appointments needing reminders in the next 48 hours
    const appointments = await db.appointment.findMany({
      where: {
        tenantId,
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
        startAt: {
          gte: now,
          lte: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        },
      },
      include: {
        customer: true,
      },
    });

    const config = await this.getReminderConfig(tenantId);

    for (const appointment of appointments) {
      try {
        // Check if reminder should be sent now
        for (const timing of config.timings) {
          let reminderTime: Date;

          switch (timing.timing) {
            case 'HOURS_BEFORE':
              reminderTime = new Date(appointment.startAt.getTime() - timing.value * 60 * 60 * 1000);
              break;
            case 'DAYS_BEFORE':
              reminderTime = new Date(appointment.startAt.getTime() - timing.value * 24 * 60 * 60 * 1000);
              break;
            default:
              continue;
          }

          // If reminder time is within the last 5 minutes, send it
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
          if (reminderTime >= fiveMinutesAgo && reminderTime <= now) {
            await this.sendReminderMessage(appointment, config);
            result.sent++;
          }
        }
      } catch (error) {
        result.failed++;
        result.errors.push(
          `Failed to send reminder for appointment ${appointment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    if (result.failed > 0) {
      result.success = false;
    }

    return result;
  }

  /**
   * Send a reminder message
   */
  private async sendReminderMessage(
    appointment: Appointment & { customer: Customer },
    config: ReminderConfig
  ): Promise<void> {
    // Format the message
    const template = config.template ?? 'Lembrete: {{title}} em {{datetime}}';
    const message = template
      .replace('{{title}}', appointment.title ?? 'Agendamento')
      .replace('{{datetime}}', appointment.startAt.toLocaleString('pt-BR'));

    // In a real implementation, this would send via WhatsApp/SMS/Email
    // For now, we just log it
    console.log(`Sending reminder to ${appointment.customer.phoneE164}: ${message}`);
  }

  /**
   * Get reminder configuration for tenant
   */
  private async getReminderConfig(tenantId: string): Promise<ReminderConfig> {
    // In a real implementation, this would be stored in tenant settings
    return DEFAULT_REMINDER_CONFIG;
  }

  /**
   * Send reschedule notification
   */
  private async sendRescheduleNotification(appointmentId: string, reason?: string): Promise<void> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { customer: true },
    });

    if (!appointment) return;

    const message = `Seu agendamento foi remarcado para ${appointment.startAt.toLocaleString('pt-BR')}${
      reason ? `. Motivo: ${reason}` : ''
    }`;

    // In a real implementation, this would send via WhatsApp
    console.log(`Sending reschedule notification to ${appointment.customer.phoneE164}: ${message}`);
  }

  // ============================================
  // SEARCH & LISTING
  // ============================================

  /**
   * Search appointments
   */
  async searchAppointments(params: AppointmentSearchParams): Promise<{ appointments: AppointmentWithDetails[]; total: number }> {
    const where: Record<string, unknown> = {
      tenantId: params.tenantId,
    };

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.status) {
      if (Array.isArray(params.status)) {
        where.status = { in: params.status };
      } else {
        where.status = params.status;
      }
    }

    if (params.assignedUserId) {
      where.assignedUserId = params.assignedUserId;
    }

    if (params.serviceTypeId) {
      where.serviceTypeId = params.serviceTypeId;
    }

    if (params.origin) {
      where.origin = params.origin;
    }

    if (params.startAtFrom || params.startAtTo) {
      where.startAt = {};
      if (params.startAtFrom) where.startAt.gte = params.startAtFrom;
      if (params.startAtTo) where.startAt.lte = params.startAtTo;
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phoneE164: true,
              email: true,
            },
          },
          conversation: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { startAt: 'asc' },
        take: params.limit ?? 50,
        skip: params.offset ?? 0,
      }),
      db.appointment.count({ where }),
    ]);

    return {
      appointments: appointments.map((apt) => ({
        id: apt.id,
        title: apt.title ?? undefined,
        description: apt.description ?? undefined,
        startAt: apt.startAt,
        endAt: apt.endAt,
        status: apt.status as AppointmentStatusType,
        mode: apt.mode as AppointmentWithDetails['mode'],
        origin: apt.origin as AppointmentWithDetails['origin'],
        createdAt: apt.createdAt,
        customer: {
          id: apt.customer.id,
          name: apt.customer.name,
          phoneE164: apt.customer.phoneE164,
          email: apt.customer.email ?? undefined,
        },
        conversation: apt.conversation
          ? {
              id: apt.conversation.id,
              status: apt.conversation.status,
            }
          : undefined,
      })),
      total,
    };
  }

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(tenantId: string, limit = 10): Promise<AppointmentWithDetails[]> {
    const { appointments } = await this.searchAppointments({
      tenantId,
      status: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] as AppointmentStatusType[],
      startAtFrom: new Date(),
      limit,
    });

    return appointments;
  }

  /**
   * Get today's appointments
   */
  async getTodayAppointments(tenantId: string): Promise<AppointmentWithDetails[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { appointments } = await this.searchAppointments({
      tenantId,
      startAtFrom: today,
      startAtTo: tomorrow,
      limit: 100,
    });

    return appointments;
  }

  // ============================================
  // CALENDAR VIEWS
  // ============================================

  /**
   * Get calendar for a day
   */
  async getDayCalendar(tenantId: string, date: Date): Promise<CalendarDay> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const { appointments } = await this.searchAppointments({
      tenantId,
      startAtFrom: dayStart,
      startAtTo: dayEnd,
      limit: 100,
    });

    return {
      date: dayStart,
      appointments,
      hasAvailableSlots: appointments.some((a) => a.status === 'SCHEDULED'),
      totalAppointments: appointments.length,
      completedCount: appointments.filter((a) => a.status === 'COMPLETED').length,
      cancelledCount: appointments.filter((a) => a.status === 'CANCELLED').length,
    };
  }

  /**
   * Get calendar for a week
   */
  async getWeekCalendar(tenantId: string, startDate: Date): Promise<CalendarWeek> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    // Adjust to Monday
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + diff);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const days: CalendarDay[] = [];
    let totalAppointments = 0;

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + i);
      
      const dayCalendar = await this.getDayCalendar(tenantId, dayDate);
      days.push(dayCalendar);
      totalAppointments += dayCalendar.totalAppointments;
    }

    return {
      startDate: start,
      endDate: end,
      days,
      totalAppointments,
    };
  }

  /**
   * Get calendar for a month
   */
  async getMonthCalendar(tenantId: string, year: number, month: number): Promise<CalendarMonth> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const weeks: CalendarWeek[] = [];
    let totalAppointments = 0;
    const stats = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
    };

    // Get all appointments for the month
    const { appointments } = await this.searchAppointments({
      tenantId,
      startAtFrom: start,
      startAtTo: end,
      limit: 1000,
    });

    // Count stats
    for (const apt of appointments) {
      switch (apt.status) {
        case 'SCHEDULED':
          stats.scheduled++;
          break;
        case 'CONFIRMED':
          stats.confirmed++;
          break;
        case 'COMPLETED':
          stats.completed++;
          break;
        case 'CANCELLED':
          stats.cancelled++;
          break;
        case 'NO_SHOW':
          stats.noShow++;
          break;
      }
    }

    totalAppointments = appointments.length;

    // Generate weeks
    const firstDay = new Date(start);
    const lastDay = new Date(end);

    // Adjust to first Monday
    const firstDayOfWeek = firstDay.getDay();
    const diff = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    firstDay.setDate(firstDay.getDate() + diff);

    while (firstDay <= lastDay) {
      const week = await this.getWeekCalendar(tenantId, firstDay);
      weeks.push(week);
      firstDay.setDate(firstDay.getDate() + 7);
    }

    return {
      year,
      month,
      weeks,
      totalAppointments,
      stats,
    };
  }

  // ============================================
  // METRICS & ANALYTICS
  // ============================================

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(tenantId: string): Promise<AppointmentStats> {
    const now = new Date();
    
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      todayCount,
      weekCount,
      monthCount,
      pendingConfirmations,
      upcoming,
      completedToday,
      cancelledToday,
    ] = await Promise.all([
      db.appointment.count({
        where: {
          tenantId,
          startAt: { gte: today, lt: tomorrow },
          status: { not: AppointmentStatus.CANCELLED },
        },
      }),
      db.appointment.count({
        where: {
          tenantId,
          startAt: { gte: weekStart, lt: weekEnd },
          status: { not: AppointmentStatus.CANCELLED },
        },
      }),
      db.appointment.count({
        where: {
          tenantId,
          startAt: { gte: monthStart, lte: monthEnd },
          status: { not: AppointmentStatus.CANCELLED },
        },
      }),
      db.appointment.count({
        where: {
          tenantId,
          status: AppointmentStatus.SCHEDULED,
          startAt: { gte: now },
        },
      }),
      db.appointment.count({
        where: {
          tenantId,
          status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
          startAt: { gte: now },
        },
      }),
      db.appointment.count({
        where: {
          tenantId,
          status: AppointmentStatus.COMPLETED,
          startAt: { gte: today, lt: tomorrow },
        },
      }),
      db.appointment.count({
        where: {
          tenantId,
          status: AppointmentStatus.CANCELLED,
          startAt: { gte: today, lt: tomorrow },
        },
      }),
    ]);

    return {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      pendingConfirmations,
      upcoming,
      completedToday,
      cancelledToday,
    };
  }

  /**
   * Get appointment metrics for analytics
   */
  async getAppointmentMetrics(
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AppointmentMetrics> {
    const where: Record<string, unknown> = { tenantId };

    if (startDate || endDate) {
      where.startAt = {};
      if (startDate) where.startAt.gte = startDate;
      if (endDate) where.startAt.lte = endDate;
    }

    const appointments = await db.appointment.findMany({
      where,
      select: {
        status: true,
        startAt: true,
        endAt: true,
        createdAt: true,
      },
    });

    const total = appointments.length;
    
    const statusCounts = {
      scheduled: appointments.filter((a) => a.status === AppointmentStatus.SCHEDULED).length,
      confirmed: appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length,
      completed: appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
      cancelled: appointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length,
      noShow: appointments.filter((a) => a.status === AppointmentStatus.NO_SHOW).length,
    };

    // Calculate average lead time
    let totalLeadTime = 0;
    let leadTimeCount = 0;
    for (const apt of appointments) {
      const leadTime = apt.startAt.getTime() - apt.createdAt.getTime();
      totalLeadTime += leadTime;
      leadTimeCount++;
    }
    const averageLeadTime = leadTimeCount > 0 ? totalLeadTime / leadTimeCount / (1000 * 60 * 60) : 0;

    // Calculate average duration
    let totalDuration = 0;
    for (const apt of appointments) {
      totalDuration += apt.endAt.getTime() - apt.startAt.getTime();
    }
    const averageDuration = total > 0 ? totalDuration / total / (1000 * 60) : 0;

    // Calculate peak hours and days
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};

    for (const apt of appointments) {
      const hour = apt.startAt.getHours();
      const day = apt.startAt.getDay();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }

    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const peakDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => parseInt(day));

    return {
      totalAppointments: total,
      ...statusCounts,
      completionRate: total > 0 ? (statusCounts.completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (statusCounts.cancelled / total) * 100 : 0,
      noShowRate: total > 0 ? (statusCounts.noShow / total) * 100 : 0,
      averageLeadTime,
      averageDuration,
      peakHours,
      peakDays,
    };
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

let appointmentServiceInstance: AppointmentService | null = null;

export function getAppointmentService(): AppointmentService {
  if (!appointmentServiceInstance) {
    appointmentServiceInstance = new AppointmentService();
  }
  return appointmentServiceInstance;
}

export function createAppointmentService(): AppointmentService {
  return new AppointmentService();
}
