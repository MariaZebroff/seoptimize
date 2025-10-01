// Simple in-memory rate limiter for API endpoints
// In production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.requests.delete(identifier)
    }

    const currentEntry = this.requests.get(identifier)

    if (!currentEntry) {
      // First request
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }

    if (currentEntry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.resetTime
      }
    }

    // Increment count
    currentEntry.count++
    this.requests.set(identifier, currentEntry)

    return {
      allowed: true,
      remaining: this.maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime
    }
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Rate limiters for different endpoints
export const paymentRateLimiter = new RateLimiter(60000, 5) // 5 requests per minute
export const auditRateLimiter = new RateLimiter(60000, 10) // 10 requests per minute
export const generalRateLimiter = new RateLimiter(60000, 20) // 20 requests per minute

// Cleanup expired entries every 5 minutes
setInterval(() => {
  paymentRateLimiter.cleanup()
  auditRateLimiter.cleanup()
  generalRateLimiter.cleanup()
}, 5 * 60 * 1000)

// Helper function to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // For authenticated users, use user ID + IP for more granular limiting
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    return `auth:${ip}`
  }
  
  return `anon:${ip}`
}

// Helper function to create rate limit response
export function createRateLimitResponse(remaining: number, resetTime: number) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      remaining,
      resetTime: new Date(resetTime).toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  )
}


