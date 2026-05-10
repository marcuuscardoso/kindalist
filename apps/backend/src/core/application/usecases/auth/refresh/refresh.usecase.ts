import { RefreshUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { RefreshInput } from './refresh.input'
import { RefreshOutput } from './refresh.output'

export class RefreshUseCase implements RefreshUseCasePort {
  constructor(
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: RefreshInput): Promise<RefreshOutput> {
    throw new Error('Not implemented')
  }
}
