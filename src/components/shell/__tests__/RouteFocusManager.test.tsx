import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { RouteFocusManager } from '../RouteFocusManager'

function PageA() {
  return (
    <h1 data-route-anchor tabIndex={-1}>
      Page A
    </h1>
  )
}

function PageB() {
  return (
    <h1 data-route-anchor tabIndex={-1}>
      Page B
    </h1>
  )
}

describe('RouteFocusManager', () => {
  it('focuses the [data-route-anchor] element on route change', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/a']}>
        <RouteFocusManager />
        <Routes>
          <Route path="/a" element={<PageA />} />
          <Route path="/b" element={<PageB />} />
        </Routes>
      </MemoryRouter>,
    )

    const headingA = await screen.findByRole('heading', { level: 1 })
    expect(headingA).toHaveFocus()

    rerender(
      <MemoryRouter initialEntries={['/b']}>
        <RouteFocusManager />
        <Routes>
          <Route path="/a" element={<PageA />} />
          <Route path="/b" element={<PageB />} />
        </Routes>
      </MemoryRouter>,
    )

    const headingB = await screen.findByRole('heading', { level: 1 })
    expect(headingB).toHaveFocus()
  })

  it('does nothing when no [data-route-anchor] is present', () => {
    expect(() =>
      render(
        <MemoryRouter initialEntries={['/x']}>
          <RouteFocusManager />
        </MemoryRouter>,
      ),
    ).not.toThrow()
  })
})
