import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { BrowserRouter } from 'react-router-dom'

import { AppRoutes } from './routes/AppRoutes'

// App — root component. Provides the BrowserRouter and mounts the route tree.
// Vercel Analytics + Speed Insights are no-ops on localhost; only ship telemetry
// from the deployed origin (cleared by Vercel project settings).
export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  )
}
