import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).email(),
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: passwordSchema,
})

export const refreshSchema = z.object({
  session_id: z.string().min(1),
  refresh_token: z.string().min(1),
})

export const logoutSchema = z.object({
  session_id: z.string().min(1),
})

export type RegisterSchema = z.infer<typeof registerSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type RefreshSchema = z.infer<typeof refreshSchema>
export type LogoutSchema = z.infer<typeof logoutSchema>
