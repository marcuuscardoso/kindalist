import { LoginInput } from '@/core/application/usecases/auth/login/login.input'
import { RefreshInput } from '@/core/application/usecases/auth/refresh/refresh.input'
import { RegisterInput } from '@/core/application/usecases/auth/register/register.input'
import { LoginSchema, RefreshSchema, RegisterSchema } from '../schemas/auth.schema'

export const authMapper = {
  toRegisterInput(
    body: RegisterSchema,
    userAgent?: string | null,
    ipAddress?: string | null,
  ): RegisterInput {
    return {
      name: body.name,
      email: body.email,
      password: body.password,
      ...(userAgent !== undefined && { userAgent }),
      ...(ipAddress !== undefined && { ipAddress }),
    }
  },

  toLoginInput(body: LoginSchema, userAgent?: string | null, ipAddress?: string | null): LoginInput {
    return {
      email: body.email,
      password: body.password,
      ...(userAgent !== undefined && { userAgent }),
      ...(ipAddress !== undefined && { ipAddress }),
    }
  },

  toRefreshInput(
    body: RefreshSchema,
    userAgent?: string | null,
    ipAddress?: string | null,
  ): RefreshInput {
    return {
      refreshToken: body.refreshToken,
      ...(userAgent !== undefined && { userAgent }),
      ...(ipAddress !== undefined && { ipAddress }),
    }
  },
}
