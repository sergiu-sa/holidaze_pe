import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { RouteErrorBoundary } from '../RouteErrorBoundary'

function Bomb(): never {
  throw new Error('Test render error')
}

describe('RouteErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    render(
      <RouteErrorBoundary>
        <p>All good</p>
      </RouteErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders the error UI when a child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <RouteErrorBoundary>
        <Bomb />
      </RouteErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/something came/i)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('"Try again" resets the error state and re-renders children', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const user = userEvent.setup()

    let shouldThrow = true

    function MaybeThrow() {
      if (shouldThrow) throw new Error('Conditional error')
      return <p>Recovered</p>
    }

    const { rerender } = render(
      <RouteErrorBoundary>
        <MaybeThrow />
      </RouteErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: /try again/i }))

    rerender(
      <RouteErrorBoundary>
        <MaybeThrow />
      </RouteErrorBoundary>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Recovered')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
