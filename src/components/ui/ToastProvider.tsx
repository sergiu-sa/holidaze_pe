import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastOptions {
  kind?: ToastKind
  duration?: number       // ms; default 4000; pass 0 to disable auto-dismiss
}

interface Toast {
  id: number
  message: string
  kind: ToastKind
}

const MAX_VISIBLE = 3
const DEFAULT_DURATION_MS = 4000

const ToastContext = createContext<((message: string, opts?: ToastOptions) => void) | null>(null)

/** Queued toast surface — bottom-right stack, MAX_VISIBLE = 3, FIFO drop. Auto-dismisses after `duration` ms (default 4000); pass 0 to disable. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const handle = timeouts.current.get(id)
    if (handle) {
      clearTimeout(handle)
      timeouts.current.delete(id)
    }
  }, [])

  const fire = useCallback(
    (message: string, opts?: ToastOptions) => {
      const id = Date.now() + Math.random()
      const kind: ToastKind = opts?.kind ?? 'info'
      const duration = opts?.duration ?? DEFAULT_DURATION_MS

      setToasts((prev) => {
        const next = [...prev, { id, message, kind }]
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next
      })

      if (duration > 0) {
        const handle = setTimeout(() => { dismiss(id) }, duration)
        timeouts.current.set(id, handle)
      }
    },
    [dismiss],
  )

  useEffect(() => {
    const map = timeouts.current
    return () => {
      map.forEach((h) => { clearTimeout(h) })
      map.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={fire}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="toast-host"
        data-empty={toasts.length === 0 ? '' : undefined}
      >
        <ol className="toast-list">
          {toasts.map((t) => (
            <li key={t.id} className={`toast toast--${t.kind}`}>
              <span className="toast__message">{t.message}</span>
              <button
                type="button"
                className="toast__dismiss"
                aria-label="Dismiss notification"
                onClick={() => { dismiss(t.id) }}
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): (message: string, opts?: ToastOptions) => void {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
