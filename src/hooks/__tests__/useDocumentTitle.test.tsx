import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useDocumentTitle } from '../useDocumentTitle'

function Probe({ title }: { title: string }) {
  useDocumentTitle(title)
  return null
}

describe('useDocumentTitle', () => {
  const original = document.title

  afterEach(() => {
    document.title = original
  })

  it('sets document.title with the Holidaze suffix on mount', () => {
    render(<Probe title="Venues" />)
    expect(document.title).toBe('Venues · Holidaze')
  })

  it('restores the previous title on unmount', () => {
    document.title = 'Previous'
    const { unmount } = render(<Probe title="Venues" />)
    expect(document.title).toBe('Venues · Holidaze')
    unmount()
    expect(document.title).toBe('Previous')
  })

  it('updates the title when the input changes', () => {
    const { rerender } = render(<Probe title="A" />)
    expect(document.title).toBe('A · Holidaze')
    rerender(<Probe title="B" />)
    expect(document.title).toBe('B · Holidaze')
  })
})
