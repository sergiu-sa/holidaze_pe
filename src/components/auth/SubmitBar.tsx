import type { ButtonHTMLAttributes } from 'react'

interface SubmitBarProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  pendingLabel: string
  pending?: boolean
}

export function SubmitBar({
  label,
  pendingLabel,
  pending = false,
  type = 'submit',
  disabled,
  ...rest
}: SubmitBarProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled ?? pending}
      className="auth-submit"
      aria-busy={pending || undefined}
    >
      <span className="auth-submit__label">{pending ? pendingLabel : label}</span>
      <span className="auth-submit__arrow" aria-hidden="true">→</span>
    </button>
  )
}
