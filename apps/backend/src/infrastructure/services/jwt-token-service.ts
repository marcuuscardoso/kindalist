import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { env } from '@/infrastructure/config/env'

export class JwtTokenService implements TokenServicePort {
  generateAccessToken(payload: { userId: string; role: string }): string {
    const expiresIn = env.JWT_ACCESS_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn })
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }
}
