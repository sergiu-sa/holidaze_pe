import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
} from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'cobalt' | 'link'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn btn--primary',
  ghost: 'btn btn--ghost',
  cobalt: 'btn btn--cobalt',
  link: 'btn--link',
}

const META_KEYS = new Set(['as', 'variant', 'loading', 'className', 'children'])

interface CommonProps {
  variant?: ButtonVariant
  loading?: boolean
  children: ReactNode
  className?: string
}

type ButtonAsButton = CommonProps & {
  as?: 'button'
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

type ButtonAsAnchor = CommonProps & {
  as: 'a'
  href: string
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'>

export type ButtonProps = ButtonAsButton | ButtonAsAnchor

function buildClassName(variant: ButtonVariant, loading: boolean, extra?: string) {
  const parts = [VARIANT_CLASS[variant]]
  if (loading) parts.push('btn--loading')
  if (extra) parts.push(extra)
  return parts.join(' ')
}

function stripMeta(props: object): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (!META_KEYS.has(key)) out[key] = value
  }
  return out
}

// Button — the primary interactive primitive. Polymorphic between <button> and <a>
// so CTA links and form submits share the same visual + a11y baseline.
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { variant = 'primary', loading = false, className, children } = props
    const computedClass = buildClassName(variant, loading, className)

    if (props.as === 'a') {
      const anchorProps = stripMeta(props) as AnchorHTMLAttributes<HTMLAnchorElement>
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={computedClass}
          aria-busy={loading || undefined}
          aria-disabled={loading || undefined}
          {...anchorProps}
        >
          {children}
        </a>
      )
    }

    const buttonProps = stripMeta(props) as ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonProps.type ?? 'button'}
        className={computedClass}
        disabled={buttonProps.disabled ?? loading}
        aria-busy={loading || undefined}
        {...buttonProps}
      >
        {children}
      </button>
    )
  },
)
