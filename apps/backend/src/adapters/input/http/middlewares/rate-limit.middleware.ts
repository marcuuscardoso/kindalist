import { Request } from 'express'
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import { apiResponse } from '@/shared/response/api-response'

const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const AUTH_RATE_LIMIT_MAX_REQUESTS = 20
const GLOBAL_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const GLOBAL_RATE_LIMIT_MAX_REQUESTS = 300

function getClientKey(req: Request): string {
  const ipAddress = req.socket.remoteAddress ?? req.ip ?? 'unknown'

  return ipAddress === 'unknown' ? ipAddress : ipKeyGenerator(ipAddress)
}

export const authRateLimitMiddleware = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  limit: AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: getClientKey,
  handler: (_req, res) => {
    return res.status(429).json(apiResponse.error('Too many requests. Please try again later.'))
  },
})

export const globalRateLimitMiddleware = rateLimit({
  windowMs: GLOBAL_RATE_LIMIT_WINDOW_MS,
  limit: GLOBAL_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: getClientKey,
  handler: (_req, res) => {
    return res.status(429).json(apiResponse.error('Too many requests. Please try again later.'))
  },
})
