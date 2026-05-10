import { LoginInput } from '@/core/application/usecases/auth/login/login.input'
import { LoginOutput } from '@/core/application/usecases/auth/login/login.output'
import { LogoutInput } from '@/core/application/usecases/auth/logout/logout.input'
import { LogoutOutput } from '@/core/application/usecases/auth/logout/logout.output'
import { RefreshInput } from '@/core/application/usecases/auth/refresh/refresh.input'
import { RefreshOutput } from '@/core/application/usecases/auth/refresh/refresh.output'
import { RegisterInput } from '@/core/application/usecases/auth/register/register.input'
import { RegisterOutput } from '@/core/application/usecases/auth/register/register.output'

export interface RegisterUseCasePort {
  execute(input: RegisterInput): Promise<RegisterOutput>
}

export interface LoginUseCasePort {
  execute(input: LoginInput): Promise<LoginOutput>
}

export interface LogoutUseCasePort {
  execute(input: LogoutInput): Promise<LogoutOutput>
}

export interface RefreshUseCasePort {
  execute(input: RefreshInput): Promise<RefreshOutput>
}
