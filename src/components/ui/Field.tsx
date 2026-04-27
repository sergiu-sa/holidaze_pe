import {
  cloneElement,
  forwardRef,
  type InputHTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react'

interface FieldOwnProps {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  /** Optional pre-built control (e.g. <textarea>, <select>). Defaults to <input>. */
  children?: ReactElement
  className?: string
}

export type FieldProps = FieldOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof FieldOwnProps>

function buildClassName(hasError: boolean, extra?: string) {
  const parts = ['field']
  if (hasError) parts.push('field--error')
  if (extra) parts.push(extra)
  return parts.join(' ')
}

// Field — label + control + optional hint/error. The error sits OUTSIDE the <label>
// so the label's accessible name is just the field name, not "Email Required".
// Pass <textarea>/<select> as children to swap the control; omit children for default <input>.
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, children, className, id, ...inputProps },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const control =
    children && isValidElement(children) ? (
      cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: fieldId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })
    ) : (
      <input
        ref={ref}
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        {...inputProps}
      />
    )

  return (
    <div className={buildClassName(Boolean(error), className)}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      {control}
      {hint && (
        <span id={hintId} className="field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
})
