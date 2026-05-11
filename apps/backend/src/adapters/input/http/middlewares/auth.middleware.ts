import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Role as UserRole } from '@/core/domain/enums/user-role.enum'
import { env } from '@/infrastructure/config/env'
import { apiResponse } from '@/shared/response/api-response'
import { EAuthMethod } from '../routes/define-router'

const authPayloadSchema = z.object({
  userId: z.string().min(1),
  role: z.string().min(1),
})

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token

  if (!token) {
    res.status(401).json(apiResponse.error('Unauthorized'))
    return
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
    const payload = authPayloadSchema.parse(decoded)

    req.user = {
      userId: payload.userId,
      role: payload.role,
    }

    if (req.auth?.method === EAuthMethod.PRIVATE && !req.auth.roles?.includes(payload.role as UserRole)) {
      res.status(403).json(apiResponse.error('Unauthorized'))
      return
    }

    next()
  } catch {
    res.status(401).json(apiResponse.error('Unauthorized'))
  }
}
