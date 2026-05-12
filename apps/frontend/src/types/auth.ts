export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export type AuthUser = {
  id: string
  name: string
  email: string
  role?: Role
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthUserResponse = {
  user: AuthUser
}

export type MeResponse = {
  user: Required<AuthUser>
}

export type BooleanSuccessResponse = {
  success: boolean
}
