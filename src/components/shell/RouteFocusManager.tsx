import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function RouteFocusManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    const anchor = document.querySelector<HTMLElement>('[data-route-anchor]')
    if (anchor) {
      anchor.focus({ preventScroll: false })
    }
  }, [pathname])

  return null
}
