export type Session = {
  id: string
  userId: string
  refreshToken: string
  userAgent: string | null
  ipAddress: string | null
  lastUsedAt: Date
  expiresAt: Date
  createdAt: Date
}

export type CreateSessionData = {
  userId: string
  refreshToken: string
  userAgent?: string | null
  ipAddress?: string | null
  expiresAt: Date
}

export interface SessionRepositoryPort {
  findById(id: string): Promise<Session | null>
  create(data: CreateSessionData): Promise<Session>
  updateLastUsedAt(id: string, lastUsedAt: Date): Promise<Session>
  delete(id: string): Promise<void>
}
