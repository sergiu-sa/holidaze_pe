import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Mono } from '../Mono'

describe('Mono', () => {
  it('renders a span by default with the .mono class', () => {
    render(<Mono>N° 04</Mono>)
    const node = screen.getByText('N° 04')
    expect(node.tagName).toBe('SPAN')
    expect(node).toHaveClass('mono')
  })

  it('renders as <code> when as="code" is passed', () => {
    render(<Mono as="code">apiKey</Mono>)
    const node = screen.getByText('apiKey')
    expect(node.tagName).toBe('CODE')
    expect(node).toHaveClass('mono')
  })
})
