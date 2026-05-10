import { List as PrismaList, PrismaClient } from '@prisma/client'
import {
  CreateListData,
  ListRepositoryPort,
  UpdateListData,
} from '@/core/application/ports/output/list.repository.port'
import { List } from '@/core/domain/entities/list.entity'

export class ListPrismaRepository implements ListRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(model: PrismaList): List {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      isArchived: model.isArchived,
      userId: model.userId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    }
  }

  async findById(id: string): Promise<List | null> {
    const model = await this.prisma.list.findUnique({ where: { id } })
    return model ? this.toEntity(model) : null
  }

  async findManyByUserId(userId: string, archived: boolean): Promise<List[]> {
    const models = await this.prisma.list.findMany({
      where: {
        userId,
        isArchived: archived,
      },
    })
    return models.map(this.toEntity.bind(this))
  }

  async create(data: CreateListData): Promise<List> {
    const model = await this.prisma.list.create({ data })
    return this.toEntity(model)
  }

  async update(id: string, data: UpdateListData): Promise<List> {
    const model = await this.prisma.list.update({
      where: { id },
      data,
    })
    return this.toEntity(model)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.list.deleteMany({ where: { id } })
  }
}
