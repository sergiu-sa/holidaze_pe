const STORAGE_KEY = 'holidaze:v1:prefs'

export const MONO_COLORS = ['ink', 'cinnabar', 'cobalt', 'saffron'] as const
export type MonoColor = (typeof MONO_COLORS)[number]

interface Prefs {
  monoColor?: MonoColor
}

function read(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Prefs
  } catch {
    return {}
  }
}

function write(next: Prefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage may be unavailable (private mode, quota); fail silent.
  }
}

function isMonoColor(value: unknown): value is MonoColor {
  return typeof value === 'string' && (MONO_COLORS as readonly string[]).includes(value)
}

export function getMonoColor(): MonoColor {
  const stored = read().monoColor
  return isMonoColor(stored) ? stored : 'ink'
}

export function setMonoColor(color: MonoColor): void {
  write({ ...read(), monoColor: color })
  applyMonoColorToBody(color)
}

export function applyMonoColorToBody(color: MonoColor): void {
  document.body.dataset.mono = color
}
