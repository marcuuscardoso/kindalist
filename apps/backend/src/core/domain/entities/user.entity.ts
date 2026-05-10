import { Role } from '../enums/user-role.enum'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  createdAt: Date
  updatedAt: Date
}
