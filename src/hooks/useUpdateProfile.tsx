import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'

import { updateProfile } from '../api/profiles'
import { type Profile, type UpdateProfileInput } from '../api/schemas'
import { ApiError } from '../types/api'
import { useAuth } from './useAuth'

export interface UseUpdateProfileApi {
  submit: (patch: UpdateProfileInput) => Promise<Profile>
  isPending: boolean
  error: ApiError | Error | null
}

export function useUpdateProfile(): UseUpdateProfileApi {
  const { user, applyProfilePatch } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<ApiError | Error | null>(null)

  const submit = useCallback<UseUpdateProfileApi['submit']>(
    async (patch) => {
      if (!user?.name) {
        const e = new Error('Cannot update profile while anonymous')
        setError(e)
        throw e
      }
      setIsPending(true)
      setError(null)
      try {
        const profile = await updateProfile(user.name, patch)
        applyProfilePatch({
          avatar: patch.avatar,
          banner: patch.banner,
          bio: patch.bio,
          venueManager: patch.venueManager,
        })
        return profile
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        // flushSync commits error + pending state before the throw propagates.
        // React 18's `act` does not flush queued updates when the async
        // callback rejects, so callers awaiting submit() see stale state
        // otherwise.
        flushSync(() => {
          setError(e)
          setIsPending(false)
        })
        throw e
      } finally {
        setIsPending(false)
      }
    },
    [user, applyProfilePatch],
  )

  return { submit, isPending, error }
}
