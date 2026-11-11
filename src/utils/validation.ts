export interface RegisterInput {
  fullName: string
  email: string
  password: string
}

export type RegisterErrors = Partial<Record<keyof RegisterInput, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Validación en el cliente (UX). La validación real la repiten Supabase Auth y la BD. */
export function validateRegister({ fullName, email, password }: RegisterInput): RegisterErrors {
  const errors: RegisterErrors = {}
  if (fullName.trim().length < 2 || fullName.trim().length > 100) errors.fullName = 'Entre 2 y 100 caracteres.'
  if (!EMAIL_RE.test(email.trim()) || email.length > 254) errors.email = 'Correo no válido.'
  if (password.length < 10) errors.password = 'Mínimo 10 caracteres.'
  else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password))
    errors.password = 'Incluye mayúsculas, minúsculas y números.'
  return errors
}
