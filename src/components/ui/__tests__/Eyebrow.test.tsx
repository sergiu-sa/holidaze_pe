import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Eyebrow } from '../Eyebrow'

describe('Eyebrow', () => {
  it('renders num + label slots together', () => {
    render(<Eyebrow num="N°04" label="Browse" data-testid="eyebrow" />)
    expect(screen.getByText('N°04')).toHaveClass('eyebrow__num')
    expect(screen.getByText('Browse')).toHaveClass('eyebrow__label')
    expect(screen.getByTestId('eyebrow')).toHaveClass('eyebrow')
  })

  it('renders label only when num is omitted', () => {
    render(<Eyebrow label="Atlas" data-testid="eyebrow" />)
    expect(screen.getByText('Atlas')).toHaveClass('eyebrow__label')
    expect(screen.queryByText('N°04')).not.toBeInTheDocument()
    expect(screen.getByTestId('eyebrow')).toHaveClass('eyebrow')
  })
})
