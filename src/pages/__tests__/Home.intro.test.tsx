import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import Home from '../Home'

const KEY = 'holidaze:v1:intro-seen'

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home — IntroCover mount', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders the IntroCover on first visit (no localStorage flag)', async () => {
    renderHome()
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /welcome to holidaze/i })).toBeInTheDocument()
    })
  })

  it('does NOT render the IntroCover when localStorage flag is "1"', async () => {
    localStorage.setItem(KEY, '1')
    renderHome()
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /welcome to holidaze/i })).not.toBeInTheDocument()
    })
  })
})
