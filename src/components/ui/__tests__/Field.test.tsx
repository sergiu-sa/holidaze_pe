import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Field } from '../Field'

describe('Field', () => {
  it('renders a labelled input and accepts typing', async () => {
    render(<Field label="Email" name="email" type="email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toBeInTheDocument()
    await userEvent.type(input, 'a@stud.noroff.no')
    expect(input).toHaveValue('a@stud.noroff.no')
  })

  it('exposes hint text via aria-describedby', () => {
    render(<Field label="Password" hint="Min 8 characters" />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAccessibleDescription('Min 8 characters')
  })

  it('renders the error variant with aria-invalid and role="alert"', () => {
    render(<Field label="Email" error="Required" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Required')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('accepts a custom <textarea> as control', () => {
    render(
      <Field label="Notes">
        <textarea name="notes" />
      </Field>,
    )
    const ta = screen.getByLabelText('Notes')
    expect(ta.tagName).toBe('TEXTAREA')
  })
})
