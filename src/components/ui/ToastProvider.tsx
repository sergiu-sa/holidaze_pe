import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

interface Toast {
  id: number
  message: string
}

const ToastContext = createContext<((message: string) => void) | null>(null)

/** Single-slot toast. Slice 5.2 will add a queue, dismissal, and positioning. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)

  const fire = useCallback((message: string) => {
    setToast({ id: Date.now() + Math.random(), message })
  }, [])

  return (
    <ToastContext.Provider value={fire}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-toast max-w-sm border border-ink bg-bone px-4 py-3 font-mono text-xs shadow-[8px_8px_0_var(--ink)]"
        hidden={!toast}
      >
        {toast?.message}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): (message: string) => void {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
