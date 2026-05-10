import { RegisterUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { PasswordHasherPort } from '@/core/application/ports/output/password-hasher.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { RegisterInput } from './register.input'
import { RegisterOutput } from './register.output'

export class RegisterUseCase implements RegisterUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    throw new Error('Not implemented')
  }
}
