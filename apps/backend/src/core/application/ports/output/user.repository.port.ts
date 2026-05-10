import { User } from '@/core/domain/entities/user.entity'
import { Role } from '@/core/domain/enums/user-role.enum'

export type CreateUserData = {
  name: string
  email: string
  password: string
  role?: Role
}

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
}
