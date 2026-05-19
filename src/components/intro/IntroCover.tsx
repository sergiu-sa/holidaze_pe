import '../../styles/intro.css'

import { useEffect, useRef, useState } from 'react'

import wordmark from '../../assets/logo/holidaze-wordmark.svg'
import { INTRO_CITIES } from '../../lib/intro/cities'
import { IntroPlate } from './IntroPlate'

interface IntroCoverProps {
  onDismissed: () => void
}

const FADE_OUT_MS = 720
const AUTO_DISMISS_MS = 4900

export default function IntroCover({ onDismissed }: IntroCoverProps) {
  const [isDismissing, setIsDismissing] = useState(false)
  const dismissedRef = useRef(false)
  const onDismissedRef = useRef(onDismissed)
  const rootRef = useRef<HTMLDivElement>(null)

  // Latest-callback ref pattern: keeps the dismiss effect's deps array empty
  // so listeners + timer don't get torn down and rebuilt on every parent render.
  useEffect(() => {
    onDismissedRef.current = onDismissed
  }, [onDismissed])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    // Capture focus into the cover so AT users land in the modal context.
    rootRef.current?.focus()

    const dismiss = (): void => {
      if (dismissedRef.current) return
      dismissedRef.current = true
      setIsDismissing(true)
      window.setTimeout(() => { onDismissedRef.current() }, FADE_OUT_MS)
    }

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Tab') return
      dismiss()
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const autoTimer = reduced ? null : window.setTimeout(dismiss, AUTO_DISMISS_MS)

    document.addEventListener('keydown', onKey)
    document.addEventListener('click', dismiss)

    return () => {
      document.body.style.overflow = ''
      if (autoTimer !== null) window.clearTimeout(autoTimer)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', dismiss)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={`intro-cover${isDismissing ? ' intro-cover--out' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Holidaze — press any key to continue"
      tabIndex={-1}
    >
      <div className="intro-cover__paper" aria-hidden="true" />
      <div className="intro-cover__frame">
        <header className="intro-cover__head">
          <span className="intro-cover__eyebrow">
            N°04&nbsp;·&nbsp;<em>Spring 2026</em>
          </span>
          <span className="intro-cover__bounds">N&nbsp;59°&nbsp;55′&nbsp;·&nbsp;E&nbsp;10°&nbsp;45′</span>
        </header>

        <IntroPlate cities={INTRO_CITIES} />

        <footer className="intro-cover__foot">
          <ul className="intro-cover__gazetteer" aria-label="Featured cities">
            {INTRO_CITIES.map((c) => (
              <li key={c.key} data-city={c.key}>
                {c.label}
              </li>
            ))}
          </ul>
          <img className="intro-cover__mark" src={wordmark} alt="Holidaze" />
          <p className="intro-cover__tag">
            <em>Stay</em> somewhere particular.
          </p>
        </footer>
      </div>
    </div>
  )
}
