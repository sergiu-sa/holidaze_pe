import type { HTMLAttributes, ReactNode } from 'react'

export type MonoElement = 'span' | 'p' | 'code'

export interface MonoProps extends HTMLAttributes<HTMLElement> {
  as?: MonoElement
  children: ReactNode
  className?: string
}

// Mono — typographic primitive for JetBrains Mono labels (footer status, coords, codes).
// Polymorphic across span / p / code; defaults to span for inline usage.
export function Mono({ as: Tag = 'span', className, children, ...rest }: MonoProps) {
  const composed = ['mono', className].filter(Boolean).join(' ')
  return (
    <Tag className={composed} {...rest}>
      {children}
    </Tag>
  )
}
