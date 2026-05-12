import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HOSTS_SPECIMENS } from '../../../lib/hosts/specimens'
import { HostPlates } from '../HostPlates'

describe('<HostPlates>', () => {
  it('renders one figure per specimen', () => {
    render(<HostPlates />)
    HOSTS_SPECIMENS.forEach((s) => {
      expect(
        screen.getByText(new RegExp(s.name.last, 'i')),
      ).toBeInTheDocument()
    })
  })

  it('shows the index stamp with the specimen count', () => {
    render(<HostPlates />)
    const stamp = screen.getByLabelText(/index stamp/i)
    expect(stamp).toHaveTextContent(/0?6/)
  })

  it('marks each kept amount with a "specimen" mono token', () => {
    render(<HostPlates />)
    const tokens = screen.getAllByText(/specimen/i, { selector: 'small' })
    expect(tokens.length).toBe(HOSTS_SPECIMENS.length)
  })

  it('renders the pull-quote aside', () => {
    render(<HostPlates />)
    expect(screen.getByLabelText(/pull quote/i)).toBeInTheDocument()
  })

  it("renders Niamh O'Hara as the first-name in the pull-quote attribution", () => {
    render(<HostPlates />)
    const quote = screen.getByLabelText(/pull quote/i)
    expect(quote).toHaveTextContent(/niamh/i)
  })
})
