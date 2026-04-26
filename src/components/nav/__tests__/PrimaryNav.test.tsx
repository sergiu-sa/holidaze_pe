import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PrimaryNav } from '../PrimaryNav'

function renderNav(initialPath = '/', isOpen = false) {
  const onLinkClick = vi.fn()
  const view = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PrimaryNav isOpen={isOpen} onLinkClick={onLinkClick} />
    </MemoryRouter>,
  )
  return { ...view, onLinkClick }
}

describe('PrimaryNav', () => {
  it('renders all 4 nav links', () => {
    renderNav()
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^venues$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^atlas$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^hosts$/i })).toBeInTheDocument()
  })

  it('marks the active route with aria-current="page"', () => {
    renderNav('/venues')
    expect(screen.getByRole('link', { name: /^venues$/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /^home$/i })).not.toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('has the nav element with id="primary-nav"', () => {
    renderNav()
    expect(screen.getByRole('navigation', { name: /primary/i })).toHaveAttribute(
      'id',
      'primary-nav',
    )
  })

  it('applies is-open class when isOpen is true', () => {
    renderNav('/', true)
    expect(screen.getByRole('navigation')).toHaveClass('is-open')
  })

  it('does not apply is-open class when isOpen is false', () => {
    renderNav('/', false)
    expect(screen.getByRole('navigation')).not.toHaveClass('is-open')
  })
})
