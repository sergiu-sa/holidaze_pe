import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { AuthCard } from '../components/auth/AuthCard'
import { LoginForm } from '../components/auth/LoginForm'
import { MarginaliaNote } from '../components/auth/MarginaliaNote'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { state } = useAuth()
  const [params] = useSearchParams()

  useEffect(() => {
    document.title = 'Holidaze — Check in'
  }, [])

  if (state.status === 'authenticated') {
    const next = params.get('next') ?? '/profile'
    return <Navigate to={next} replace />
  }

  const expired = params.get('reason') === 'expired'

  return (
    <main id="main" className="auth-page">
      <div className="auth-page__layout">
        <header className="auth-page__lede">
          <p className="auth-page__rubric">
            <span className="num">§ 04 · α</span>
            <em>Return</em>
            <span className="auth-page__rubric-rule" aria-hidden="true" />
          </p>
          <h1 className="auth-page__title">
            Welcome,
            <br />
            <span className="accent">again</span>.
          </h1>
          <MarginaliaNote eyebrow="Marginalia">
            Two fields. <strong>Fifteen seconds.</strong> No marketing email — promise.
          </MarginaliaNote>
        </header>

        <div>
          {expired && (
            <p className="auth-page__expired" role="status">
              Your session timed out — sign in again.
            </p>
          )}
          <AuthCard
            stamp={
              <>
                Reader Credential <span aria-hidden="true">★</span>
              </>
            }
            title="Reader card"
            specimenNumber="R · 0042"
          >
            <LoginForm />
          </AuthCard>
        </div>

        <span className="auth-page__folio">N°04 · Check-in · p.17</span>
      </div>
    </main>
  )
}
