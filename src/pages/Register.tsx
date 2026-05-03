import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { AuthCard } from '../components/auth/AuthCard'
import { MarginaliaNote } from '../components/auth/MarginaliaNote'
import { RegisterForm } from '../components/auth/RegisterForm'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { state } = useAuth()
  const [params] = useSearchParams()

  useEffect(() => {
    document.title = 'Holidaze — Apply for access'
  }, [])

  if (state.status === 'authenticated') {
    const next = params.get('next') ?? '/profile'
    return <Navigate to={next} replace />
  }

  return (
    <main id="main" className="auth-page">
      <div className="auth-page__layout">
        <header className="auth-page__lede">
          <p className="auth-page__rubric">
            <span className="num">§ 04 · β</span>
            <em>Arrival</em>
            <span className="auth-page__rubric-rule" aria-hidden="true" />
          </p>
          <h1 className="auth-page__title">
            Begin,
            <br />
            <span className="accent">here</span>.
          </h1>
          <MarginaliaNote eyebrow="Marginalia">
            Two roles, <strong>one door.</strong> Switchable later — no rebuild.
          </MarginaliaNote>
        </header>

        <AuthCard
          stamp={
            <>
              New Subscription <span aria-hidden="true">★</span>
            </>
          }
          title="Apply for access"
          specimenNumber="A · NEW"
        >
          <RegisterForm />
        </AuthCard>

        <span className="auth-page__folio">N°04 · Apply · p.18</span>
      </div>
    </main>
  )
}
