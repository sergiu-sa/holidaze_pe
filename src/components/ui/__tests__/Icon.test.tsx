import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon } from '../Icon'

describe('Icon', () => {
  it('renders a labelled icon with role="img" + correct size attrs', () => {
    render(<Icon name="search" label="Search" />)
    const svg = screen.getByRole('img', { name: 'Search' })
    expect(svg).toHaveAttribute('width', '18')
    expect(svg).toHaveAttribute('height', '18')
  })

  it('exposes size lg = 24px when set', () => {
    render(<Icon name="close" size="lg" label="Close menu" />)
    const svg = screen.getByRole('img', { name: 'Close menu' })
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })
})
