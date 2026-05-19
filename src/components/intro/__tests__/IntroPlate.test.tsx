import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { INTRO_CITIES } from '../../../lib/intro/cities'
import { IntroPlate } from '../IntroPlate'

describe('IntroPlate', () => {
  it('renders a WorldPlate with an accessible label', () => {
    render(<IntroPlate cities={INTRO_CITIES} />)
    expect(screen.getByRole('group', { name: /eight holidaze cities/i })).toBeInTheDocument()
  })

  it('renders one pin element per city with a data-city attribute', () => {
    render(<IntroPlate cities={INTRO_CITIES} />)
    // eslint-disable-next-line testing-library/no-node-access -- data-city is a component contract attribute, no ARIA query covers it
    const pins = document.querySelectorAll('[data-city]')
    expect(pins).toHaveLength(INTRO_CITIES.length)
    const keys = Array.from(pins).map((el) => el.getAttribute('data-city'))
    expect(keys).toEqual(INTRO_CITIES.map((c) => c.key))
  })

  it('positions each pin via inline left/top percentages', () => {
    render(<IntroPlate cities={INTRO_CITIES} />)
    // eslint-disable-next-line testing-library/no-node-access -- inline style has no Testing Library equivalent
    const pins = document.querySelectorAll<HTMLDivElement>('[data-city]')
    for (const pin of pins) {
      expect(pin.style.left).toMatch(/%$/)
      expect(pin.style.top).toMatch(/%$/)
    }
  })

  it("marks the pin marker layer aria-hidden so the plate's role=group owns the description", () => {
    render(<IntroPlate cities={INTRO_CITIES} />)
    // eslint-disable-next-line testing-library/no-node-access -- BEM class has no semantic role to query by
    const markers = document.querySelector('.intro-cover__markers')
    expect(markers).not.toBeNull()
    expect(markers).toHaveAttribute('aria-hidden', 'true')
  })
})
