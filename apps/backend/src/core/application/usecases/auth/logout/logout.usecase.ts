import { LogoutUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { LogoutInput } from './logout.input'
import { LogoutOutput } from './logout.output'

export class LogoutUseCase implements LogoutUseCasePort {
  constructor(private readonly sessionRepository: SessionRepositoryPort) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    const session = await this.sessionRepository.findById(input.sessionId)
    if (!session) throw new NotFoundException('Session')
    if (session.userId !== input.userId) throw new UnauthorizedException()

    await this.sessionRepository.delete(input.sessionId)

    return { success: true }
  }
}
