import { LogoutUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { LogoutInput } from './logout.input'
import { LogoutOutput } from './logout.output'

export class LogoutUseCase implements LogoutUseCasePort {
  constructor(private readonly sessionRepository: SessionRepositoryPort) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    throw new Error('Not implemented')
  }
}
