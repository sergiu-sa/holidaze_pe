import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ToastProvider, useToast } from '../ToastProvider'

function Probe() {
  const toast = useToast()
  return (
    <button
      type="button"
      onClick={() => {
        toast('Hello')
      }}
    >
      fire
    </button>
  )
}

describe('ToastProvider', () => {
  it('exposes useToast() that announces a message in the live region', async () => {
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    )

    await userEvent.click(screen.getByText('fire'))

    const live = screen.getByRole('status')
    expect(live).toHaveTextContent('Hello')
    expect(live).toHaveAttribute('aria-live', 'polite')
  })

  it('replaces a previous message when a new one fires', async () => {
    function Probe2() {
      const toast = useToast()
      return (
        <>
          <button
            type="button"
            onClick={() => {
              toast('First')
            }}
          >
            first
          </button>
          <button
            type="button"
            onClick={() => {
              toast('Second')
            }}
          >
            second
          </button>
        </>
      )
    }
    render(
      <ToastProvider>
        <Probe2 />
      </ToastProvider>,
    )

    await userEvent.click(screen.getByText('first'))
    expect(screen.getByRole('status')).toHaveTextContent('First')

    await userEvent.click(screen.getByText('second'))
    expect(screen.getByRole('status')).toHaveTextContent('Second')
  })

  it('throws when useToast is used outside the provider', () => {
    function Bare() {
      useToast()
      return null
    }
    expect(() => render(<Bare />)).toThrow(/ToastProvider/)
  })
})
