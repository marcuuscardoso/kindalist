import { LoginUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { PasswordHasherPort } from '@/core/application/ports/output/password-hasher.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { ValidationException } from '@/core/domain/errors/validation.error'
import { LoginInput } from './login.input'
import { LoginOutput } from './login.output'

const REFRESH_TOKEN_EXPIRATION_IN_MS = 7 * 24 * 60 * 60 * 1000

export class LoginUseCase implements LoginUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) throw new NotFoundException('User')

    const isPasswordValid = await this.passwordHasher.compare(input.password, user.password)
    if (!isPasswordValid) throw new ValidationException('Invalid credentials')

    const rawRefreshToken = this.tokenService.generateRefreshToken()
    const hashedRefreshToken = await this.passwordHasher.hash(rawRefreshToken)

    await this.sessionRepository.create({
      userId: user.id,
      refreshToken: hashedRefreshToken,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_IN_MS),
    })

    const accessToken = this.tokenService.generateAccessToken({ userId: user.id, role: user.role })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    }
  }
}
