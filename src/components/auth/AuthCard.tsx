import type { ReactNode } from 'react'

interface AuthCardProps {
  stamp: ReactNode
  title: string
  specimenNumber: string
  children: ReactNode
}

export function AuthCard({ stamp, title, specimenNumber, children }: AuthCardProps) {
  return (
    <article className="auth-card">
      <span className="auth-card__tick auth-card__tick--tl" aria-hidden="true" />
      <span className="auth-card__tick auth-card__tick--tr" aria-hidden="true" />
      <span className="auth-card__tick auth-card__tick--bl" aria-hidden="true" />
      <span className="auth-card__tick auth-card__tick--br" aria-hidden="true" />

      <span className="auth-card__stamp">{stamp}</span>

      <header className="auth-card__masthead">
        <h2 className="auth-card__title">{title}</h2>
        <p className="auth-card__num">
          <span>Specimen №</span>
          <strong>{specimenNumber}</strong>
        </p>
      </header>

      <div className="auth-card__body">{children}</div>
    </article>
  )
}
