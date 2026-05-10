import { Role } from '@/core/domain/enums/user-role.enum'

export type RegisterInput = {
  name: string
  email: string
  password: string
  role?: Role
  userAgent?: string | null
  ipAddress?: string | null
}
