export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export interface TokenServicePort {
  generateTokenPair(userId: string, sessionId: string): Promise<TokenPair>
  verifyRefreshToken(token: string): Promise<{ userId: string; sessionId: string }>
}
