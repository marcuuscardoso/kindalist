import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '@/infrastructure/config/env'
import { apiResponse } from '@/shared/response/api-response'

const authPayloadSchema = z.object({
  userId: z.string().min(1),
  role: z.string().min(1),
})

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization

  if (!authorization) {
    res.status(401).json(apiResponse.error('Unauthorized'))
    return
  }

  const [type, token] = authorization.split(' ')

  if (type !== 'Bearer' || !token) {
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

    next()
  } catch {
    res.status(401).json(apiResponse.error('Unauthorized'))
  }
}
