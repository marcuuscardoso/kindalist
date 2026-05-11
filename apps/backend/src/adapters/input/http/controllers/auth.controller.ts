import { Request, Response } from 'express'
import {
  LoginUseCasePort,
  LogoutUseCasePort,
  RefreshUseCasePort,
  RegisterUseCasePort,
} from '@/core/application/ports/input/auth.usecase.port'
import { apiResponse } from '@/shared/response/api-response'
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

    return res.status(201).json(apiResponse.success(output))
  }

  async login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body)
    const input = authMapper.toLoginInput(body, req.get('user-agent') ?? null, req.ip)
    const output = await this.loginUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }

  async logout(req: Request, res: Response) {
    const body = logoutSchema.parse(req.body)
    const input = authMapper.toLogoutInput(body, req.user.userId)
    const output = await this.logoutUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }

  async refresh(req: Request, res: Response) {
    const body = refreshSchema.parse(req.body)
    const input = authMapper.toRefreshInput(body, req.get('user-agent') ?? null, req.ip)
    const output = await this.refreshUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }
}
