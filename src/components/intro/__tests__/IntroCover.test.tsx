import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import IntroCover from '../IntroCover'

const noop = (): void => undefined

describe('IntroCover — markup', () => {
  it('renders a dialog with an accessible label', () => {
    render(<IntroCover onDismissed={noop} />)
    expect(screen.getByRole('dialog', { name: /welcome to holidaze/i })).toBeInTheDocument()
  })

  it('renders the head row eyebrow + bounds line', () => {
    render(<IntroCover onDismissed={noop} />)
    expect(screen.getByText(/N°04/)).toBeInTheDocument()
    expect(screen.getByText(/Spring 2026/)).toBeInTheDocument()
    expect(screen.getByText(/N\s59°\s55′/)).toBeInTheDocument()
    expect(screen.getByText(/E\s10°\s45′/)).toBeInTheDocument()
  })

  it('renders the gazetteer of eight cities exposed to AT', () => {
    render(<IntroCover onDismissed={noop} />)
    const gazetteer = screen.getByRole('list', { name: /featured cities/i })
    expect(gazetteer).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(8)
    expect(items[0]).toHaveTextContent('Oslo')
    expect(items[7]).toHaveTextContent('Sydney')
  })

  it('renders the wordmark img with alt="Holidaze"', () => {
    render(<IntroCover onDismissed={noop} />)
    expect(screen.getByAltText('Holidaze')).toBeInTheDocument()
  })

  it('renders the tagline "Stay somewhere particular."', () => {
    render(<IntroCover onDismissed={noop} />)
    expect(screen.getByText(/somewhere particular/i)).toBeInTheDocument()
  })

  it('does not crash when IntroPlate mounts (smoke check)', () => {
    expect(() => render(<IntroCover onDismissed={vi.fn()} />)).not.toThrow()
  })
})

describe('IntroCover — dismiss', () => {
  it('locks document.body scroll on mount and restores on unmount', () => {
    const { unmount } = render(<IntroCover onDismissed={noop} />)
    expect(document.body).toHaveStyle({ overflow: 'hidden' })
    unmount()
    expect(document.body).toHaveStyle({ overflow: '' })
  })

  it('dismiss on click — applies the fade-out class and calls onDismissed after 720 ms', () => {
    vi.useFakeTimers()
    const onDismissed = vi.fn()
    render(<IntroCover onDismissed={onDismissed} />)

    fireEvent.click(document)

    expect(screen.getByRole('dialog')).toHaveClass('intro-cover--out')
    expect(onDismissed).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(720)
    })

    expect(onDismissed).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('dismiss on any key except Tab', () => {
    vi.useFakeTimers()
    const onDismissed = vi.fn()
    render(<IntroCover onDismissed={onDismissed} />)

    fireEvent.keyDown(document, { key: 'Enter' })
    act(() => {
      vi.advanceTimersByTime(720)
    })

    expect(onDismissed).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('Tab key does NOT dismiss (preserves skip-link reachability)', () => {
    vi.useFakeTimers()
    const onDismissed = vi.fn()
    render(<IntroCover onDismissed={onDismissed} />)

    fireEvent.keyDown(document, { key: 'Tab' })
    act(() => {
      vi.advanceTimersByTime(720)
    })

    expect(onDismissed).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('only fires onDismissed once even with multiple dismiss triggers', () => {
    vi.useFakeTimers()
    const onDismissed = vi.fn()
    render(<IntroCover onDismissed={onDismissed} />)

    fireEvent.click(document)
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.click(document)
    act(() => {
      vi.advanceTimersByTime(720)
    })

    expect(onDismissed).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

describe('IntroCover — auto-timer', () => {
  it('auto-dismisses at 4.9 seconds when reduced motion is OFF', () => {
    vi.useFakeTimers()
    const onDismissed = vi.fn()

    // matchMedia: reduced motion = false
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
      onchange: null,
    }))

    render(<IntroCover onDismissed={onDismissed} />)

    act(() => {
      vi.advanceTimersByTime(4899)
    })
    expect(onDismissed).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)        // 4900 — fade-out begins
      vi.advanceTimersByTime(720)      // fade completes
    })
    expect(onDismissed).toHaveBeenCalledTimes(1)

    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('does NOT auto-dismiss when reduced motion is ON', () => {
    vi.useFakeTimers()
    const onDismissed = vi.fn()

    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
      onchange: null,
    }))

    render(<IntroCover onDismissed={onDismissed} />)

    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(onDismissed).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
})
