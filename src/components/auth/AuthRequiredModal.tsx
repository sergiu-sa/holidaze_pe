import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface AuthRequiredModalProps {
  open: boolean
  onClose: () => void
  trigger: 'book' | 'save'
  pendingActionKey: string
  pendingAction?: object
}

export function AuthRequiredModal({
  open,
  onClose,
  trigger,
  pendingActionKey,
  pendingAction,
}: AuthRequiredModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const location = useLocation()
  const next = encodeURIComponent(location.pathname + location.search)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleAuthClick() {
    if (pendingAction) {
      sessionStorage.setItem(pendingActionKey, JSON.stringify(pendingAction))
    }
  }

  function handleClose() {
    sessionStorage.removeItem(pendingActionKey)
    onClose()
  }

  const verb = trigger === 'book' ? 'book' : 'save'

  return (
    <dialog
      ref={ref}
      className="auth-modal"
      onClose={handleClose}
      onCancel={(event) => {
        event.preventDefault()
        handleClose()
      }}
    >
      <h2 className="auth-modal__title">Sign in to {verb}</h2>
      <p className="auth-modal__body">
        You need an account to {verb} on Holidaze. We&apos;ll bring you back here after.
      </p>
      <div className="auth-modal__actions">
        <Link className="auth-submit" to={`/login?next=${next}`} onClick={handleAuthClick}>
          Sign in
        </Link>
        <Link
          className="auth-submit auth-submit--secondary"
          to={`/register?next=${next}`}
          onClick={handleAuthClick}
        >
          Register
        </Link>
        <button type="button" className="auth-modal__close" onClick={handleClose}>
          Close
        </button>
      </div>
    </dialog>
  )
}
