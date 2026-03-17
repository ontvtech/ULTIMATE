import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

// ============================================
// Class Name Utility (existing)
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Date Formatting Utilities
// ============================================

/**
 * Format a date in Brazilian Portuguese format
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = "dd/MM/yyyy"
): string {
  if (!date) return "-"
  
  const dateObj = typeof date === "string" ? parseISO(date) : date
  
  if (!isValid(dateObj)) return "-"
  
  return format(dateObj, formatStr, { locale: ptBR })
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  formatStr: string = "dd/MM/yyyy HH:mm"
): string {
  return formatDate(date, formatStr)
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "-"
  
  const dateObj = typeof date === "string" ? parseISO(date) : date
  
  if (!isValid(dateObj)) return "-"
  
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR })
}

/**
 * Format a date for display in conversation lists
 */
export function formatConversationDate(date: Date | string | null | undefined): string {
  if (!date) return "-"
  
  const dateObj = typeof date === "string" ? parseISO(date) : date
  
  if (!isValid(dateObj)) return "-"
  
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // Today - show time
    return format(dateObj, "HH:mm", { locale: ptBR })
  } else if (diffDays === 1) {
    return "Ontem"
  } else if (diffDays < 7) {
    return format(dateObj, "EEEE", { locale: ptBR })
  } else {
    return format(dateObj, "dd/MM", { locale: ptBR })
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) return false
  
  const today = new Date()
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

// ============================================
// Currency Formatting (BRL)
// ============================================

/**
 * Format a number as Brazilian Real currency
 */
export function formatCurrency(
  value: number | null | undefined,
  options?: { compact?: boolean }
): string {
  if (value === null || value === undefined) return "R$ 0,00"
  
  if (options?.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Parse a BRL currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol and spaces
  const cleaned = value.replace(/[R$\s]/g, "")
  
  // Replace comma with dot for decimal
  const normalized = cleaned.replace(/\./g, "").replace(",", ".")
  
  return parseFloat(normalized) || 0
}

// ============================================
// Brazilian Phone Formatting
// ============================================

/**
 * Format a phone number in Brazilian format
 * Supports both mobile (11 digits) and landline (10 digits)
 */
export function formatPhone(
  phone: string | null | undefined,
  options?: { includeCountryCode?: boolean }
): string {
  if (!phone) return ""
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")
  
  // Check if it has country code
  const hasCountryCode = digits.length === 13 || digits.length === 12
  const cleanDigits = hasCountryCode ? digits.slice(2) : digits
  
  // Mobile: (XX) 9XXXX-XXXX (11 digits with country code, 11 without)
  // Landline: (XX) XXXX-XXXX (10 digits)
  
  if (cleanDigits.length === 11) {
    // Mobile with 9th digit
    const formatted = `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 7)}-${cleanDigits.slice(7)}`
    return options?.includeCountryCode && hasCountryCode ? `+55 ${formatted}` : formatted
  } else if (cleanDigits.length === 10) {
    // Landline or mobile without 9th digit
    const formatted = `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 6)}-${cleanDigits.slice(6)}`
    return options?.includeCountryCode && hasCountryCode ? `+55 ${formatted}` : formatted
  } else if (cleanDigits.length === 9) {
    // Mobile without area code
    return `${cleanDigits.slice(0, 5)}-${cleanDigits.slice(5)}`
  } else if (cleanDigits.length === 8) {
    // Landline without area code
    return `${cleanDigits.slice(0, 4)}-${cleanDigits.slice(4)}`
  }
  
  // Return original if can't format
  return phone
}

/**
 * Convert phone to E.164 format
 */
export function phoneToE164(phone: string | null | undefined): string | null {
  if (!phone) return null
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")
  
  // If it already has country code
  if (digits.startsWith("55") && (digits.length === 13 || digits.length === 12)) {
    return `+${digits}`
  }
  
  // Add Brazilian country code
  if (digits.length === 11 || digits.length === 10) {
    return `+55${digits}`
  }
  
  return null
}

/**
 * Validate Brazilian phone number
 */
export function isValidBrazilianPhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  
  const digits = phone.replace(/\D/g, "")
  
  // Valid lengths: 10 (landline), 11 (mobile), 12 (with 55), 13 (with 55 + mobile)
  if (digits.length === 10 || digits.length === 11) {
    return true
  }
  
  if (digits.length === 12 || digits.length === 13) {
    return digits.startsWith("55")
  }
  
  return false
}

// ============================================
// Slug Generation
// ============================================

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace accented characters
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace spaces and special chars with hyphens
    .replace(/[^a-z0-9]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Limit length
    .slice(0, 100)
}

/**
 * Generate a unique slug with a suffix if needed
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[],
  maxAttempts: number = 100
): string {
  let slug = generateSlug(text)
  let counter = 1
  
  while (existingSlugs.includes(slug) && counter <= maxAttempts) {
    slug = `${generateSlug(text)}-${counter}`
    counter++
  }
  
  return slug
}

// ============================================
// Text Truncation
// ============================================

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(
  text: string | null | undefined,
  maxLength: number = 100,
  options?: { ellipsis?: string; wordBoundary?: boolean }
): string {
  if (!text) return ""
  
  const ellipsis = options?.ellipsis || "..."
  
  if (text.length <= maxLength) return text
  
  if (options?.wordBoundary) {
    // Find the last space before maxLength
    const truncated = text.slice(0, maxLength)
    const lastSpace = truncated.lastIndexOf(" ")
    
    if (lastSpace > 0) {
      return truncated.slice(0, lastSpace) + ellipsis
    }
  }
  
  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Truncate text in the middle (useful for IDs, emails, etc.)
 */
export function truncateMiddle(
  text: string | null | undefined,
  maxLength: number = 20
): string {
  if (!text) return ""
  
  if (text.length <= maxLength) return text
  
  const start = Math.ceil(maxLength / 2)
  const end = Math.floor(maxLength / 2)
  
  return `${text.slice(0, start)}...${text.slice(-end)}`
}

// ============================================
// Brazilian Document Formatting
// ============================================

/**
 * Format a CPF (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return ""
  
  const digits = cpf.replace(/\D/g, "")
  
  if (digits.length !== 11) return cpf
  
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/**
 * Format a CNPJ (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return ""
  
  const digits = cnpj.replace(/\D/g, "")
  
  if (digits.length !== 14) return cnpj
  
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

/**
 * Format a document (CPF or CNPJ) automatically
 */
export function formatDocument(doc: string | null | undefined): string {
  if (!doc) return ""
  
  const digits = doc.replace(/\D/g, "")
  
  if (digits.length === 11) {
    return formatCPF(digits)
  } else if (digits.length === 14) {
    return formatCNPJ(digits)
  }
  
  return doc
}

/**
 * Validate CPF
 */
export function isValidCPF(cpf: string | null | undefined): boolean {
  if (!cpf) return false
  
  const digits = cpf.replace(/\D/g, "")
  
  if (digits.length !== 11) return false
  
  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(digits)) return false
  
  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false
  
  return true
}

/**
 * Validate CNPJ
 */
export function isValidCNPJ(cnpj: string | null | undefined): boolean {
  if (!cnpj) return false
  
  const digits = cnpj.replace(/\D/g, "")
  
  if (digits.length !== 14) return false
  
  // Check for known invalid patterns
  if (/^(\d)\1{13}$/.test(digits)) return false
  
  // Validate check digits
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i]
  }
  
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder
  if (digit1 !== parseInt(digits[12])) return false
  
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i]
  }
  
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder
  if (digit2 !== parseInt(digits[13])) return false
  
  return true
}

// ============================================
// String Utilities
// ============================================

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return ""
  
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Get initials from a name
 */
export function getInitials(name: string | null | undefined, maxInitials: number = 2): string {
  if (!name) return ""
  
  const words = name.trim().split(/\s+/)
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return words
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

// ============================================
// Number Utilities
// ============================================

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number | null | undefined,
  options?: { decimals?: number; locale?: string }
): string {
  if (value === null || value === undefined) return "0"
  
  return new Intl.NumberFormat(options?.locale || "pt-BR", {
    maximumFractionDigits: options?.decimals ?? 2,
    minimumFractionDigits: options?.decimals ?? 0,
  }).format(value)
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined) return "0%"
  
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ============================================
// Object Utilities
// ============================================

/**
 * Pick specific keys from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  
  return result
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  
  for (const key of keys) {
    delete result[key]
  }
  
  return result
}

// ============================================
// Async Utilities
// ============================================

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number
    delayMs?: number
    backoffFactor?: number
    maxDelayMs?: number
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 3
  const delayMs = options?.delayMs ?? 1000
  const backoffFactor = options?.backoffFactor ?? 2
  const maxDelayMs = options?.maxDelayMs ?? 30000
  
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxAttempts) {
        const delay = Math.min(delayMs * Math.pow(backoffFactor, attempt - 1), maxDelayMs)
        await sleep(delay)
      }
    }
  }
  
  throw lastError
}

// ============================================
// URL Utilities
// ============================================

/**
 * Safely parse a URL
 */
export function parseUrl(url: string | null | undefined): URL | null {
  if (!url) return null
  
  try {
    return new URL(url)
  } catch {
    return null
  }
}

/**
 * Check if a URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/.test(url)
}

/**
 * Join URL path segments
 */
export function joinUrlPath(...segments: string[]): string {
  return segments
    .map((segment, index) => {
      // Remove leading slash for all but the first segment
      if (index > 0) {
        segment = segment.replace(/^\/+/, "")
      }
      // Remove trailing slash for all segments
      return segment.replace(/\/+$/, "")
    })
    .filter(Boolean)
    .join("/")
}
