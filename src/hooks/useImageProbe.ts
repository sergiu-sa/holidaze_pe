import { useEffect, useRef, useState } from 'react'

export type ImageProbeState = 'empty' | 'invalid' | 'probing' | 'ready' | 'broken'

export interface UseImageProbeResult {
  state: ImageProbeState
  dim: { w: number; h: number } | null
}

export function useImageProbe(url: string): UseImageProbeResult {
  const [state, setState] = useState<ImageProbeState>('empty')
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null)
  const generation = useRef(0)

  useEffect(() => {
    const trimmed = url.trim()
    const gen = ++generation.current

    if (!trimmed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror url prop into state machine; jumping back to 'empty' when the field is cleared.
      setState('empty')
      setDim(null)
      return
    }
    if (!/^https?:\/\//.test(trimmed)) {
      setState('invalid')
      setDim(null)
      return
    }

    setState('probing')
    setDim(null)

    const probe = new Image()
    probe.referrerPolicy = 'no-referrer'

    probe.onload = () => {
      if (gen !== generation.current) return
      setState('ready')
      setDim({ w: probe.naturalWidth, h: probe.naturalHeight })
    }
    probe.onerror = () => {
      if (gen !== generation.current) return
      setState('broken')
      setDim(null)
    }
    probe.src = trimmed
  }, [url])

  return { state, dim }
}
