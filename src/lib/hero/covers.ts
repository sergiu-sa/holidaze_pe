import costaBravaUrl from '../../assets/hero/costa-brava.webp'
import kyotoUrl from '../../assets/hero/kyoto.webp'
import mediterraneanUrl from '../../assets/hero/mediterranean.webp'
import portovenereUrl from '../../assets/hero/portovenere.webp'

export interface HeroCover {
  /** Stable identifier — used as React key. */
  readonly key: string
  /** Bundled image asset (Vite-imported url). Drives <HeroPlate> and the Act 2 backdrop. */
  readonly src: string
  /** Accessible description of the photograph. */
  readonly alt: string
  /** Editorial coords — degrees + arcminutes, formatted for the folio mono caps line. */
  readonly coords: string
  /** Place line for the folio + plate caption. */
  readonly place: string
}

// Spring 2026 · N°04 — variant covers in rotation. Each entry carries its own
// coords + place so the Act 2 folio stays editorially honest as the cover
// advances. Rotation cadence is per page-load (see pickHeroCover).
export const HERO_COVERS: readonly HeroCover[] = [
  {
    key: 'costa-brava',
    src: costaBravaUrl,
    alt: 'A pastel cliffside building above the Mediterranean at golden hour',
    coords: 'N 41° 50′ · E 3° 10′',
    place: 'Costa Brava · España',
  },
  {
    key: 'mediterranean',
    src: mediterraneanUrl,
    alt: 'A Mediterranean coast at sunset with a chapel set back on the cliff',
    coords: 'N 41° 07′ · E 1° 15′',
    place: 'Tarragona · España',
  },
  {
    key: 'portovenere',
    src: portovenereUrl,
    alt: 'A coastal cliffside building above a rocky Ligurian shore at golden hour',
    coords: 'N 44° 03′ · E 9° 50′',
    place: 'Portovenere · Italia',
  },
  {
    key: 'kyoto',
    src: kyotoUrl,
    alt: 'A traditional Japanese tatami room opening onto a wooded slope through paper screens',
    coords: 'N 35° 00′ · E 135° 46′',
    place: 'Kyōto · 日本',
  },
]

const COVER_IDX_KEY = 'holidaze:v1:home-cover-rotation-idx'

// Survives React 18 StrictMode's dev unmount-remount so the index doesn't
// double-advance. Resets on real page reload (module re-evaluates).
let cachedForThisLoad: HeroCover | null = null

function readStoredIdx(): number {
  try {
    const raw = localStorage.getItem(COVER_IDX_KEY)
    if (raw === null) return -1
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : -1
  } catch {
    return -1
  }
}

/**
 * Pick this page-load's cover, advancing the rotation index in localStorage.
 * Fails open on storage errors — returns the first cover and skips the write.
 */
export function pickHeroCover(): HeroCover {
  if (cachedForThisLoad !== null) return cachedForThisLoad

  const previous = readStoredIdx()
  const next = (previous + 1 + HERO_COVERS.length) % HERO_COVERS.length

  try {
    localStorage.setItem(COVER_IDX_KEY, String(next))
  } catch {
    // Persistence failed — accept; next mount picks the same cover.
  }

  const cover = HERO_COVERS[next] ?? HERO_COVERS[0]
  cachedForThisLoad = cover
  return cover
}

/** Test-only: clear the module-level page-load cache between cases. */
export function _resetHeroCoverCacheForTests(): void {
  cachedForThisLoad = null
}
