import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).email(),
  password: z.string().min(1),
})

export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  sessionId: z.string().min(1),
  refreshToken: z.string().min(1),
})

export const logoutSchema = z.object({
  sessionId: z.string().min(1),
})

export type RegisterSchema = z.infer<typeof registerSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type RefreshSchema = z.infer<typeof refreshSchema>
export type LogoutSchema = z.infer<typeof logoutSchema>
