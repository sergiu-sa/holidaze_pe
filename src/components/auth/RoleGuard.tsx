import { type ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../ui/ToastProvider'

interface RoleGuardProps {
  role: 'manager'
  children: ReactNode
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const { user } = useAuth()
  const toast = useToast()
  // `role` is currently the literal `'manager'` — a customer is "everything not
  // manager". The comparison is redundant today, but the prop is kept on the
  // public API so future roles can extend the union without a breaking change.
  const blocked =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- forward-compatible with a future role union
    role === 'manager' && user !== null && !user.venueManager

  useEffect(() => {
    if (blocked) {
      toast('That section is for venue managers — switch role from your profile.')
    }
  }, [blocked, toast])

  if (blocked) return <Navigate to="/profile" replace />
  return <>{children}</>
}
