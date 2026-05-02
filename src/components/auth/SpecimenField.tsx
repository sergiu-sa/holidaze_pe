import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'

type Omitted = 'name'

export interface SpecimenFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, Omitted> {
  num: string
  name: string
  hint?: ReactNode
  error?: string
  id: string
}

export const SpecimenField = forwardRef<HTMLInputElement, SpecimenFieldProps>(
  function SpecimenField({ num, name, hint, error, id, ...inputProps }, ref) {
    const errorId = useId()
    const describedBy = error ? errorId : undefined

    return (
      <div className="auth-field">
        <label htmlFor={id} className="auth-field__label">
          <span className="auth-field__num">{num}</span>
          <span className="auth-field__name">{name}</span>
          {hint && <span className="auth-field__hint">{hint}</span>}
        </label>
        <input
          {...inputProps}
          ref={ref}
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="auth-field__input"
        />
        {error && (
          <p id={errorId} className="auth-field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
