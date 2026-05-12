import { Role } from '@/core/domain/enums/user-role.enum'

export type MeOutput = {
  user: {
    id: string
    name: string
    email: string
    role: Role
  }
}
