import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Hosts from '../Hosts'

describe('Hosts page', () => {
  beforeEach(() => {
    document.title = 'Holidaze'
    document.documentElement.classList.remove('fonts-ready')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the breadcrumb trail', () => {
    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveTextContent(/home/i)
    expect(nav).toHaveTextContent(/hosts/i)
  })

  it('sets the document title', () => {
    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>,
    )
    expect(document.title).toMatch(/hosting/i)
  })

  it('adds the fonts-ready class to <html>', async () => {
    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('fonts-ready')
    })
  })
})
