import { BrowserRouter } from 'react-router-dom'

import { AppRoutes } from './routes/AppRoutes'

// App — root component. Provides the BrowserRouter and mounts the route tree.
export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
