import { type ReactNode } from 'react'

interface ProfileHeaderProps {
  title: ReactNode
  sub?: ReactNode
}

export function ProfileHeader({ title, sub }: ProfileHeaderProps) {
  return (
    <header className="profile-header">
      <h1 className="profile-header__title">{title}</h1>
      {sub && <p className="profile-header__sub">{sub}</p>}
    </header>
  )
}
