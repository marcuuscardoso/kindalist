export interface TokenServicePort {
  generateAccessToken(payload: { userId: string; role: string }): string
  generateRefreshToken(): string
}
