import { RefreshUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { PasswordHasherPort } from '@/core/application/ports/output/password-hasher.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { RefreshInput } from './refresh.input'
import { RefreshOutput } from './refresh.output'

const REFRESH_TOKEN_EXPIRATION_IN_MS = 7 * 24 * 60 * 60 * 1000

export class RefreshUseCase implements RefreshUseCasePort {
  constructor(
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenService: TokenServicePort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: RefreshInput): Promise<RefreshOutput> {
    const session = await this.sessionRepository.findById(input.sessionId)
    if (!session) throw new NotFoundException('Session')

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessionRepository.delete(input.sessionId)
      throw new UnauthorizedException()
    }

    const isRefreshTokenValid = await this.passwordHasher.compare(input.refreshToken, session.refreshToken)
    if (!isRefreshTokenValid) throw new UnauthorizedException()

    const user = await this.userRepository.findById(session.userId)
    if (!user) throw new NotFoundException('User')

    const rawRefreshToken = this.tokenService.generateRefreshToken()
    const hashedRefreshToken = await this.passwordHasher.hash(rawRefreshToken)

    await this.sessionRepository.update(input.sessionId, {
      refreshToken: hashedRefreshToken,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_IN_MS),
    })

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    })

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      sessionId: input.sessionId,
    }
  }
}
