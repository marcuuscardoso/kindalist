import { NextFunction, Request, Response } from 'express'
import sanitizeHtml from 'sanitize-html'

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    })
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)]))
  }

  return value
}

export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizeValue(req.body)
  }

  next()
}
