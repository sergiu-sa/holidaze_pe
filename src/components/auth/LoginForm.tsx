import { type FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { LoginInputSchema } from '../../api/schemas'
import { useAuth } from '../../hooks/useAuth'
import { safeNext } from '../../lib/safe-next'
import { ApiError } from '../../types/api'
import { SpecimenField } from './SpecimenField'
import { SubmitBar } from './SubmitBar'

interface FieldErrors {
  email?: string
  password?: string
  form?: string
}

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    const parsed = LoginInputSchema.safeParse({ email, password })
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error)
      setErrors({
        email: tree.properties?.email?.errors[0],
        password: tree.properties?.password?.errors[0],
      })
      return
    }

    setPending(true)
    try {
      await login(parsed.data)
      navigate(safeNext(params.get('next')), { replace: true })
    } catch (err) {
      // 401 is the only server status that maps to a user-actionable message.
      // Anything else falls back to a generic banner to avoid leaking server
      // error detail (raw Zod trees, fetch URLs, etc.) into the UI.
      const status = err instanceof ApiError ? err.status : 0
      setErrors({
        form: status === 401 ? 'Wrong email or password' : 'Something went wrong — try again',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        void handleSubmit(event)
      }}
      noValidate
    >
      <SpecimenField
        num="01"
        name="Email"
        hint={
          <>
            ends in <span className="mono">stud.noroff.no</span>
          </>
        }
        id="login-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.currentTarget.value)
        }}
        error={errors.email}
      />

      <SpecimenField
        num="02"
        name="Password"
        hint="8 or more"
        id="login-password"
        type="password"
        autoComplete="current-password"
        required
        minLength={8}
        value={password}
        onChange={(event) => {
          setPassword(event.currentTarget.value)
        }}
        error={errors.password}
      />

      {errors.form && (
        <p className="auth-form__banner" role="alert">
          {errors.form}
        </p>
      )}

      <SubmitBar label="Check in" pendingLabel="Checking in…" pending={pending} />
    </form>
  )
}
