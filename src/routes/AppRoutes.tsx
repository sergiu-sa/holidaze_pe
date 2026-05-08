import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AuthGuard } from '../components/auth/AuthGuard'
import { RoleGuard } from '../components/auth/RoleGuard'
import { AppLayout } from '../components/shell/AppLayout'

const Home = lazy(() => import('../pages/Home'))
const Venues = lazy(() => import('../pages/Venues'))
const VenueDetail = lazy(() => import('../pages/VenueDetail'))
const Hosts = lazy(() => import('../pages/Hosts'))
const Atlas = lazy(() => import('../pages/Atlas'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const ProfileShell = lazy(() =>
  import('../components/profile').then((m) => ({ default: m.ProfileShell })),
)
const ProfileOverview = lazy(() => import('../pages/ProfileOverview'))
const ProfileBookings = lazy(() => import('../pages/ProfileBookings'))
const ProfileAvatar = lazy(() => import('../pages/ProfileAvatar'))
const ProfileVenues = lazy(() => import('../pages/ProfileVenues'))
const ProfileVenuesNew = lazy(() => import('../pages/ProfileVenuesNew'))
const ProfileVenuesEdit = lazy(() => import('../pages/ProfileVenuesEdit'))
const ProfileVenuesBookings = lazy(() => import('../pages/ProfileVenuesBookings'))
const BookingReceipt = lazy(() => import('../pages/BookingReceipt'))
const NotFound = lazy(() => import('../pages/NotFound'))

function PageFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="w-full h-1 bg-ivory-deep overflow-hidden"
    >
      <div className="h-full bg-cinnabar animate-pulse w-1/3" />
    </div>
  )
}

// The 404 route is a sibling of the layout route so it renders without chrome.
export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/hosts" element={<Hosts />} />
          <Route path="/atlas" element={<Atlas />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfileShell />
              </AuthGuard>
            }
          >
            <Route index element={<ProfileOverview />} />
            <Route path="bookings" element={<ProfileBookings />} />
            <Route path="avatar" element={<ProfileAvatar />} />
            <Route
              path="venues"
              element={
                // eslint-disable-next-line jsx-a11y/aria-role -- `role` here is the RoleGuard prop, not an ARIA attribute
                <RoleGuard role="manager">
                  <ProfileVenues />
                </RoleGuard>
              }
            />
            <Route
              path="venues/new"
              element={
                // eslint-disable-next-line jsx-a11y/aria-role -- `role` here is the RoleGuard prop, not an ARIA attribute
                <RoleGuard role="manager">
                  <ProfileVenuesNew />
                </RoleGuard>
              }
            />
            <Route
              path="venues/:id/edit"
              element={
                // eslint-disable-next-line jsx-a11y/aria-role -- `role` here is the RoleGuard prop, not an ARIA attribute
                <RoleGuard role="manager">
                  <ProfileVenuesEdit />
                </RoleGuard>
              }
            />
            <Route
              path="venues/:id/bookings"
              element={
                // eslint-disable-next-line jsx-a11y/aria-role -- `role` here is the RoleGuard prop, not an ARIA attribute
                <RoleGuard role="manager">
                  <ProfileVenuesBookings />
                </RoleGuard>
              }
            />
          </Route>
          <Route
            path="/bookings/:id"
            element={
              <AuthGuard>
                <BookingReceipt />
              </AuthGuard>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
