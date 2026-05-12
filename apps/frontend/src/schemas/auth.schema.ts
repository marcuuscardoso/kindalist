import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: passwordSchema,
})

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).email(),
  password: passwordSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
