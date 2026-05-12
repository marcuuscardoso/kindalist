import { apiRequest } from './http-client'
import {
  AuthUserResponse,
  BooleanSuccessResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from '@/types/auth'

export const authService = {
  register(data: RegisterRequest): Promise<AuthUserResponse> {
    return apiRequest<AuthUserResponse>('/auth/register', {
      method: 'POST',
      body: data,
      skipAuthRefresh: true,
    })
  },

  login(data: LoginRequest): Promise<AuthUserResponse> {
    return apiRequest<AuthUserResponse>('/auth/login', {
      method: 'POST',
      body: data,
      skipAuthRefresh: true,
    })
  },

  logout(): Promise<BooleanSuccessResponse> {
    return apiRequest<BooleanSuccessResponse>('/auth/logout', {
      method: 'POST',
      skipAuthRefresh: true,
    })
  },

  refresh(): Promise<BooleanSuccessResponse> {
    return apiRequest<BooleanSuccessResponse>('/auth/refresh', {
      method: 'POST',
      skipAuthRefresh: true,
    })
  },

  me(): Promise<MeResponse> {
    return apiRequest<MeResponse>('/auth/me', {
      method: 'GET',
    })
  },
}
