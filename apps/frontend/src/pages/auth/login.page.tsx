import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordInput } from '@/components/auth/password-input'
import { loginSchema, LoginFormData } from '@/schemas/auth.schema'
import { ApiError } from '@/types/api'
import { useAuth } from '@/hooks/use-auth'
import { routes } from '@/app/routes'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setFormError(null)

    try {
      await login(data)
      navigate(routes.app, { replace: true })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Não foi possível entrar.')
    }
  }

  return (
    <AuthLayout>
      <form className="kl-auth-form-inner" onSubmit={handleSubmit(onSubmit)}>
        <h1>Entrar</h1>
        <p className="kl-auth-sub">Acesse suas listas e continue de onde parou.</p>

        <div className="kl-field">
          <label className="kl-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="kl-input"
            type="email"
            placeholder="marina@kindalist.app"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <div className="kl-field-error">{errors.email.message}</div>}
        </div>

        <div className="kl-field">
          <div className="kl-field-head">
            <label className="kl-label" htmlFor="password">
              Senha
            </label>
            <button className="kl-auth-link muted" type="button">
              Esqueci a senha
            </button>
          </div>
          <PasswordInput
            id="password"
            className="kl-input"
            placeholder="••••••••••"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && <div className="kl-field-error">{errors.password.message}</div>}
        </div>

        {formError && <div className="kl-form-error">{formError}</div>}

        <button className="kl-btn primary full lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="kl-auth-foot">
          Ainda não tem conta?{' '}
          <Link className="kl-auth-link" to={routes.register}>
            Criar conta
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
