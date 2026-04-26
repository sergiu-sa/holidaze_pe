import { useEffect, useRef } from 'react'

export interface NavToggleProps {
  isOpen: boolean
  onToggle: () => void
}

// NavToggle — hamburger/close button for the mobile nav. Traps focus
// inside #primary-nav while open and closes on Esc.
export function NavToggle({ isOpen, onToggle }: NavToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onToggle()
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onToggle])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Focus trap implemented natively to avoid pulling in a focus-trap library.
  useEffect(() => {
    if (!isOpen) return

    const nav = document.getElementById('primary-nav')
    if (!nav) return

    const getFocusable = () =>
      Array.from(
        nav.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    nav.addEventListener('keydown', handleTab)
    return () => {
      nav.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

  return (
    <button
      ref={buttonRef}
      type="button"
      className="nav-toggle"
      aria-controls="primary-nav"
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      onClick={onToggle}
    >
      {isOpen ? 'Close' : 'Menu'}
    </button>
  )
}
