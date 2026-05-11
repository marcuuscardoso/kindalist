import { RegisterUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { PasswordHasherPort } from '@/core/application/ports/output/password-hasher.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { Role } from '@/core/domain/enums/user-role.enum'
import { ConflictException } from '@/core/domain/errors/conflict.error'
import { RegisterInput } from './register.input'
import { RegisterOutput } from './register.output'

const REFRESH_TOKEN_EXPIRATION_IN_MS = 7 * 24 * 60 * 60 * 1000

export class RegisterUseCase implements RegisterUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) throw new ConflictException('User')

    const hashedPassword = await this.passwordHasher.hash(input.password)
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: Role.MEMBER,
    })

    const rawRefreshToken = this.tokenService.generateRefreshToken()
    const hashedRefreshToken = await this.passwordHasher.hash(rawRefreshToken)

    const session = await this.sessionRepository.create({
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
      sessionId: session.id,
    }
  }
}
