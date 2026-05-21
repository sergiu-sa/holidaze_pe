interface LatLng {
  lat: number
  lng: number
}

/** Geographic centroid of a list of {lat, lng} points. */
export function centroid(points: readonly LatLng[]): LatLng | null {
  if (points.length === 0) return null
  let sumLat = 0
  let sumLng = 0
  let count = 0
  for (const p of points) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue
    sumLat += p.lat
    sumLng += p.lng
    count += 1
  }
  if (count === 0) return null
  return { lat: sumLat / count, lng: sumLng / count }
}

/** Bearing in degrees clockwise from North, from world centre (0,0) to a point. Used by the compass dial. */
export function bearingFromCentre(point: LatLng): number {
  // simple atan2 — for visual purposes we treat the projection as flat
  const angle = Math.atan2(point.lng, point.lat)
  const degrees = (angle * 180) / Math.PI
  return (degrees + 360) % 360
}
