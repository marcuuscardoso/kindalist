import { MeUseCasePort } from '@/core/application/ports/input/auth.usecase.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { MeInput } from './me.input'
import { MeOutput } from './me.output'

export class MeUseCase implements MeUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(input: MeInput): Promise<MeOutput> {
    const user = await this.userRepository.findById(input.userId)
    if (!user) throw new NotFoundException('User')

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }
}
