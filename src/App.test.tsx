import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ToastProvider } from './components/ui/ToastProvider'
import { AuthProvider } from './hooks/useAuth'
import { AppRoutes } from './routes/AppRoutes'

// MemoryRouter substitutes for the BrowserRouter that <App> mounts in production.
// AuthProvider + ToastProvider mirror App.tsx so the Topbar's auth slot can render.
function renderAt(path: string) {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  )
}

describe('App (smoke)', () => {
  it('renders the Home hero h1 at /', async () => {
    renderAt('/')
    expect(
      await screen.findByRole('heading', { level: 1, name: /stay somewhere particular/i }),
    ).toBeInTheDocument()
  })

  it('exposes a skip link to #main at /', async () => {
    renderAt('/')
    expect(await screen.findByRole('link', { name: /skip to main content/i })).toHaveAttribute(
      'href',
      '#main',
    )
  })

  it('renders the topbar nav links at /', async () => {
    renderAt('/')
    await screen.findByRole('heading', { level: 1 })
    // Nav and footer share labels — both are valid; assert at least one exists.
    expect(screen.getAllByRole('link', { name: /^home$/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /^venues$/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /^atlas$/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /^hosts$/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
  })

  it('renders the 404 page for an unknown path', async () => {
    renderAt('/no-such-page')
    expect(
      await screen.findByRole('heading', { level: 1, name: /off the atlas/i }),
    ).toBeInTheDocument()
  })
})
