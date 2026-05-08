import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { BrowserRouter } from 'react-router-dom'

import { ConfirmDialogProvider } from './components/ui/ConfirmDialog'
import { ToastProvider } from './components/ui/ToastProvider'
import { AuthProvider } from './hooks/useAuth'
import { AppRoutes } from './routes/AppRoutes'

// AuthProvider sits above the router so useAuth is reachable from any route.
// ToastProvider wraps ConfirmDialogProvider so confirm-then-toast flows can fire toasts.
// Vercel Analytics + Speed Insights are no-ops on localhost.
export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <BrowserRouter>
            <AppRoutes />
            <Analytics />
            <SpeedInsights />
          </BrowserRouter>
        </ConfirmDialogProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
