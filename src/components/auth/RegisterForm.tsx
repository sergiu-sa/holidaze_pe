import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { RegisterInputSchema } from '../../api/schemas'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../types/api'
import { type Role, RoleBento } from './RoleBento'
import { SpecimenField } from './SpecimenField'
import { SubmitBar } from './SubmitBar'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  form?: string
}

const ALREADY_REGISTERED = 'Already registered — sign in instead'

export function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const initialRole: Role = params.get('role') === 'host' ? 'host' : 'guest'

  const [role, setRole] = useState<Role>(initialRole)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    const parsed = RegisterInputSchema.safeParse({
      name,
      email,
      password,
      venueManager: role === 'host',
    })
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error)
      setErrors({
        name: tree.properties?.name?.errors[0],
        email: tree.properties?.email?.errors[0],
        password: tree.properties?.password?.errors[0],
      })
      return
    }

    setPending(true)
    try {
      await register(parsed.data)
      navigate('/profile', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.message === 'AUTO_LOGIN_FAILED') {
        navigate(`/login?email=${encodeURIComponent(email)}`)
        return
      }
      const status = err instanceof ApiError ? err.status : 0
      if (status === 409) {
        setErrors({ email: ALREADY_REGISTERED })
        return
      }
      const message =
        err instanceof Error ? err.message : 'Something went wrong — try again'
      setErrors({ form: message })
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
      <fieldset className="auth-field auth-field--role">
        <legend className="auth-field__label">
          <span className="auth-field__num">01</span>
          <span className="auth-field__name">Role</span>
          <span className="auth-field__hint">pick one</span>
        </legend>
        <RoleBento value={role} onChange={setRole} />
      </fieldset>

      <SpecimenField
        num="02"
        name="Name"
        hint="first names are fine"
        id="reg-name"
        type="text"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => {
          setName(event.currentTarget.value)
        }}
        error={errors.name}
      />

      <SpecimenField
        num="03"
        name="Email"
        hint={
          <>
            ends in <span className="mono">stud.noroff.no</span>
          </>
        }
        id="reg-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.currentTarget.value)
        }}
        error={errors.email}
      />

      {errors.email === ALREADY_REGISTERED && (
        <p className="auth-form__hint">
          <Link to="/login">Sign in →</Link>
        </p>
      )}

      <SpecimenField
        num="04"
        name="Password"
        hint="8 or more"
        id="reg-password"
        type="password"
        autoComplete="new-password"
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

      <SubmitBar label="Apply for access" pendingLabel="Applying…" pending={pending} />
    </form>
  )
}
