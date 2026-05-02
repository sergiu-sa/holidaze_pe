import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { BrowserRouter } from 'react-router-dom'

import { ToastProvider } from './components/ui/ToastProvider'
import { AuthProvider } from './hooks/useAuth'
import { AppRoutes } from './routes/AppRoutes'

// AuthProvider sits above the router so useAuth is reachable from any route.
// Vercel Analytics + Speed Insights are no-ops on localhost.
export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
