import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signUp } from '../services/api'
import { safeRedirectPath } from '../utils/safeRedirect'
import { validateRegister, type RegisterErrors } from '../utils/validation'

const input = 'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300'

export default function Register() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validateRegister(form)
    setErrors(found)
    if (Object.keys(found).length) return
    setSubmitting(true)
    const { error } = await signUp(form.email, form.password, form.fullName)
    setSubmitting(false)
    if (error) {
      // Mensaje genérico: no revelamos si el correo ya existe (enumeración de usuarios)
      return setStatus({ type: 'error', text: 'No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.' })
    }
    setStatus({ type: 'ok', text: `¡Bienvenido, ${form.fullName}! Revisa tu correo para confirmar la cuenta.` })
    navigate(safeRedirectPath(params.get('next')), { replace: true })
  }

  const field = (name: keyof typeof form, label: string, type: string, autoComplete: string) => (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
      <input
        id={name}
        type={type}
        autoComplete={autoComplete}
        className={`${input} ${errors[name] ? 'border-rose-400' : 'border-stone-300'}`}
        value={form[name]}
        maxLength={name === 'email' ? 254 : 100}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
      />
      {errors[name] && <p id={`${name}-error`} className="mt-1 text-sm text-rose-600">{errors[name]}</p>}
    </div>
  )

  return (
    <form noValidate onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      {field('fullName', 'Nombre', 'text', 'name')}
      {field('email', 'Correo', 'email', 'email')}
      {field('password', 'Contraseña', 'password', 'new-password')}
      <button disabled={submitting} className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white disabled:opacity-60">
        {submitting ? 'Creando…' : 'Registrarme'}
      </button>
      {/* Texto plano: el nombre del usuario NUNCA se inyecta como HTML */}
      {status && (
        <p role={status.type === 'error' ? 'alert' : 'status'} className={status.type === 'error' ? 'text-rose-700' : 'text-emerald-700'}>
          {status.text}
        </p>
      )}
    </form>
  )
}
