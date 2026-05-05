import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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

describe('ToastProvider — queue + auto-dismiss', () => {
  it('caps the visible queue at MAX_VISIBLE = 3 (FIFO drop)', async () => {
    function Probe() {
      const toast = useToast()
      return (
        <>
          <button type="button" onClick={() => { toast('one') }}>1</button>
          <button type="button" onClick={() => { toast('two') }}>2</button>
          <button type="button" onClick={() => { toast('three') }}>3</button>
          <button type="button" onClick={() => { toast('four') }}>4</button>
        </>
      )
    }
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    )

    await userEvent.click(screen.getByText('1'))
    await userEvent.click(screen.getByText('2'))
    await userEvent.click(screen.getByText('3'))
    await userEvent.click(screen.getByText('4'))

    const live = screen.getByRole('status')
    expect(live).not.toHaveTextContent('one')        // dropped
    expect(live).toHaveTextContent('two')
    expect(live).toHaveTextContent('three')
    expect(live).toHaveTextContent('four')
  })

  it('auto-dismisses a toast after the default duration', () => {
    // user-event v14 + vitest v4 fake timers hang on `await user.click()`,
    // so fire the click with `fireEvent` (sync) to keep fake timers active.
    vi.useFakeTimers()
    function Probe() {
      const toast = useToast()
      return <button type="button" onClick={() => { toast('flash') }}>fire</button>
    }
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByText('fire'))

    expect(screen.getByRole('status')).toHaveTextContent('flash')

    act(() => {
      vi.advanceTimersByTime(4500)
    })

    expect(screen.getByRole('status')).not.toHaveTextContent('flash')

    vi.useRealTimers()
  })
})
