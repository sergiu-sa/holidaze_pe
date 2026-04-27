import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Chip } from '../Chip'

describe('Chip', () => {
  it('renders the index variant with cinnabar fill class', () => {
    render(<Chip variant="index">N°04</Chip>)
    const chip = screen.getByText('N°04')
    expect(chip).toHaveClass('chip', 'chip--index')
  })

  it('renders the amenity variant with hairline border class and label', () => {
    render(
      <Chip variant="amenity" icon="wifi" data-testid="amenity-chip">
        Wi-Fi
      </Chip>,
    )
    const chip = screen.getByTestId('amenity-chip')
    expect(chip).toHaveClass('chip--amenity')
    expect(chip).toHaveTextContent('Wi-Fi')
  })
})
