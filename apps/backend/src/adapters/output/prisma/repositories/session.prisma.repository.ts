import { PrismaClient, Session as PrismaSession } from '@prisma/client'
import {
  CreateSessionData,
  SessionRepositoryPort,
} from '@/core/application/ports/output/session.repository.port'
import { Session } from '@/core/domain/entities/session.entity'

export class SessionPrismaRepository implements SessionRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(model: PrismaSession): Session {
    return {
      id: model.id,
      userId: model.userId,
      refreshToken: model.refreshToken,
      userAgent: model.userAgent,
      ipAddress: model.ipAddress,
      lastUsedAt: model.lastUsedAt,
      expiresAt: model.expiresAt,
      createdAt: model.createdAt,
    }
  }

  async findById(id: string): Promise<Session | null> {
    const model = await this.prisma.session.findUnique({ where: { id } })
    return model ? this.toEntity(model) : null
  }

  async create(data: CreateSessionData): Promise<Session> {
    const model = await this.prisma.session.create({ data })
    return this.toEntity(model)
  }

  async updateLastUsedAt(id: string, lastUsedAt: Date): Promise<Session> {
    const model = await this.prisma.session.update({
      where: { id },
      data: { lastUsedAt },
    })
    return this.toEntity(model)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id } })
  }
}
