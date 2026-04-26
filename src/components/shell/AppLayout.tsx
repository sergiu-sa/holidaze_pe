import { Outlet } from 'react-router-dom'

import { Footer } from './Footer'
import { RouteErrorBoundary } from './RouteErrorBoundary'
import { SkipLink } from './SkipLink'
import { Topbar } from './Topbar'

// AppLayout — composition root for layout-wrapped pages. The Outlet is wrapped
// in RouteErrorBoundary so a page render error doesn't take down the chrome.
export function AppLayout() {
  return (
    <>
      <SkipLink />
      <Topbar />
      <RouteErrorBoundary>
        <Outlet />
      </RouteErrorBoundary>
      <Footer />
    </>
  )
}
