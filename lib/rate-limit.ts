import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export interface RateLimitRule {
  name: string
  limit: number
  windowSeconds: number
}

export const RATE_LIMIT_MESSAGE = 'Too many tries. Please wait a few minutes and try again.'

// Mobile networks share one IP across many people, so these stay generous.
export const RATE_LIMITS = {
  checkout: { name: 'checkout', limit: 10, windowSeconds: 600 },
  contact: { name: 'contact', limit: 5, windowSeconds: 3600 },
  track: { name: 'track', limit: 15, windowSeconds: 600 },
  upload: { name: 'upload', limit: 30, windowSeconds: 600 },
  wishlist: { name: 'wishlist', limit: 60, windowSeconds: 60 },
  paymentReview: { name: 'payment-review', limit: 1, windowSeconds: 86400 },
} as const satisfies Record<string, RateLimitRule>

export async function getClientIp(): Promise<string> {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')
  const firstIp = forwarded?.split(',')[0]?.trim()
  return firstIp || headerList.get('x-real-ip') || 'unknown'
}

// Fails open on purpose: if the database hiccups, a real customer
// should still be able to pay. The error is logged so we notice.
export async function checkRateLimit(rule: RateLimitRule, identifier: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_key: `${rule.name}:${identifier}`,
      p_limit: rule.limit,
      p_window_seconds: rule.windowSeconds,
    })

    if (error || data === null) {
      console.error('Rate limit check failed:', error)
      return true
    }
    return data
  } catch (err) {
    console.error('Rate limit check error:', err)
    return true
  }
}