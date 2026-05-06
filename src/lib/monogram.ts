import { type MonoColor } from './prefs'

const GROUND: Record<MonoColor, { bg: string; fg: string }> = {
  ink: { bg: '#0F0E0B', fg: '#F5EEDD' },
  cinnabar: { bg: '#B8371D', fg: '#F5EEDD' },
  cobalt: { bg: '#1E3358', fg: '#F5EEDD' },
  saffron: { bg: '#D4A130', fg: '#0F0E0B' },
}

// Reverse lookup: bg hex (without #) → MonoColor.
const HEX_TO_COLOR = Object.fromEntries(
  Object.entries(GROUND).map(([color, { bg }]) => [bg.slice(1).toUpperCase(), color]),
) as Record<string, MonoColor>

const MONOGRAM_URI_PREFIX = 'data:image/svg+xml,'

export function isMonogramUrl(url: string): boolean {
  return url.startsWith(MONOGRAM_URI_PREFIX)
}

// Extract the MonoColor from a monogram data URI by reading the rect fill.
// Used on page load so the swatch picker reflects the colour currently
// encoded in the saved avatar.
export function monoColorFromUrl(url: string): MonoColor | null {
  if (!isMonogramUrl(url)) return null
  const match = /rect[^>]*fill='%23([0-9A-Fa-f]{6})'/.exec(url)
  if (!match) return null
  return HEX_TO_COLOR[match[1].toUpperCase()] ?? null
}

// Snapshot a mono ground + initial into a real avatar URL so the user's
// "no photo, just initial + colour" choice survives device changes and is
// visible to other users via the standard Noroff avatar field.
//
// Encoded as a minimal SVG data URI with only `#` escaped — `encodeURIComponent`
// inflates the URL past Noroff's 300-character avatar URL limit. Browsers
// tolerate the unescaped `<`, `>`, `'`, ` ` chars in `data:image/svg+xml,...`.
export function monogramAvatarUrl(initial: string, color: MonoColor): string {
  const letter = (initial.charAt(0) || '?').toUpperCase()
  const { bg, fg } = GROUND[color]
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 99 99'><rect width='99' height='99' fill='${bg}'/><text x='49.5' y='66' fill='${fg}' font-family='Fraunces,Georgia,serif' font-style='italic' font-size='56' text-anchor='middle'>${letter}</text></svg>`
  return `data:image/svg+xml,${svg.replace(/#/g, '%23')}`
}
