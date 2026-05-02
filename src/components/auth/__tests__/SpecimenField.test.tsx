import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SpecimenField } from '../SpecimenField'

describe('SpecimenField', () => {
  it('renders num, name, hint, and the input', () => {
    render(
      <SpecimenField
        num="01"
        name="Email"
        hint="ends in stud.noroff.no"
        id="email"
        type="email"
      />,
    )
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('ends in stud.noroff.no')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email')
  })

  it('wires aria-invalid and aria-describedby when error is set', () => {
    render(
      <SpecimenField
        num="01"
        name="Email"
        hint="ends in stud.noroff.no"
        id="email"
        type="email"
        error="Email must end in stud.noroff.no"
      />,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(screen.getByText('Email must end in stud.noroff.no')).toHaveAttribute(
      'id',
      describedBy!,
    )
  })

  it('does not set aria-invalid when no error', () => {
    render(
      <SpecimenField num="01" name="Email" hint="hint" id="email" type="email" />,
    )
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid', 'true')
  })
})
