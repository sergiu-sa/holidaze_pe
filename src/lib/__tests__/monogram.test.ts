import { describe, expect, it } from 'vitest'

import { isMonogramUrl, monoColorFromUrl, monogramAvatarUrl } from '../monogram'

describe('monogramAvatarUrl', () => {
  it('returns a data:image/svg+xml URI', () => {
    const url = monogramAvatarUrl('O', 'cinnabar')
    expect(url.startsWith('data:image/svg+xml,')).toBe(true)
  })

  it('embeds the uppercased initial', () => {
    const url = monogramAvatarUrl('o', 'ink')
    expect(url).toContain('%3EO%3C/text%3E')
  })

  it('uppercases a lowercase letter', () => {
    const url = monogramAvatarUrl('s', 'cinnabar')
    expect(url).toContain('%3ES%3C/text%3E')
  })

  it('renders the letter in Fraunces italic', () => {
    const url = monogramAvatarUrl('S', 'cinnabar')
    expect(url).toContain("font-family='Fraunces,Georgia,serif'")
    expect(url).toContain("font-style='italic'")
  })

  it('encodes cinnabar background + ivory letter', () => {
    const url = monogramAvatarUrl('S', 'cinnabar')
    expect(url).toContain('%23B8371D')
    expect(url).toContain('%23F5EEDD')
  })

  it('flips contrast for saffron — ink letter on yellow ground', () => {
    const url = monogramAvatarUrl('S', 'saffron')
    expect(url).toContain('%23D4A130')
    expect(url).toContain('%230F0E0B')
  })

  it('falls back to "?" for an empty initial', () => {
    const url = monogramAvatarUrl('', 'ink')
    expect(url).toContain('%3E?%3C/text%3E')
  })

  it("stays under Noroff's 300-character avatar URL limit", () => {
    for (const color of ['ink', 'cinnabar', 'cobalt', 'saffron'] as const) {
      const url = monogramAvatarUrl('W', color)
      expect(url.length).toBeLessThan(300)
    }
  })
})

describe('isMonogramUrl', () => {
  it('returns true for a generated monogram URI', () => {
    expect(isMonogramUrl(monogramAvatarUrl('O', 'cinnabar'))).toBe(true)
  })

  it('returns false for an http(s) URL', () => {
    expect(isMonogramUrl('https://example.com/me.jpg')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isMonogramUrl('')).toBe(false)
  })

  it('returns false for a non-svg data URI', () => {
    expect(isMonogramUrl('data:image/png;base64,abc')).toBe(false)
  })
})

describe('monoColorFromUrl', () => {
  it('returns the encoded MonoColor for a generated monogram URI', () => {
    expect(monoColorFromUrl(monogramAvatarUrl('O', 'cinnabar'))).toBe('cinnabar')
    expect(monoColorFromUrl(monogramAvatarUrl('O', 'ink'))).toBe('ink')
    expect(monoColorFromUrl(monogramAvatarUrl('O', 'cobalt'))).toBe('cobalt')
    expect(monoColorFromUrl(monogramAvatarUrl('O', 'saffron'))).toBe('saffron')
  })

  it('returns null for a real photo URL', () => {
    expect(monoColorFromUrl('https://example.com/me.jpg')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(monoColorFromUrl('')).toBeNull()
  })

  it('returns null when the SVG hex is unrecognised', () => {
    const tampered = monogramAvatarUrl('O', 'ink').replace(
      /%230F0E0B/g,
      '%23ABCDEF',
    )
    expect(monoColorFromUrl(tampered)).toBeNull()
  })
})
