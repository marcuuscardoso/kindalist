import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { ZodError } from 'zod'
import { ConflictException } from '@/core/domain/errors/conflict.error'
import { DomainError } from '@/core/domain/errors/domain.error'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { ValidationException } from '@/core/domain/errors/validation.error'
import { apiResponse } from '@/shared/response/api-response'

type ErrorType = abstract new (...args: never[]) => Error

interface ErrorTypeMapping {
  type: ErrorType
  status: number
  message?: (error: Error) => string
}

function formatZodError(error: ZodError): string {
  const issues = error.issues

  if (issues.length === 1) {
    return `Property '${String(issues[0]?.path[0])}' is invalid. [${issues[0]?.message}]`
  }

  return `One or more properties are invalid. [${issues
    .map((issue) => `"${String(issue.path[0])}"`)
    .join(', ')}]`
}

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (process.env.DEBUG) console.error(error)

  const errorTypes: ErrorTypeMapping[] = [
    { type: JsonWebTokenError, status: 401 },
    { type: TokenExpiredError, status: 401 },
    { type: ZodError, status: 400, message: (err) => formatZodError(err as ZodError) },
    { type: NotFoundException, status: 404 },
    { type: UnauthorizedException, status: 403 },
    { type: ConflictException, status: 409 },
    { type: ValidationException, status: 422 },
    { type: DomainError, status: 400 },
  ]

  const matchedError = errorTypes.find(({ type }) => error instanceof type)
  const status = matchedError?.status ?? 500
  const message =
    matchedError?.message?.(error) ??
    (matchedError ? error.message : 'An internal error occurred. Please try again later.')

  res.status(status).json(apiResponse.error(message))
}

export const errorMiddleware =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
