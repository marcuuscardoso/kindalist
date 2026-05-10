export interface Session {
  id: string
  userId: string
  refreshToken: string
  userAgent: string | null
  ipAddress: string | null
  lastUsedAt: Date
  expiresAt: Date
  createdAt: Date
}
