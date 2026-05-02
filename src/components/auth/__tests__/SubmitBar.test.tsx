import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SubmitBar } from '../SubmitBar'

describe('SubmitBar', () => {
  it('renders the label and an arrow', () => {
    render(<SubmitBar label="Check in" pendingLabel="Checking in…" />)
    expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument()
  })

  it('disables and flips label when pending', () => {
    render(<SubmitBar label="Check in" pendingLabel="Checking in…" pending />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('Checking in…')
  })
})
