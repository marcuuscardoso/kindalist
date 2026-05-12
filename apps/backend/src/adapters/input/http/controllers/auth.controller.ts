import { Request, Response } from 'express'
import {
  LoginUseCasePort,
  LogoutUseCasePort,
  RefreshUseCasePort,
  RegisterUseCasePort,
} from '@/core/application/ports/input/auth.usecase.port'
import { apiResponse } from '@/shared/response/api-response'
import { authCookies } from '../cookies/auth-cookies'
import { authMapper } from '../mappers/auth.mapper'
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from '../schemas/auth.schema'

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCasePort,
    private readonly loginUseCase: LoginUseCasePort,
    private readonly logoutUseCase: LogoutUseCasePort,
    private readonly refreshUseCase: RefreshUseCasePort,
  ) {}

  async register(req: Request, res: Response) {
    const body = registerSchema.parse(req.body)
    const input = authMapper.toRegisterInput(body, req.get('user-agent') ?? null, req.ip)
    const output = await this.registerUseCase.execute(input)

    return authCookies.set(res.status(201), output).json(apiResponse.success({ user: output.user }))
  }

  async login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body)
    const input = authMapper.toLoginInput(body, req.get('user-agent') ?? null, req.ip)
    const output = await this.loginUseCase.execute(input)

    return authCookies.set(res.status(200), output).json(apiResponse.success({ user: output.user }))
  }

  async logout(req: Request, res: Response) {
    const cookies = logoutSchema.parse(req.cookies)
    const input = authMapper.toLogoutInput(cookies, req.user.userId)
    const output = await this.logoutUseCase.execute(input)

    return authCookies.clear(res.status(200)).json(apiResponse.success(output))
  }

  async refresh(req: Request, res: Response) {
    const cookies = refreshSchema.parse(req.cookies)
    const input = authMapper.toRefreshInput(cookies, req.get('user-agent') ?? null, req.ip)
    const output = await this.refreshUseCase.execute(input)

    return authCookies.set(res.status(200), output).json(apiResponse.success({ success: true }))
  }
}
