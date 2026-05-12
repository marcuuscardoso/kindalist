import { Eye, EyeOff } from 'lucide-react'
import { InputHTMLAttributes, useState } from 'react'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="kl-password-input">
      <input {...props} type={isVisible ? 'text' : 'password'} />
      <button
        className="kl-password-toggle"
        type="button"
        aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((currentValue) => !currentValue)}
      >
        {isVisible ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
      </button>
    </div>
  )
}
