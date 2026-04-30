import { useCallback, useEffect, useRef, useState } from 'react'

interface CursorState {
  /** Plate-relative position in % (0..100). null when outside. */
  x: number
  y: number
  /** Inverse-projected coordinates. */
  lat: number
  lng: number
}

export interface PlateCursorProps {
  /** Ref to the .atlas__plate that this overlay anchors to. */
  plateRef: React.RefObject<HTMLElement>
}

/**
 * Crosshair + live-coords HUD overlay. Inverse-projects pointermove inside
 * the plate to lat/lng for the HUD chip. Pure presentation; no zoom/pan.
 */
export function PlateCursor({ plateRef }: PlateCursorProps) {
  const [cursor, setCursor] = useState<CursorState | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)

  const onMove = useCallback(
    (e: PointerEvent) => {
      const plate = plateRef.current
      if (!plate) return
      const rect = plate.getBoundingClientRect()
      const fx = (e.clientX - rect.left) / rect.width
      const fy = (e.clientY - rect.top) / rect.height
      if (fx < 0 || fx > 1 || fy < 0 || fy > 1) {
        setCursor(null)
        return
      }
      // Inverse equirectangular projection (viewBox 0..360 / 0..180).
      const lng = fx * 360 - 180
      const lat = 90 - fy * 180
      setCursor({ x: fx * 100, y: fy * 100, lat, lng })
    },
    [plateRef],
  )

  const onLeave = useCallback(() => {
    setCursor(null)
  }, [])

  useEffect(() => {
    const plate = plateRef.current
    if (!plate) return
    plate.addEventListener('pointermove', onMove)
    plate.addEventListener('pointerleave', onLeave)
    return () => {
      plate.removeEventListener('pointermove', onMove)
      plate.removeEventListener('pointerleave', onLeave)
    }
  }, [plateRef, onMove, onLeave])

  const lat = cursor?.lat ?? null
  const lng = cursor?.lng ?? null

  return (
    <>
      <div
        ref={overlayRef}
        className={`atp__crosshair ${cursor ? 'is-shown' : ''}`}
        aria-hidden="true"
      >
        <div
          className="atp__crosshair__v"
          style={{ left: cursor ? `${String(cursor.x)}%` : '50%' }}
        />
        <div
          className="atp__crosshair__h"
          style={{ top: cursor ? `${String(cursor.y)}%` : '50%' }}
        />
        <div
          className="atp__crosshair__pin"
          style={{
            left: cursor ? `${String(cursor.x)}%` : '50%',
            top: cursor ? `${String(cursor.y)}%` : '50%',
          }}
        />
      </div>
      <div className="atp__hud" aria-live="off">
        <span className="atp__hud__pill">LIVE</span>
        <span className="atp__hud__row">
          <span className="atp__hud__key">lat</span>
          <span className="atp__hud__val">
            {lat !== null
              ? `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`
              : '—'}
          </span>
        </span>
        <span className="atp__hud__row">
          <span className="atp__hud__key">lng</span>
          <span className="atp__hud__val">
            {lng !== null
              ? `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`
              : '—'}
          </span>
        </span>
      </div>
    </>
  )
}
