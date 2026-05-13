import { useCallback, useState } from 'react'

const KEY = 'holidaze:v1:intro-seen'

function readSeenFlag(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    // Fail open: if storage is blocked (e.g. private-browsing SecurityError),
    // treat the intro as already seen so we never hard-loop on the cover.
    return true
  }
}

export interface UseIntroSeenResult {
  seen: boolean
  markSeen: () => void
}

export function useIntroSeen(): UseIntroSeenResult {
  const [seen, setSeen] = useState<boolean>(readSeenFlag)

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* swallow — next visit will show the intro again, acceptable */
    }
    setSeen(true)
  }, [])

  return { seen, markSeen }
}
