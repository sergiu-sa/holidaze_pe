import { Outlet } from 'react-router-dom'

import { SkipLink } from '../ui'
import { Footer } from './Footer'
import { RouteErrorBoundary } from './RouteErrorBoundary'
import { RouteFocusManager } from './RouteFocusManager'
import { Topbar } from './Topbar'

// AppLayout — composition root for layout-wrapped pages. The Outlet is wrapped
// in RouteErrorBoundary so a page render error doesn't take down the chrome.
export function AppLayout() {
  return (
    <>
      <RouteFocusManager />
      <SkipLink />
      <Topbar />
      <RouteErrorBoundary>
        <Outlet />
      </RouteErrorBoundary>
      <Footer />
    </>
  )
}
