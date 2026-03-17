// ============================================
// SaaSWPP AI Platform - Rate Limiting
// ============================================

import { NextResponse } from 'next/server'
import { RateLimitConfig, RateLimitResult, RateLimitIdentifierType } from '@/types'

interface RateLimitEntry {
  count: number
  resetAt: number
  firstRequestAt: number
}

interface SlidingWindowEntry {
  timestamp: number
}

/**
 * In-memory rate limiter with sliding window algorithm
 * Suitable for single-instance deployments. For multi-instance,
 * consider using Redis-based rate limiting.
 */
class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private slidingWindowStore: Map<string, SlidingWindowEntry[]> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if a request is allowed based on rate limit configuration
   */
  check(
    identifier: string,
    config: RateLimitConfig,
    useSlidingWindow: boolean = true
  ): RateLimitResult {
    const key = `${config.keyPrefix || 'rl'}:${identifier}`
    const now = Date.now()
    const windowStart = now - config.windowMs

    if (useSlidingWindow) {
      return this.slidingWindowCheck(key, now, windowStart, config)
    }

    return this.fixedWindowCheck(key, now, config)
  }

  /**
   * Sliding window rate limiting algorithm
   * More accurate but slightly more memory intensive
   */
  private slidingWindowCheck(
    key: string,
    now: number,
    windowStart: number,
    config: RateLimitConfig
  ): RateLimitResult {
    let requests = this.slidingWindowStore.get(key) || []

    // Filter out requests outside the window
    requests = requests.filter((r) => r.timestamp > windowStart)

    const currentCount = requests.length
    const allowed = currentCount < config.maxRequests

    if (allowed) {
      // Add the current request
      requests.push({ timestamp: now })
      this.slidingWindowStore.set(key, requests)
    }

    // Calculate reset time based on oldest request in window
    const oldestRequest = requests.length > 0 ? requests[0].timestamp : now
    const resetAt = new Date(oldestRequest + config.windowMs)

    return {
      allowed,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - currentCount - (allowed ? 1 : 0)),
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil((oldestRequest + config.windowMs - now) / 1000),
    }
  }

  /**
   * Fixed window rate limiting algorithm
   * Simpler but can allow burst at window boundaries
   */
  private fixedWindowCheck(
    key: string,
    now: number,
    config: RateLimitConfig
  ): RateLimitResult {
    let entry = this.store.get(key)
    const windowStart = now - config.windowMs

    // Create new window if expired or doesn't exist
    if (!entry || entry.resetAt <= now) {
      entry = {
        count: 0,
        resetAt: now + config.windowMs,
        firstRequestAt: now,
      }
    }

    const allowed = entry.count < config.maxRequests

    if (allowed) {
      entry.count++
      this.store.set(key, entry)
    }

    return {
      allowed,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetAt: new Date(entry.resetAt),
      retryAfter: allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string, keyPrefix: string = 'rl'): void {
    const key = `${keyPrefix}:${identifier}`
    this.store.delete(key)
    this.slidingWindowStore.delete(key)
  }

  /**
   * Get current rate limit status without incrementing
   */
  peek(identifier: string, config: RateLimitConfig): RateLimitResult {
    const key = `${config.keyPrefix || 'rl'}:${identifier}`
    const now = Date.now()
    const windowStart = now - config.windowMs

    // For sliding window
    const requests = this.slidingWindowStore.get(key) || []
    const currentCount = requests.filter((r) => r.timestamp > windowStart).length

    return {
      allowed: currentCount < config.maxRequests,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - currentCount),
      resetAt: new Date(windowStart + config.windowMs),
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()

    // Clean fixed window store
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key)
      }
    }

    // Clean sliding window store
    const maxAge = 60 * 60 * 1000 // Keep entries for max 1 hour
    for (const [key, requests] of this.slidingWindowStore.entries()) {
      const validRequests = requests.filter((r) => r.timestamp > now - maxAge)
      if (validRequests.length === 0) {
        this.slidingWindowStore.delete(key)
      } else if (validRequests.length !== requests.length) {
        this.slidingWindowStore.set(key, validRequests)
      }
    }
  }

  /**
   * Get statistics about the rate limiter
   */
  getStats(): { fixedWindowEntries: number; slidingWindowEntries: number; memoryUsage: string } {
    let slidingWindowCount = 0
    for (const requests of this.slidingWindowStore.values()) {
      slidingWindowCount += requests.length
    }

    return {
      fixedWindowEntries: this.store.size,
      slidingWindowEntries: slidingWindowCount,
      memoryUsage: `${((this.store.size * 100 + slidingWindowCount * 50) / 1024).toFixed(2)} KB (est.)`,
    }
  }

  /**
   * Destroy the rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
    this.slidingWindowStore.clear()
  }
}

// Singleton instance
let rateLimiterInstance: InMemoryRateLimiter | null = null

/**
 * Get the singleton rate limiter instance
 */
export function getRateLimiter(): InMemoryRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new InMemoryRateLimiter()
  }
  return rateLimiterInstance
}

/**
 * Create a rate limit middleware function
 */
export function createRateLimiter(config: RateLimitConfig) {
  const limiter = getRateLimiter()

  return {
    check: (identifier: string) => limiter.check(identifier, config),
    reset: (identifier: string) => limiter.reset(identifier, config.keyPrefix),
    peek: (identifier: string) => limiter.peek(identifier, config),
  }
}

/**
 * Generate rate limit identifier from request
 */
export function getRateLimitIdentifier(
  type: RateLimitIdentifierType,
  request: Request,
  userId?: string,
  tenantId?: string
): string {
  switch (type) {
    case 'IP':
      return getIpFromRequest(request) || 'unknown'
    case 'USER':
      return userId || 'anonymous'
    case 'TENANT':
      return tenantId || 'unknown'
    default:
      return getIpFromRequest(request) || 'unknown'
  }
}

/**
 * Extract IP address from request
 */
export function getIpFromRequest(request: Request): string | null {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback - in some environments this might work
  // For App Router, we might need to use headers() from next/headers
  return null
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString())
  
  if (!result.allowed && result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString())
  }

  return headers
}

/**
 * Rate limit response for blocked requests
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const headers = createRateLimitHeaders(result)

  return NextResponse.json(
    {
      success: false,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers,
    }
  )
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig,
  getIdentifier: (request: Request) => string = (req) => getIpFromRequest(req) || 'unknown'
): (request: Request) => Promise<Response> {
  const limiter = createRateLimiter(config)

  return async (request: Request) => {
    const identifier = getIdentifier(request)
    const result = limiter.check(identifier)

    if (!result.allowed) {
      return rateLimitResponse(result)
    }

    const response = await handler(request)

    // Add rate limit headers to response
    const rateLimitHeaders = createRateLimitHeaders(result)
    rateLimitHeaders.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  }
}

// Export the class for testing purposes
export { InMemoryRateLimiter }
