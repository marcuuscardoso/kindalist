import { PrismaClient, User as PrismaUser } from '@prisma/client'
import { CreateUserData, UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { User } from '@/core/domain/entities/user.entity'
import { Role } from '@/core/domain/enums/user-role.enum'

export class UserPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(model: PrismaUser): User {
    return {
      id: model.id,
      name: model.name,
      email: model.email,
      password: model.password,
      role: model.role as Role,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    }
  }

  async findById(id: string): Promise<User | null> {
    const model = await this.prisma.user.findUnique({ where: { id } })
    return model ? this.toEntity(model) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const model = await this.prisma.user.findUnique({ where: { email } })
    return model ? this.toEntity(model) : null
  }

  async create(data: CreateUserData): Promise<User> {
    const model = await this.prisma.user.create({ data })
    return this.toEntity(model)
  }
}
