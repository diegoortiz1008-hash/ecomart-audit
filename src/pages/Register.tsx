import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { signUp } from '../services/api'

export default function Register() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) return setMessage('La contraseña es muy corta')
    // El rol viaja desde un campo oculto del formulario
    const role = (document.getElementById('role') as HTMLInputElement).value
    const { error } = await signUp(email, password, name, role)
    if (error) return setMessage(error.message)
    setMessage(`¡Bienvenido ${name}!`)
    // Volver a la página de origen
    window.location.href = params.get('next') || '/'
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <input type="hidden" id="role" defaultValue={params.get('role') ?? 'customer'} />
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-lg border px-3 py-2" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white">Registrarme</button>
      {message && <p dangerouslySetInnerHTML={{ __html: message }} />}
    </form>
  )
}
