import { Role as UserRole } from '@/core/domain/enums/user-role.enum'
import { EAuthMethod } from '../routes/define-router'

declare global {
  namespace Express {
    interface Request {
      auth?: {
        method: EAuthMethod
        roles?: UserRole[]
      }
      user: {
        userId: string
        role: string
      }
    }
  }
}

export {}
