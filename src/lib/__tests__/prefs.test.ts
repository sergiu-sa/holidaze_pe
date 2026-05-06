import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { applyMonoColorToBody, getMonoColor, MONO_COLORS, setMonoColor } from '../prefs'

describe('prefs', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.removeAttribute('data-mono')
  })

  afterEach(() => {
    document.body.removeAttribute('data-mono')
  })

  it('returns "ink" by default', () => {
    expect(getMonoColor()).toBe('ink')
  })

  it('persists a valid color and reads it back', () => {
    setMonoColor('cinnabar')
    expect(getMonoColor()).toBe('cinnabar')
  })

  it('falls back to "ink" when localStorage value is unrecognised', () => {
    localStorage.setItem('holidaze:v1:prefs', JSON.stringify({ monoColor: 'orange' }))
    expect(getMonoColor()).toBe('ink')
  })

  it('exposes the four allowed colours', () => {
    expect(MONO_COLORS).toEqual(['ink', 'cinnabar', 'cobalt', 'saffron'])
  })

  it('applyMonoColorToBody writes data-mono to <body>', () => {
    applyMonoColorToBody('saffron')
    expect(document.body.dataset.mono).toBe('saffron')
  })
})
