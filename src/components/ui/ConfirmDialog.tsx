import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export interface ConfirmDialogOptions {
  rubric?: string
  title: string
  body?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

type Resolver = (ok: boolean) => void

interface ConfirmContextValue {
  confirm: (opts: ConfirmDialogOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

interface OpenState {
  opts: ConfirmDialogOptions
  resolver: Resolver
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenState | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  const confirm = useCallback<ConfirmContextValue['confirm']>((opts) => {
    return new Promise<boolean>((resolve) => {
      previousFocus.current = (document.activeElement as HTMLElement | null) ?? null
      setOpen({ opts, resolver: resolve })
    })
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      const target = open.opts.danger
        ? dialog.querySelector<HTMLElement>('[data-confirm-cancel]')
        : dialog.querySelector<HTMLElement>('[data-confirm-confirm]')
      target?.focus()
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm])

  function handleClose(result: boolean) {
    if (open) {
      open.resolver(result)
      setOpen(null)
      const prev = previousFocus.current
      previousFocus.current = null
      if (prev) {
        // Defer to a microtask so React commits setOpen(null) and unmounts the
        // dialog inner content before refocusing the trigger.
        queueMicrotask(() => { prev.focus() })
      }
    }
  }

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        className="confirm-dialog"
        data-variant={open?.opts.danger ? 'danger' : 'default'}
        aria-labelledby={open ? 'confirm-dialog-title' : undefined}
        aria-describedby={open?.opts.body ? 'confirm-dialog-body' : undefined}
        onClose={() => {
          // Dispatched by Esc and any close path. Resolve false if still pending.
          handleClose(false)
        }}
        onCancel={(event) => {
          // Esc fires `cancel` then `close`; let close handle resolve.
          event.preventDefault()
          dialogRef.current?.close()
        }}
      >
        {open && (
          <div className="confirm-dialog__inner">
            {open.opts.rubric && (
              <p className="confirm-dialog__rubric mono">{open.opts.rubric}</p>
            )}
            <h2 id="confirm-dialog-title" className="confirm-dialog__title">
              {open.opts.title}
            </h2>
            {open.opts.body && (
              <p id="confirm-dialog-body" className="confirm-dialog__body">
                {open.opts.body}
              </p>
            )}
            <div className="confirm-dialog__actions">
              <button
                type="button"
                data-confirm-cancel
                className="confirm-dialog__btn confirm-dialog__btn--secondary"
                onClick={() => {
                  handleClose(false)
                }}
              >
                {open.opts.cancelText ?? 'Cancel'}
              </button>
              <button
                type="button"
                data-confirm-confirm
                className={`confirm-dialog__btn ${open.opts.danger ? 'confirm-dialog__btn--danger' : 'confirm-dialog__btn--primary'}`}
                onClick={() => {
                  handleClose(true)
                }}
              >
                {open.opts.confirmText ?? 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): (opts: ConfirmDialogOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmDialogProvider>')
  return ctx.confirm
}
