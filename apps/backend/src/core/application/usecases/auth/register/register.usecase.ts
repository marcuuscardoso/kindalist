import { RegisterUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { RegisterInput } from './register.input'
import { RegisterOutput } from './register.output'

export class RegisterUseCase implements RegisterUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly sessionRepository: SessionRepositoryPort,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    throw new Error('Not implemented')
  }
}
