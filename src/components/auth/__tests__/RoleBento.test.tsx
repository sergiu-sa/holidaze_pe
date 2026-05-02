import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { RoleBento } from '../RoleBento'

function Controlled({ initial }: { initial: 'guest' | 'host' }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <RoleBento value={value} onChange={setValue} />
      <p data-testid="value">{value}</p>
    </>
  )
}

describe('RoleBento', () => {
  it('renders both roles inside a radiogroup', () => {
    render(<Controlled initial="guest" />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /guest/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /host/i })).not.toBeChecked()
  })

  it('flips selection when host is clicked', async () => {
    render(<Controlled initial="guest" />)
    await userEvent.click(screen.getByRole('radio', { name: /host/i }))
    expect(screen.getByTestId('value')).toHaveTextContent('host')
  })

  it('honours initial host', () => {
    render(<Controlled initial="host" />)
    expect(screen.getByRole('radio', { name: /host/i })).toBeChecked()
  })
})
