import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
} from 'react'
import { flushSync } from 'react-dom'

interface TabsContextValue<V extends string = string> {
  value: V
  onChange: (next: V) => void
  ariaLabel: string
  baseId: string
  registerTab: (value: V, ref: HTMLButtonElement | null) => void
  focusTab: (value: V) => void
  values: V[]
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext<V extends string>(): TabsContextValue<V> {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tab components must be used inside <Tabs>')
  return ctx as unknown as TabsContextValue<V>
}

export interface TabsProps<V extends string = string> {
  value: V
  onChange: (next: V) => void
  ariaLabel: string
  children: ReactNode
}

export function Tabs<V extends string>({ value, onChange, ariaLabel, children }: TabsProps<V>) {
  const baseId = useId()
  const refs = useRef(new Map<V, HTMLButtonElement>())
  const valuesRef = useRef<V[]>([])

  const registerTab = useCallback((v: V, ref: HTMLButtonElement | null) => {
    if (ref) {
      refs.current.set(v, ref)
      if (!valuesRef.current.includes(v)) valuesRef.current = [...valuesRef.current, v]
    } else {
      refs.current.delete(v)
      valuesRef.current = valuesRef.current.filter((x) => x !== v)
    }
  }, [])

  const focusTab = useCallback((v: V) => {
    refs.current.get(v)?.focus()
  }, [])

  const ctx = useMemo<TabsContextValue<V>>(
    () => ({
      value,
      onChange,
      ariaLabel,
      baseId,
      registerTab,
      focusTab,
      get values() {
        return valuesRef.current
      },
    }),
    [value, onChange, ariaLabel, baseId, registerTab, focusTab],
  )

  return (
    <TabsContext.Provider value={ctx as unknown as TabsContextValue}>{children}</TabsContext.Provider>
  )
}

export function TabList({ children }: { children: ReactNode }) {
  const ctx = useTabsContext()
  return (
    <div role="tablist" aria-label={ctx.ariaLabel} className="tabs__list">
      {children}
    </div>
  )
}

export interface TabProps<V extends string = string> {
  value: V
  children: ReactNode
}

export function Tab<V extends string>({ value, children }: TabProps<V>) {
  const ctx = useTabsContext<V>()
  const isActive = ctx.value === value

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const list = ctx.values
    if (list.length === 0) return
    const i = list.indexOf(value)
    let nextIndex = i
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (i + 1) % list.length
        break
      case 'ArrowLeft':
        nextIndex = (i - 1 + list.length) % list.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = list.length - 1
        break
      default:
        return
    }
    e.preventDefault()
    const next = list[nextIndex]
    flushSync(() => {
      ctx.onChange(next)
    })
    ctx.focusTab(next)
  }

  return (
    <button
      type="button"
      role="tab"
      ref={(el) => {
        ctx.registerTab(value, el)
      }}
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      className="tabs__btn"
      data-active={isActive ? '' : undefined}
      onClick={() => {
        ctx.onChange(value)
      }}
      onKeyDown={onKey}
    >
      {children}
    </button>
  )
}

export function TabPanels({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export interface TabPanelProps<V extends string = string> {
  value: V
  children: ReactNode
}

export function TabPanel<V extends string>({ value, children }: TabPanelProps<V>) {
  const ctx = useTabsContext<V>()
  if (ctx.value !== value) return null
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      className="tabs__panel"
    >
      {children}
    </div>
  )
}
