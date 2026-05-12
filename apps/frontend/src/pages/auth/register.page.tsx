import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordInput } from '@/components/auth/password-input'
import { registerSchema, RegisterFormData } from '@/schemas/auth.schema'
import { ApiError } from '@/types/api'
import { useAuth } from '@/hooks/use-auth'
import { routes } from '@/app/routes'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: createAccount } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      termsAccepted: false,
    },
  })
  const termsAccepted = watch('termsAccepted')

  async function onSubmit(data: RegisterFormData) {
    setFormError(null)
    const { termsAccepted: _termsAccepted, ...accountData } = data

    try {
      await createAccount(accountData)
      navigate(routes.app, { replace: true })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Não foi possível criar a conta.')
    }
  }

  return (
    <AuthLayout>
      <form className="kl-auth-form-inner" onSubmit={handleSubmit(onSubmit)}>
        <h1>Criar conta</h1>
        <p className="kl-auth-sub">Leva 30 segundos. Bem menos que escrever a próxima task.</p>

        <div className="kl-field">
          <label className="kl-label" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            className="kl-input"
            type="text"
            placeholder="Marina Costa"
            autoComplete="name"
            {...register('name')}
          />
          {errors.name && <div className="kl-field-error">{errors.name.message}</div>}
        </div>

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
          <label className="kl-label" htmlFor="password">
            Senha
          </label>
          <PasswordInput
            id="password"
            className="kl-input"
            placeholder="••••••••••"
            autoComplete="new-password"
            {...register('password')}
          />
          <div className="kl-input-hint">8+ caracteres, 1 número, 1 letra maiúscula.</div>
          {errors.password && <div className="kl-field-error">{errors.password.message}</div>}
        </div>

        <div className="kl-terms">
          <input
            id="termsAccepted"
            className="kl-terms-checkbox"
            type="checkbox"
            {...register('termsAccepted')}
          />
          <span>
            Concordo com os{' '}
            <button className="kl-auth-link" type="button">
              termos
            </button>{' '}
            e a política de privacidade.
          </span>
        </div>
        {errors.termsAccepted && <div className="kl-field-error">{errors.termsAccepted.message}</div>}

        {formError && <div className="kl-form-error">{formError}</div>}

        <button className="kl-btn primary full lg" type="submit" disabled={isSubmitting || !termsAccepted}>
          {isSubmitting ? 'Criando...' : 'Criar conta'}
        </button>

        <div className="kl-auth-foot">
          Já tem uma conta?{' '}
          <Link className="kl-auth-link" to={routes.login}>
            Entrar
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
