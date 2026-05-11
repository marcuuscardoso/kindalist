import { Session } from '@/core/domain/entities/session.entity'

export type CreateSessionData = {
  userId: string
  refreshToken: string
  userAgent?: string | null
  ipAddress?: string | null
  expiresAt: Date
}

export type UpdateSessionData = {
  refreshToken?: string
  userAgent?: string | null
  ipAddress?: string | null
  lastUsedAt?: Date
  expiresAt?: Date
}

export interface SessionRepositoryPort {
  findById(id: string): Promise<Session | null>
  create(data: CreateSessionData): Promise<Session>
  update(id: string, data: UpdateSessionData): Promise<Session>
  delete(id: string): Promise<void>
}
