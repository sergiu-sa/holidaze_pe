import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useToast } from '../components/ui/ToastProvider'
import type { Venue } from '../types/venue'
import { useAuth } from './useAuth'

export interface UseOwnerGateOptions {
  /** Where to redirect when the gate fails. Defaults to '/profile/venues'. */
  fallbackPath?: string
  /** Toast message shown on a non-owner. */
  message?: string
}

// Bounces a non-owner away from a venue-scoped manager route.
// Lives outside RoleGuard because RoleGuard only gates by `venueManager`,
// not by per-resource ownership. Effect runs once `venue` is loaded.
export function useOwnerGate(
  venue: Venue | null | undefined,
  options: UseOwnerGateOptions = {},
): void {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const fallbackPath = options.fallbackPath ?? '/profile/venues'
  const message = options.message ?? 'You can only access venues you own.'

  useEffect(() => {
    if (!venue || !user) return
    if (!venue.owner) return
    if (venue.owner.name === user.name) return
    toast(message, { kind: 'error' })
    navigate(fallbackPath, { replace: true })
  }, [venue, user, navigate, toast, fallbackPath, message])
}
