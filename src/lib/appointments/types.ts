/**
 * Appointments Module - Types
 * SaaSWPP AI Platform - Appointment Management Types
 */

// ============================================
// APPOINTMENT STATUS TYPES
// ============================================

export type AppointmentStatusType = 
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type AppointmentOrigin = 
  | 'MANUAL'
  | 'WHATSAPP'
  | 'API'
  | 'IMPORT';

export type AppointmentMode = 
  | 'AUTO'      // AI-scheduled
  | 'MANUAL'    // Human-scheduled
  | 'HYBRID';   // AI suggested, human confirmed

// ============================================
// APPOINTMENT INPUT TYPES
// ============================================

export interface AppointmentBase {
  title?: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  serviceTypeId?: string;
  assignedUserId?: string;
}

export interface AppointmentCreateInput extends AppointmentBase {
  tenantId: string;
  customerId: string;
  conversationId?: string;
  mode?: AppointmentMode;
  origin?: AppointmentOrigin;
}

export interface AppointmentUpdateInput {
  title?: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
  status?: AppointmentStatusType;
  serviceTypeId?: string;
  assignedUserId?: string;
}

export interface AppointmentRescheduleInput {
  newStartAt: Date;
  newEndAt: Date;
  reason?: string;
  notifyCustomer?: boolean;
}

// ============================================
// AVAILABILITY TYPES
// ============================================

export interface TimeSlot {
  startAt: Date;
  endAt: Date;
  available: boolean;
  availableSpaces?: number;
  totalSpaces?: number;
}

export interface AvailabilityRule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  slotDuration: number; // in minutes
  breakBetweenSlots: number; // in minutes
  maxConcurrent: number;
}

export interface WorkingHours {
  enabled: boolean;
  timezone: string;
  rules: AvailabilityRule[];
  blockedDates: string[]; // ISO date strings
  specialHours: Array<{
    date: string; // ISO date string
    startTime?: string;
    endTime?: string;
    closed?: boolean;
  }>;
}

export interface AvailabilityCheckResult {
  available: boolean;
  conflictingAppointments: Array<{
    id: string;
    title?: string;
    startAt: Date;
    endAt: Date;
  }>;
  suggestedAlternatives: TimeSlot[];
}

export interface AvailabilitySearchParams {
  tenantId: string;
  date: Date;
  serviceTypeId?: string;
  assignedUserId?: string;
  slotDuration?: number;
}

// ============================================
// CONFLICT HANDLING TYPES
// ============================================

export type ConflictResolutionStrategy = 
  | 'REJECT'      // Reject new appointment
  | 'OVERRIDE'    // Override conflicting appointments
  | 'SUGGEST'     // Suggest alternative times
  | 'QUEUE';      // Add to waitlist

export interface ConflictDetails {
  hasConflict: boolean;
  conflicts: Array<{
    appointmentId: string;
    title?: string;
    startAt: Date;
    endAt: Date;
    customerId: string;
    customerName: string;
    overlapMinutes: number;
  }>;
  resolution?: ConflictResolutionStrategy;
}

export interface ConflictResolution {
  resolved: boolean;
  action: ConflictResolutionStrategy;
  affectedAppointments?: string[];
  message?: string;
}

// ============================================
// REMINDER TYPES
// ============================================

export type ReminderChannel = 'WHATSAPP' | 'SMS' | 'EMAIL';
export type ReminderTiming = 'IMMEDIATE' | 'HOURS_BEFORE' | 'DAYS_BEFORE';

export interface ReminderConfig {
  enabled: boolean;
  channels: ReminderChannel[];
  timings: Array<{
    timing: ReminderTiming;
    value: number; // hours/days before
  }>;
  template?: string;
}

export interface ReminderSchedule {
  appointmentId: string;
  reminders: Array<{
    scheduledAt: Date;
    channel: ReminderChannel;
    status: 'PENDING' | 'SENT' | 'FAILED';
    sentAt?: Date;
    error?: string;
  }>;
}

export interface ReminderResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}

// ============================================
// SERVICE TYPE TYPES
// ============================================

export interface ServiceTypeBase {
  name: string;
  description?: string;
  duration: number; // in minutes
  bufferBefore?: number; // in minutes
  bufferAfter?: number; // in minutes
  price?: number;
  maxConcurrent?: number;
  color?: string;
}

export interface ServiceTypeCreateInput extends ServiceTypeBase {
  tenantId: string;
}

export interface ServiceTypeUpdateInput extends ServiceTypeBase {
  name?: string;
  duration?: number;
}

export interface ServiceType extends ServiceTypeBase {
  id: string;
  tenantId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// APPOINTMENT SEARCH TYPES
// ============================================

export interface AppointmentSearchParams {
  tenantId: string;
  customerId?: string;
  status?: AppointmentStatusType | AppointmentStatusType[];
  startAtFrom?: Date;
  startAtTo?: Date;
  assignedUserId?: string;
  serviceTypeId?: string;
  origin?: AppointmentOrigin;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface AppointmentWithDetails {
  id: string;
  title?: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatusType;
  mode: AppointmentMode;
  origin: AppointmentOrigin;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    phoneE164: string;
    email?: string;
  };
  serviceType?: {
    id: string;
    name: string;
    duration: number;
  };
  conversation?: {
    id: string;
    status: string;
  };
}

// ============================================
// CALENDAR TYPES
// ============================================

export interface CalendarDay {
  date: Date;
  appointments: AppointmentWithDetails[];
  hasAvailableSlots: boolean;
  totalAppointments: number;
  completedCount: number;
  cancelledCount: number;
}

export interface CalendarWeek {
  startDate: Date;
  endDate: Date;
  days: CalendarDay[];
  totalAppointments: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
  totalAppointments: number;
  stats: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AppointmentMetrics {
  totalAppointments: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageLeadTime: number; // hours between scheduling and appointment
  averageDuration: number; // minutes
  peakHours: number[];
  peakDays: number[];
}

export interface AppointmentStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pendingConfirmations: number;
  upcoming: number;
  completedToday: number;
  cancelledToday: number;
}

// ============================================
// ERROR CLASSES
// ============================================

export class AppointmentNotFoundError extends Error {
  constructor(appointmentId: string) {
    super(`Appointment not found: ${appointmentId}`);
    this.name = 'AppointmentNotFoundError';
  }
}

export class AppointmentConflictError extends Error {
  constructor(
    public conflicts: ConflictDetails['conflicts']
  ) {
    super(`Appointment conflicts with ${conflicts.length} existing appointment(s)`);
    this.name = 'AppointmentConflictError';
  }
}

export class InvalidTimeSlotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTimeSlotError';
  }
}

export class OutsideWorkingHoursError extends Error {
  constructor(startAt: Date, endAt: Date) {
    super(`Appointment time ${startAt.toISOString()} - ${endAt.toISOString()} is outside working hours`);
    this.name = 'OutsideWorkingHoursError';
  }
}

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  enabled: true,
  timezone: 'America/Sao_Paulo',
  rules: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotDuration: 60, breakBetweenSlots: 0, maxConcurrent: 1 },
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', slotDuration: 60, breakBetweenSlots: 0, maxConcurrent: 1 },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', slotDuration: 60, breakBetweenSlots: 0, maxConcurrent: 1 },
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', slotDuration: 60, breakBetweenSlots: 0, maxConcurrent: 1 },
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', slotDuration: 60, breakBetweenSlots: 0, maxConcurrent: 1 },
  ],
  blockedDates: [],
  specialHours: [],
};

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: true,
  channels: ['WHATSAPP'],
  timings: [
    { timing: 'HOURS_BEFORE', value: 24 },
    { timing: 'HOURS_BEFORE', value: 2 },
  ],
  template: 'Olá! Lembrete do seu agendamento: {{title}} em {{datetime}}. Confirme respondendo SIM.',
};
